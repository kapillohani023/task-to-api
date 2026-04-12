"use server";

import { auth } from "@/app/auth";
import { createAgent, getAgent, updateAgent, deleteAgent } from "@/lib/agent";
import { refresh } from "next/cache";

export type AgentFormState = { error: string | null; success: boolean };

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

  await updateAgent(agentId, {
    name: name.trim(),
    task: task.trim(),
    temperature,
    inputSchema: typeof inputSchema === "string" ? inputSchema : "",
    outputSchema: typeof outputSchema === "string" ? outputSchema : "",
    method,
  });

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
