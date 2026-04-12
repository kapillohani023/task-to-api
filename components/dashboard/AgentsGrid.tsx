import type { Agent } from "@prisma/client";
import { AgentCard } from "./AgentCard";
import { T2ATypography } from "@/components/ui/T2ATypography";

export function AgentsGrid({ agents }: { agents: Agent[] }) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <T2ATypography variant="muted">No agents yet.</T2ATypography>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
