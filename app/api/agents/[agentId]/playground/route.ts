import { NextRequest } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/db";
import { classifyRunError, runAgent, type RunOverrides } from "@/lib/run-agent";
import type { RunEvent } from "@/lib/run-events";

type RouteParams = { params: Promise<{ agentId: string }> };

function clampOverrides(raw: unknown): RunOverrides {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const num = (v: unknown, min: number, max: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined;
  };

  return {
    temperature: num(o.temperature, 0, 1),
    maxToolRounds: num(o.maxToolRounds, 1, 50),
    timeoutMs: num(o.timeoutMs, 1000, 300000),
  };
}

/**
 * Session-guarded run with a streaming NDJSON trace (playground.md §5.3–5.5).
 * Deliberately NOT bearer-authenticated: the browser should never need the
 * agent token to test, and the token stays copy-only in the UI.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { user: true, mcpServers: true },
  });

  if (!agent || agent.userId !== session.user.id) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  if (!agent.user.geminiApiKey) {
    return Response.json({ error: "No Gemini API key set." }, { status: 400 });
  }

  let payload: { body?: unknown; overrides?: unknown } = {};
  try {
    payload = await req.json();
  } catch {
    /* An empty request body is valid — GET agents send nothing. */
  }

  const overrides = clampOverrides(payload.overrides);
  const body =
    agent.method === "POST" && payload.body && typeof payload.body === "object"
      ? (payload.body as Record<string, unknown>)
      : null;

  const encoder = new TextEncoder();
  const startedAt = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: RunEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          closed = true;
        }
      };

      send({ type: "accepted", at: 0 });

      try {
        const result = await runAgent(agent, body, {
          signal: req.signal,
          onEvent: send,
          overrides,
          startedAt,
        });

        send({
          type: "result",
          at: Date.now() - startedAt,
          ms: Date.now() - startedAt,
          raw: result.raw,
          data: result.data,
          wrapped: result.wrapped,
        });
      } catch (e) {
        const { kind, message } = classifyRunError(e);
        send({
          type: "error",
          at: Date.now() - startedAt,
          ms: Date.now() - startedAt,
          kind,
          message,
        });
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          /* Already closed by an aborted client. */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
