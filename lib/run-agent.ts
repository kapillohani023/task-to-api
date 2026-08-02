import type { Prisma } from "@prisma/client";
import { GeminiService, TOOL_MODEL } from "@/lib/gemini";
import { McpServerUnreachableError, openMcpSession, withTimeout } from "@/lib/mcp-runtime";
import type { RunEventSink } from "@/lib/run-events";

export type AgentWithUser = Prisma.AgentGetPayload<{
  include: { user: true; mcpServers: true };
}>;

/** Session-only knobs from the playground; never persisted. */
export type RunOverrides = {
  temperature?: number;
  maxToolRounds?: number;
  timeoutMs?: number;
};

export type RunResult = {
  /** Parsed value, or `{ result: raw }` when the model's text isn't JSON. */
  data: unknown;
  /** The model's text before JSON.parse — the playground's Raw tab. */
  raw: string;
  wrapped: boolean;
  rounds: number;
  toolCount: number;
};

export function buildUserPrompt(
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

/**
 * Execute an agent. Extracted from the public route handler so the playground
 * can observe the middle of a run; with no `onEvent` the behaviour is exactly
 * what the route did before (playground.md §5.1).
 */
export async function runAgent(
  agent: AgentWithUser,
  body: Record<string, unknown> | null,
  options: {
    signal?: AbortSignal;
    onEvent?: RunEventSink;
    overrides?: RunOverrides;
    startedAt?: number;
  } = {}
): Promise<RunResult> {
  const { signal, onEvent, overrides = {}, startedAt = Date.now() } = options;

  const temperature = overrides.temperature ?? agent.temperature;
  const maxToolRounds = overrides.maxToolRounds ?? agent.maxToolRounds;
  const timeoutMs = overrides.timeoutMs ?? agent.timeoutMs;

  const gemini = new GeminiService(agent.user.geminiApiKey);
  const userPrompt = buildUserPrompt(agent, body);
  const useMcp = agent.mcpEnabled && agent.mcpServers.length > 0;

  let raw: string;
  let rounds = 0;
  let toolCount = 0;

  if (!useMcp) {
    onEvent?.({
      type: "gen:start",
      at: Date.now() - startedAt,
      model: TOOL_MODEL,
      temperature,
      toolCount: 0,
    });
    const began = Date.now();
    raw = await gemini.generate({
      systemPrompt: agent.task,
      temperature,
      userPrompt,
      signal,
    });
    onEvent?.({
      type: "gen:end",
      at: Date.now() - startedAt,
      ms: Date.now() - began,
      rounds: 0,
    });
  } else {
    // Live discovery + SDK-driven tool loop. Fail-fast if a server is unreachable.
    const session = await openMcpSession(agent.mcpServers, { onEvent, startedAt });
    try {
      toolCount = session.tools.length;
      onEvent?.({
        type: "gen:start",
        at: Date.now() - startedAt,
        model: TOOL_MODEL,
        temperature,
        toolCount,
      });
      const began = Date.now();

      if (session.tools.length === 0) {
        raw = await gemini.generate({
          systemPrompt: agent.task,
          temperature,
          userPrompt,
          signal,
        });
      } else {
        const detailed = await withTimeout(
          gemini.generateWithToolsDetailed({
            systemPrompt: agent.task,
            temperature,
            userPrompt,
            tools: session.tools,
            maxRounds: maxToolRounds,
            signal,
          }),
          timeoutMs,
          `Agent timed out after ${timeoutMs}ms.`
        );
        raw = detailed.text;
        rounds = detailed.rounds;
      }

      onEvent?.({
        type: "gen:end",
        at: Date.now() - startedAt,
        ms: Date.now() - began,
        rounds,
      });
    } finally {
      await session.close();
    }
  }

  if (agent.outputSchema) {
    try {
      return { data: JSON.parse(raw), raw, wrapped: false, rounds, toolCount };
    } catch {
      return { data: { result: raw }, raw, wrapped: true, rounds, toolCount };
    }
  }

  return { data: { result: raw }, raw, wrapped: false, rounds, toolCount };
}

/** Classify a thrown error for the trace + response cards. */
export function classifyRunError(
  e: unknown
): { kind: "mcp" | "timeout" | "model" | "aborted" | "unknown"; message: string } {
  if (e instanceof McpServerUnreachableError) return { kind: "mcp", message: e.message };

  const message = e instanceof Error ? e.message : "Agent execution failed";

  if (e instanceof Error && (e.name === "AbortError" || /abort/i.test(message))) {
    return { kind: "aborted", message: "Run cancelled." };
  }
  if (/timed out after/i.test(message)) return { kind: "timeout", message };
  if (e instanceof Error) return { kind: "model", message };

  return { kind: "unknown", message };
}
