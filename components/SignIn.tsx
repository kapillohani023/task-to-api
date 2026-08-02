import { auth, signIn } from "@/app/auth";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { T2ACard } from "@/components/ui/T2ACard";
import { T2AButton } from "@/components/ui/T2AButton";

export async function SignIn() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <T2ACard padding="lg" className="w-full max-w-sm shadow-pop">
        <div className="mb-6 flex flex-col items-center gap-1">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-fg">T2A</h1>
          <p className="font-mono text-[13px] tracking-tight text-fg-subtle">
            task → api
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <T2AButton
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <FcGoogle className="h-5 w-5" />
            Sign in with Google
          </T2AButton>
        </form>
        <p className="mt-6 text-center text-xs text-fg-subtle">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-fg-muted">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-fg-muted">
            Privacy Policy
          </a>
          .
        </p>
      </T2ACard>
    </div>
  );
}
