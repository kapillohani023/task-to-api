import { prisma } from "@/lib/db";
import { GeminiService } from "@/lib/gemini";
import { openMcpSession, withTimeout } from "@/lib/mcp-runtime";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

type AgentWithUser = Prisma.AgentGetPayload<{
  include: { user: true; mcpServers: true };
}>;
type RouteParams = { params: Promise<{ agentId: string }> };
type AuthorizedAgentResult =
  | { agent: AgentWithUser; error: null; status: 200 }
  | { agent: null; error: string; status: 401 | 404 };

async function getAuthorizedAgent(
  agentId: string,
  req: NextRequest
): Promise<AuthorizedAgentResult> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { user: true, mcpServers: true },
  });

  if (!agent) return { agent: null, error: "Agent not found", status: 404 };

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== agent.token) {
    return { agent: null, error: "Unauthorized", status: 401 };
  }

  return { agent, error: null, status: 200 };
}

function buildUserPrompt(
  agent: AgentWithUser,
  body: Record<string, unknown> | null
): string {
  const parts: string[] = [];

  if (agent.inputSchema) {
    parts.push(`The input conforms to this JSON schema:\n${agent.inputSchema}`);
  }

  if (agent.outputSchema) {
    parts.push(
      `You MUST respond with ONLY a raw JSON object that conforms to this JSON schema. Do NOT wrap it in markdown code blocks, backticks, or any other characters. The response must be directly parseable by JSON.parse().\n${agent.outputSchema}`
    );
  }

  if (body !== null) {
    parts.push(`Input:\n${JSON.stringify(body, null, 2)}`);
  }

  return parts.join("\n\n");
}

async function generateOutput(
  agent: AgentWithUser,
  gemini: GeminiService,
  userPrompt: string
): Promise<string> {
  const useMcp = agent.mcpEnabled && agent.mcpServers.length > 0;
  if (!useMcp) {
    return gemini.generate({
      systemPrompt: agent.task,
      temperature: agent.temperature,
      userPrompt,
    });
  }

  // Live discovery + SDK-driven tool loop. Fail-fast if a server is unreachable.
  const session = await openMcpSession(agent.mcpServers);
  try {
    if (session.tools.length === 0) {
      return await gemini.generate({
        systemPrompt: agent.task,
        temperature: agent.temperature,
        userPrompt,
      });
    }

    return await withTimeout(
      gemini.generateWithTools({
        systemPrompt: agent.task,
        temperature: agent.temperature,
        userPrompt,
        tools: session.tools,
        maxRounds: agent.maxToolRounds,
      }),
      agent.timeoutMs,
      `Agent timed out after ${agent.timeoutMs}ms.`
    );
  } finally {
    await session.close();
  }
}

async function runAgent(
  agent: AgentWithUser,
  body: Record<string, unknown> | null
) {
  const gemini = new GeminiService(agent.user.geminiApiKey);

  const userPrompt = buildUserPrompt(agent, body);

  const output = await generateOutput(agent, gemini, userPrompt);

  if (agent.outputSchema) {
    try {
      return JSON.parse(output);
    } catch {
      return { result: output };
    }
  }

  return { result: output };
}

function getMethodMismatchResponse(agentMethod: string, requestMethod: string) {
  if (agentMethod === requestMethod) return null;

  return Response.json(
    { error: "Method Not Allowed" },
    {
      status: 405,
      headers: {
        Allow: agentMethod,
      },
    }
  );
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { agentId } = await params;
  const { agent, error, status } = await getAuthorizedAgent(agentId, req);

  if (error) return Response.json({ error }, { status });
  const methodMismatchResponse = getMethodMismatchResponse(agent!.method, req.method);
  if (methodMismatchResponse) return methodMismatchResponse;

  try {
    const data = await runAgent(agent!, null);
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Agent execution failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { agentId } = await params;
  const { agent, error, status } = await getAuthorizedAgent(agentId, req);

  if (error) return Response.json({ error }, { status });
  const methodMismatchResponse = getMethodMismatchResponse(agent!.method, req.method);
  if (methodMismatchResponse) return methodMismatchResponse;

  try {
    const body = await req.json();
    const data = await runAgent(agent!, body);
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Agent execution failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
