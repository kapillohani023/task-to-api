import { auth } from "@/app/auth";
import { notFound, redirect } from "next/navigation";
import { getAgent } from "@/lib/agent";
import { AgentDetailPage } from "@/components/agent/AgentDetailPage";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { agentId } = await params;
  const agent = await getAgent(agentId);

  if (!agent || agent.userId !== session.user.id) notFound();

  return <AgentDetailPage agent={agent} />;
}
