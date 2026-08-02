import type { RunOverrides } from "@/lib/run-agent";

/** Everything the playground needs about an agent — no token-adjacent secrets. */
export type PlaygroundAgent = {
  id: string;
  name: string;
  method: "GET" | "POST";
  task: string;
  temperature: number;
  maxToolRounds: number;
  timeoutMs: number;
  inputSchema: string;
  outputSchema: string;
  mcpEnabled: boolean;
  token: string;
  servers: { url: string; disabledTools: string[] }[];
};

export type AgentOption = { id: string; name: string; method: string };

export type Overrides = Required<RunOverrides>;

export const defaultOverrides = (agent: PlaygroundAgent): Overrides => ({
  temperature: agent.temperature,
  maxToolRounds: agent.maxToolRounds,
  timeoutMs: agent.timeoutMs,
});
