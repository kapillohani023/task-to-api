import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { getAgentsByUser } from "@/lib/agent";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const agents = await getAgentsByUser(session.user.id);

  // The Gemini-key prompt lives in the shell topbar (app/(app)/layout.tsx).
  return <DashboardContent agents={agents} />;
}
