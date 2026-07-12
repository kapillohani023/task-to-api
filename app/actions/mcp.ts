"use server";

import { auth } from "@/app/auth";
import { getMcpServer } from "@/lib/mcp-server";
import { connectMcpServer, listMcpTools, parseHeaders } from "@/lib/mcp";
import type { McpHeader } from "@/lib/mcp-types";

export type DiscoverToolsResult =
  | { error: string; tools: null }
  | { error: null; tools: { name: string; description: string }[] };

/**
 * Connect live to an MCP server and list its tools. Read-only — used by the
 * form UI so the user can pick which tools to enable before saving.
 *
 * If `serverId` is given, blank header values are backfilled from the stored
 * secret for that server, so the user need not re-type tokens to discover.
 */
export async function discoverServerToolsAction(
  serverId: string | null,
  url: string,
  headers: McpHeader[]
): Promise<DiscoverToolsResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated.", tools: null };

  let effectiveHeaders: Record<string, string> = {};
  for (const h of headers) {
    if (h && typeof h.key === "string" && h.key.trim() !== "") {
      effectiveHeaders[h.key] = typeof h.value === "string" ? h.value : "";
    }
  }

  if (serverId) {
    const server = await getMcpServer(serverId);
    if (!server || server.agent.userId !== session.user.id)
      return { error: "Server not found.", tools: null };
    const stored = parseHeaders(server.headers);
    // Backfill blanks with stored secrets.
    effectiveHeaders = Object.fromEntries(
      Object.entries(effectiveHeaders).map(([k, v]) => [k, v !== "" ? v : stored[k] ?? ""])
    );
  }

  try {
    const client = await connectMcpServer(url, effectiveHeaders);
    try {
      const tools = await listMcpTools(client);
      return { error: null, tools: tools.map((t) => ({ name: t.name, description: t.description })) };
    } finally {
      await client.close();
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to connect.", tools: null };
  }
}
