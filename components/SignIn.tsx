import { auth, signIn } from "@/app/auth";
import { redirect } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { T2ACard } from "@/components/ui/T2ACard";
import { T2AButton } from "@/components/ui/T2AButton";

export async function SignIn() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <T2ACard variant="default" padding="lg" className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-900">
          T2A - Task to API
        </h1>
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
        <p className="mt-6 text-center text-xs text-zinc-500">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-zinc-700">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-zinc-700">
            Privacy Policy
          </a>
          .
        </p>
      </T2ACard>
    </div>
  );
}
