import { auth } from "@/app/auth";
import { notFound, redirect } from "next/navigation";
import { getAgentWithServers } from "@/lib/agent";
import { parseHeaders, parseDisabledTools } from "@/lib/mcp";
import { AgentDetailPage } from "@/components/agent/AgentDetailPage";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { agentId } = await params;
  const agent = await getAgentWithServers(agentId);

  if (!agent || agent.userId !== session.user.id) notFound();

  // Strip header secret values before sending to the client (write-only).
  const clientServers = agent.mcpServers.map((s) => ({
    id: s.id,
    url: s.url,
    headerKeys: Object.keys(parseHeaders(s.headers)),
    disabledTools: [...parseDisabledTools(s.disabledTools)],
  }));

  const { mcpServers, ...agentFields } = agent;
  void mcpServers; // relation carries header secrets — excluded from client props

  return <AgentDetailPage agent={agentFields} servers={clientServers} />;
}
