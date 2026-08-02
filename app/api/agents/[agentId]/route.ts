import { prisma } from "@/lib/db";
import { runAgent, type AgentWithUser } from "@/lib/run-agent";
import { NextRequest } from "next/server";

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
    // No event sink here — the public contract is the final value only.
    const { data } = await runAgent(agent!, null);
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
    const { data } = await runAgent(agent!, body);
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Agent execution failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
