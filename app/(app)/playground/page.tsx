import { Terminal } from "lucide-react";
import { loadPlayground } from "@/lib/playground";
import { PlaygroundPage } from "@/components/playground/PlaygroundPage";
import { T2AEmptyState } from "@/components/ui/T2AEmptyState";

export default async function Playground() {
  const data = await loadPlayground();

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6">
        <T2AEmptyState
          icon={Terminal}
          title="No agents to run"
          description="Create an agent first, then come back to test it here."
        />
      </main>
    );
  }

  return <PlaygroundPage {...data} />;
}
