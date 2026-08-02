import { redirect } from "next/navigation";
import { auth } from "@/app/auth";
import { getUser } from "@/lib/user";
import { Topbar } from "@/components/shell/Topbar";
import { AppRail } from "@/components/shell/AppRail";
import { BreadcrumbProvider } from "@/components/shell/Breadcrumbs";

/** Signed-in app shell: topbar + icon rail (MASTER §4). */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const user = await getUser(session.user.id);

  return (
    <BreadcrumbProvider>
      <div className="flex min-h-screen flex-col bg-base">
        <Topbar
          hasKey={Boolean(user?.geminiApiKey)}
          name={session.user.name ?? null}
          email={session.user.email ?? null}
          image={session.user.image ?? null}
        />
        <div className="flex flex-1">
          <AppRail />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
