import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { getAgentsByUser, getAgentWithServers } from "@/lib/agent";
import { getUser } from "@/lib/user";
import { getBaseUrl } from "@/lib/base-url";
import { parseDisabledTools } from "@/lib/mcp";
import type { AgentOption, PlaygroundAgent } from "@/components/playground/types";

export type PlaygroundData = {
  agent: PlaygroundAgent;
  agents: AgentOption[];
  baseUrl: string;
  hasKey: boolean;
};

/**
 * Shared loader for `/playground` and `/agent/[id]/playground`.
 * Returns null when the user has no agents yet — the caller renders the
 * empty state. MCP header *values* never leave the server.
 */
export async function loadPlayground(
  agentId?: string
): Promise<PlaygroundData | null> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [list, user] = await Promise.all([
    getAgentsByUser(session.user.id),
    getUser(session.user.id),
  ]);

  if (list.length === 0) return null;

  const targetId = agentId ?? list[0].id;
  const agent = await getAgentWithServers(targetId);
  if (!agent || agent.userId !== session.user.id) return null;

  return {
    agent: {
      id: agent.id,
      name: agent.name,
      method: agent.method as "GET" | "POST",
      task: agent.task,
      temperature: agent.temperature,
      maxToolRounds: agent.maxToolRounds,
      timeoutMs: agent.timeoutMs,
      inputSchema: agent.inputSchema,
      outputSchema: agent.outputSchema,
      mcpEnabled: agent.mcpEnabled,
      token: agent.token,
      servers: agent.mcpServers.map((s) => ({
        url: s.url,
        disabledTools: [...parseDisabledTools(s.disabledTools)],
      })),
    },
    agents: list.map((a) => ({ id: a.id, name: a.name, method: a.method })),
    baseUrl: await getBaseUrl(),
    hasKey: Boolean(user?.geminiApiKey),
  };
}
