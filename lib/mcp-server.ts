import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { parseHeaders } from "@/lib/mcp";
import type { McpServerInput } from "@/lib/mcp-types";

export function getMcpServer(id: string) {
  return prisma.mcpServer.findUnique({
    where: { id },
    include: { agent: { select: { id: true, userId: true } } },
  });
}

export function getMcpServersByAgent(agentId: string) {
  return prisma.mcpServer.findMany({
    where: { agentId },
    orderBy: { createdAt: "asc" },
  });
}

export function createMcpServer(data: Prisma.McpServerCreateInput) {
  return prisma.mcpServer.create({ data });
}

export function updateMcpServer(id: string, data: Prisma.McpServerUpdateInput) {
  return prisma.mcpServer.update({ where: { id }, data });
}

export function deleteMcpServer(id: string) {
  return prisma.mcpServer.delete({ where: { id } });
}

export function isValidMcpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Reconcile an agent's MCP servers to match `inputs` in one pass:
 * update servers with a known id, create new ones (id === null), and delete
 * any existing server not present in `inputs`. Blank header values on an
 * existing server preserve the stored secret (write-only headers).
 */
export async function syncAgentMcpServers(agentId: string, inputs: McpServerInput[]) {
  const existing = await prisma.mcpServer.findMany({ where: { agentId } });
  const existingById = new Map(existing.map((s) => [s.id, s]));
  const keepIds = new Set<string>();

  const ops: Prisma.PrismaPromise<unknown>[] = [];

  for (const input of inputs) {
    const cleanHeaders = input.headers.filter(
      (h) => h && typeof h.key === "string" && h.key.trim() !== ""
    );
    const disabledTools = JSON.stringify(input.disabledTools ?? []);
    const prev = input.id ? existingById.get(input.id) : undefined;

    if (input.id && prev) {
      const prevHeaders = parseHeaders(prev.headers);
      const merged = cleanHeaders.map((h) => ({
        key: h.key,
        value: h.value.trim() !== "" ? h.value : prevHeaders[h.key] ?? "",
      }));
      keepIds.add(input.id);
      ops.push(
        prisma.mcpServer.update({
          where: { id: input.id },
          data: { url: input.url.trim(), headers: JSON.stringify(merged), disabledTools },
        })
      );
    } else {
      ops.push(
        prisma.mcpServer.create({
          data: {
            url: input.url.trim(),
            headers: JSON.stringify(cleanHeaders),
            disabledTools,
            agentId,
          },
        })
      );
    }
  }

  const toDelete = existing.filter((s) => !keepIds.has(s.id)).map((s) => s.id);
  if (toDelete.length > 0) {
    ops.push(prisma.mcpServer.deleteMany({ where: { id: { in: toDelete } } }));
  }

  await prisma.$transaction(ops);
}
