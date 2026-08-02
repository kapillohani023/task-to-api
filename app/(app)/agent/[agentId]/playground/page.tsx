import { notFound } from "next/navigation";
import { loadPlayground } from "@/lib/playground";
import { PlaygroundPage } from "@/components/playground/PlaygroundPage";

export default async function AgentPlayground({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const data = await loadPlayground(agentId);

  if (!data) notFound();

  return <PlaygroundPage {...data} />;
}
