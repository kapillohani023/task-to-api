import Link from "next/link";
import type { Agent } from "@prisma/client";
import { T2ACard } from "@/components/ui/T2ACard";
import { T2ABadge } from "@/components/ui/T2ABadge";
import { DeleteAgentButton } from "./DeleteAgentButton";
import { getInitials } from "@/lib/util";
import { methodTone } from "@/lib/method";

const METER_SEGMENTS = 8;

export function AgentCard({ agent }: { agent: Agent }) {
  const filled = Math.round(agent.temperature * METER_SEGMENTS);

  return (
    // The link is a stretched overlay rather than a wrapper, so the delete
    // control is a real sibling instead of sitting on top of it (MASTER §7 bug 6).
    <T2ACard className="group relative flex flex-col gap-3 transition-colors duration-[var(--dur-fast)] hover:border-border-strong hover:bg-elevated">
      <Link
        href={`/agent/${agent.id}`}
        className="absolute inset-0 z-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base"
      >
        <span className="sr-only">Open {agent.name}</span>
      </Link>

      <div className="pointer-events-none flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-inset font-mono text-xs font-semibold text-fg-muted">
          {getInitials(agent.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{agent.name}</p>
          <p className="truncate font-mono text-[11px] tracking-tight text-fg-subtle">
            {agent.id}
          </p>
        </div>
        <T2ABadge tone={methodTone(agent.method)}>{agent.method}</T2ABadge>
      </div>

      <p className="pointer-events-none line-clamp-2 text-xs leading-[1.5] text-fg-subtle">
        {agent.task}
      </p>

      <div className="flex items-center justify-between border-t border-border-subtle pt-3">
        <div className="pointer-events-none flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
            temp
          </span>
          <span className="flex items-center gap-0.5" aria-hidden>
            {Array.from({ length: METER_SEGMENTS }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-0.5 rounded-full ${
                  i < filled ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-fg-muted">
            {agent.temperature.toFixed(2)}
          </span>
          {agent.mcpEnabled && (
            <T2ABadge tone="neutral" className="ml-1">
              mcp
            </T2ABadge>
          )}
        </div>
        <div className="relative z-10">
          <DeleteAgentButton agentId={agent.id} agentName={agent.name} />
        </div>
      </div>
    </T2ACard>
  );
}
