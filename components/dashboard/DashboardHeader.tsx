import { signOut } from "@/app/auth";
import { T2AButton } from "@/components/ui/T2AButton";
import { T2ATypography } from "@/components/ui/T2ATypography";
import { ApiKeyButton } from "./ApiKeyButton";
import { AddAgentButton } from "./AddAgentButton";
import { LogOut } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b-2 border-black px-6 py-4">
      <T2ATypography variant="h2">T2A</T2ATypography>
      <div className="flex items-center gap-2">
        <AddAgentButton />
        <ApiKeyButton />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/signin" });
          }}
        >
          <T2AButton type="submit" variant="secondary" size="sm">
            <LogOut size={16} />
            Sign Out
          </T2AButton>
        </form>
      </div>
    </header>
  );
}
