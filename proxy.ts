import NextAuth from "next-auth";
import { authConfig } from "@/app/auth.config";

const { auth } = NextAuth(authConfig);

export async function proxy(
  ...args: Parameters<typeof auth>
): Promise<ReturnType<Awaited<typeof auth>>> {
  return auth(...args);
}

export const config = {
  matcher: ["/((?!api/agents|api/auth|_next|favicon.ico|privacy|terms|signin|login).*)"],
};
