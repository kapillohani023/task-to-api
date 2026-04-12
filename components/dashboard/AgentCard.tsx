import Link from "next/link";
import type { Agent } from "@prisma/client";
import { T2ACard } from "@/components/ui/T2ACard";
import { T2ATypography } from "@/components/ui/T2ATypography";
import { DeleteAgentButton } from "./DeleteAgentButton";
import { getInitials } from "@/lib/util";

export function AgentCard({ agent }: { agent: Agent }) {
  const initials = getInitials(agent.name);

  return (
    <div className="relative">
      <Link href={`/agent/${agent.id}`} className="block">
        <T2ACard
          variant="default"
          padding="lg"
          className="flex cursor-pointer flex-col gap-4 transition-colors hover:bg-zinc-50"
        >
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              {initials}
            </div>
            <T2ATypography variant="h4" className="truncate">
              {agent.name}
            </T2ATypography>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <T2ATypography variant="label">Temperature</T2ATypography>
              <T2ATypography variant="muted">{agent.temperature.toFixed(2)}</T2ATypography>
            </div>
            <span
              className={`rounded border-2 border-black px-2 py-0.5 text-xs font-semibold ${
                agent.method === "GET" ? "bg-green-400" : "bg-yellow-400"
              }`}
            >
              {agent.method}
            </span>
          </div>
        </T2ACard>
      </Link>
      <div className="absolute right-3 top-3">
        <DeleteAgentButton agentId={agent.id} agentName={agent.name} />
      </div>
    </div>
  );
}
