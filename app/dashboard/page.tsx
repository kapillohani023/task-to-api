import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { getAgentsByUser } from "@/lib/agent";
import { getUser } from "@/lib/user";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [agents, user] = await Promise.all([
    getAgentsByUser(session.user.id),
    getUser(session.user.id),
  ]);

  return (
    <DashboardContent
      agents={agents}
      needsApiKey={!user?.geminiApiKey}
    />
  );
}
