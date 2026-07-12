"use server";

import { auth } from "@/app/auth";
import { createAgent, getAgent, updateAgent, deleteAgent } from "@/lib/agent";
import { syncAgentMcpServers, isValidMcpUrl } from "@/lib/mcp-server";
import type { McpServerInput } from "@/lib/mcp-types";
import { refresh } from "next/cache";

export type AgentFormState = { error: string | null; success: boolean };

type ParsedMcp = {
  mcpEnabled: boolean;
  maxToolRounds: number;
  timeoutMs: number;
  servers: McpServerInput[];
};

// Parse + validate the MCP portion of the agent form. Returns an error string
// on invalid input, or the normalized config on success.
function parseMcpConfig(formData: FormData): { error: string } | { config: ParsedMcp } {
  const mcpEnabled = formData.get("mcpEnabled") === "true";
  const maxToolRounds = Math.trunc(Number(formData.get("maxToolRounds")));
  const timeoutMs = Math.trunc(Number(formData.get("timeoutMs")));

  if (isNaN(maxToolRounds) || maxToolRounds < 1 || maxToolRounds > 50)
    return { error: "Max tool rounds must be between 1 and 50." };
  if (isNaN(timeoutMs) || timeoutMs < 1000 || timeoutMs > 300000)
    return { error: "Timeout must be between 1000 and 300000 ms." };

  let servers: McpServerInput[] = [];
  const raw = formData.get("mcpServers");
  if (typeof raw === "string" && raw.trim() !== "") {
    try {
      const parsed = JSON.parse(raw) as McpServerInput[];
      if (!Array.isArray(parsed)) return { error: "Malformed MCP server list." };
      servers = parsed;
    } catch {
      return { error: "Malformed MCP server list." };
    }
  }

  for (const server of servers) {
    if (!isValidMcpUrl(server.url)) return { error: `Invalid server URL: ${server.url}` };
  }

  return { config: { mcpEnabled, maxToolRounds, timeoutMs, servers } };
}

export async function createAgentAction(
  _prevState: AgentFormState,
  formData: FormData
): Promise<AgentFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated.", success: false };

  const name = formData.get("name");
  const task = formData.get("task");
  const temperatureRaw = formData.get("temperature");
  const inputSchema = formData.get("inputSchema");
  const outputSchema = formData.get("outputSchema");
  const token = formData.get("token");
  const method = formData.get("method");

  if (!name || typeof name !== "string" || name.trim() === "")
    return { error: "Name is required.", success: false };
  if (!task || typeof task !== "string" || task.trim() === "")
    return { error: "Task is required.", success: false };
  if (!token || typeof token !== "string" || token.trim() === "")
    return { error: "Token is required.", success: false };
  if (!method || (method !== "GET" && method !== "POST"))
    return { error: "Method must be GET or POST.", success: false };

  const temperature = parseFloat(temperatureRaw as string);
  if (isNaN(temperature) || temperature < 0 || temperature > 1)
    return { error: "Temperature must be between 0 and 1.", success: false };

  await createAgent({
    name: name.trim(),
    task: task.trim(),
    temperature,
    inputSchema: typeof inputSchema === "string" ? inputSchema : "",
    outputSchema: typeof outputSchema === "string" ? outputSchema : "",
    token: token.trim(),
    method,
    user: { connect: { id: session.user.id } },
  });

  refresh();
  return { error: null, success: true };
}

export async function updateAgentAction(
  agentId: string,
  _prevState: AgentFormState,
  formData: FormData
): Promise<AgentFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated.", success: false };

  const existing = await getAgent(agentId);
  if (!existing || existing.userId !== session.user.id)
    return { error: "Agent not found.", success: false };

  const name = formData.get("name");
  const task = formData.get("task");
  const temperatureRaw = formData.get("temperature");
  const inputSchema = formData.get("inputSchema");
  const outputSchema = formData.get("outputSchema");
  const method = formData.get("method");

  if (!name || typeof name !== "string" || name.trim() === "")
    return { error: "Name is required.", success: false };
  if (!task || typeof task !== "string" || task.trim() === "")
    return { error: "Task is required.", success: false };
  if (!method || (method !== "GET" && method !== "POST"))
    return { error: "Method must be GET or POST.", success: false };

  const temperature = parseFloat(temperatureRaw as string);
  if (isNaN(temperature) || temperature < 0 || temperature > 1)
    return { error: "Temperature must be between 0 and 1.", success: false };

  const mcp = parseMcpConfig(formData);
  if ("error" in mcp) return { error: mcp.error, success: false };

  await updateAgent(agentId, {
    name: name.trim(),
    task: task.trim(),
    temperature,
    inputSchema: typeof inputSchema === "string" ? inputSchema : "",
    outputSchema: typeof outputSchema === "string" ? outputSchema : "",
    method,
    mcpEnabled: mcp.config.mcpEnabled,
    maxToolRounds: mcp.config.maxToolRounds,
    timeoutMs: mcp.config.timeoutMs,
  });

  await syncAgentMcpServers(agentId, mcp.config.servers);

  refresh();
  return { error: null, success: true };
}

export async function deleteAgentAction(
  agentId: string
): Promise<{ error: string | null }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  const existing = await getAgent(agentId);
  if (!existing || existing.userId !== session.user.id)
    return { error: "Agent not found." };

  await deleteAgent(agentId);
  refresh();
  return { error: null };
}
