"use client";

import Link from "next/link";
import { RotateCcw, Server, Wrench } from "lucide-react";
import { T2ASlider } from "@/components/ui/T2ASlider";
import { T2AInput } from "@/components/ui/T2AInput";
import { T2ABadge } from "@/components/ui/T2ABadge";
import { T2AEmptyState } from "@/components/ui/T2AEmptyState";
import { typeLabel } from "@/lib/ui";
import { defaultOverrides, type AgentOption, type Overrides, type PlaygroundAgent } from "./types";

export function AgentPane({
  agent,
  agents,
  overrides,
  onOverrides,
  onSelectAgent,
  disabled,
}: {
  agent: PlaygroundAgent;
  agents: AgentOption[];
  overrides: Overrides;
  onOverrides: (next: Overrides) => void;
  onSelectAgent: (id: string) => void;
  disabled?: boolean;
}) {
  const base = defaultOverrides(agent);
  const isOverridden =
    overrides.temperature !== base.temperature ||
    overrides.maxToolRounds !== base.maxToolRounds ||
    overrides.timeoutMs !== base.timeoutMs;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="pg-agent" className={typeLabel}>
          Agent
        </label>
        <select
          id="pg-agent"
          value={agent.id}
          onChange={(e) => onSelectAgent(e.target.value)}
          className="h-9 w-full cursor-pointer rounded-sm border border-border bg-inset px-3 text-sm text-fg transition-colors duration-[var(--dur-fast)] focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent/40"
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id} className="bg-surface">
              {a.name} · {a.method}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={typeLabel}>Overrides</span>
          <div className="flex items-center gap-2">
            {isOverridden && <T2ABadge tone="accent">overridden</T2ABadge>}
            <button
              type="button"
              onClick={() => onOverrides(base)}
              disabled={!isOverridden}
              aria-label="Reset overrides"
              title="Reset overrides"
              className="cursor-pointer rounded-sm p-1 text-fg-subtle transition-colors duration-[var(--dur-fast)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        <T2ASlider
          id="pg-temperature"
          label="Temperature"
          min={0}
          max={1}
          step={0.01}
          value={overrides.temperature}
          onChange={(temperature) => onOverrides({ ...overrides, temperature })}
          disabled={disabled}
        />
        <T2AInput
          id="pg-rounds"
          label="Max rounds"
          type="number"
          min={1}
          max={50}
          value={String(overrides.maxToolRounds)}
          onChange={(e) =>
            onOverrides({ ...overrides, maxToolRounds: Number(e.target.value) })
          }
          disabled={disabled}
        />
        <T2AInput
          id="pg-timeout"
          label="Timeout (ms)"
          type="number"
          min={1000}
          max={300000}
          value={String(overrides.timeoutMs)}
          onChange={(e) => onOverrides({ ...overrides, timeoutMs: Number(e.target.value) })}
          disabled={disabled}
        />
        <p className="text-xs text-fg-subtle">
          Overrides apply to this run only — they are never saved to the agent.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={typeLabel}>Tools</span>
          <Link
            href={`/agent/${agent.id}`}
            className="rounded-sm text-xs font-medium text-fg-muted transition-colors duration-[var(--dur-fast)] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Configure
          </Link>
        </div>

        {!agent.mcpEnabled || agent.servers.length === 0 ? (
          <T2AEmptyState
            icon={Wrench}
            title="No tools"
            description="This agent answers from the prompt alone."
            className="py-6"
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {agent.servers.map((server) => (
              <li
                key={server.url}
                className="rounded-sm border border-border bg-inset px-2.5 py-2"
              >
                <div className="flex items-center gap-2">
                  <Server size={12} className="shrink-0 text-fg-subtle" aria-hidden />
                  <span className="min-w-0 truncate font-mono text-[11px] tracking-tight text-fg-muted">
                    {hostOf(server.url)}
                  </span>
                </div>
                {server.disabledTools.length > 0 && (
                  <p className="mt-1 font-mono text-[11px] text-fg-subtle line-through">
                    {server.disabledTools.join(", ")}
                  </p>
                )}
              </li>
            ))}
            <li className="text-[11px] text-fg-subtle">
              The live tool list is discovered at run time — watch the Trace tab.
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
