import type { Agent } from "@prisma/client";
import { DashboardHeader } from "./DashboardHeader";
import { AgentsGrid } from "./AgentsGrid";
import { GeminiKeyDialog } from "./GeminiKeyDialog";

export function DashboardContent({
  agents,
  needsApiKey,
}: {
  agents: Agent[];
  needsApiKey: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <DashboardHeader />
      <main className="flex flex-1 flex-col p-6">
        <AgentsGrid agents={agents} />
      </main>
      <GeminiKeyDialog open={needsApiKey} />
    </div>
  );
}
