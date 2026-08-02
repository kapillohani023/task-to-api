import type { Agent } from "@prisma/client";
import { SearchX, Terminal } from "lucide-react";
import { AgentCard } from "./AgentCard";
import { T2AEmptyState } from "@/components/ui/T2AEmptyState";
import { AddAgentButton } from "./AddAgentButton";

export function AgentsGrid({
  agents,
  filtered,
}: {
  agents: Agent[];
  /** True when filters are active — changes an empty result from "none exist" to "none match". */
  filtered?: boolean;
}) {
  if (agents.length === 0) {
    return filtered ? (
      <T2AEmptyState
        icon={SearchX}
        title="No matching agents"
        description="Try a different search or clear the filters."
      />
    ) : (
      <T2AEmptyState
        icon={Terminal}
        title="No agents yet"
        description="Describe a task, get an HTTP endpoint."
        action={<AddAgentButton label="Create your first agent" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {agents.map((agent, i) => (
        <div
          key={agent.id}
          className="animate-[t2a-fade-up_240ms_var(--ease-out)_backwards]"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        >
          <AgentCard agent={agent} />
        </div>
      ))}
    </div>
  );
}
