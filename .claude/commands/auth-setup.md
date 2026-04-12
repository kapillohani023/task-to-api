# Auth Setup

## Overview

Authentication uses **NextAuth.js v5** (beta) with **Google OAuth** as the sole provider. The setup is split across two config files to support Edge runtime in middleware.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/auth.config.ts` | Edge-safe base config (provider, pages, authorized callback) |
| `app/auth.ts` | Full auth instance with DB callbacks (signIn, jwt, session) |
| `middleware.ts` | Route protection via NextAuth middleware |
| `app/api/auth/[...nextauth]/route.ts` | Catch-all handler for NextAuth API routes |
| `app/signin/page.tsx` | Sign-in page route |
| `components/SignIn.tsx` | Sign-in UI component |
| `hooks/use-current-user.ts` | Client-side hook to access current user |

---

## Config Split Pattern

NextAuth v5 uses a **two-file pattern** to avoid Edge runtime issues with Prisma:

### `app/auth.config.ts` — Edge-safe config
```ts
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/signin",         // Custom sign-in page
  },
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;           // Allow access only if session exists
    },
  },
} satisfies NextAuthConfig;
```

### `app/auth.ts` — Full auth with DB access
```ts
import NextAuth from "next-auth";
import { prisma } from "@/lib/db";
import { authConfig } from "@/app/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    // Create user in DB on first login
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existingUser) {
          await prisma.user.create({
            data: { name: user.name || "Anonymous", email: user.email },
          });
        }
        return true;
      } catch (error) {
        return false;
      }
    },

    // Attach DB user ID to JWT token
    async jwt({ token, user }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) token.id = dbUser.id;
      }
      return token;
    },

    // Expose user ID on session object
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

---

## Middleware (Route Protection)

`middleware.ts` uses the **Edge-safe** `authConfig` to protect routes:

```ts
import NextAuth from "next-auth";
import { authConfig } from "@/app/auth.config";

const { auth } = NextAuth(authConfig);
export const middleware = auth;

export const config = {
  matcher: ["/((?!api/auth|_next|favicon.ico|privacy|terms|signin|login).*)"],
};
```

**Protected by default**: everything except `api/auth/*`, `_next/*`, `favicon.ico`, `/privacy`, `/terms`, `/signin`, `/login`.

---

## Sign-In Page

### `app/signin/page.tsx`
Thin wrapper — just renders the `SignIn` component:
```ts
import { SignIn } from "@/components/SignIn";

export default async function SignInPage() {
  return <SignIn />;
}
```

### `components/SignIn.tsx`
Server component that:
1. Calls `auth()` — redirects to `/dashboard` if already authenticated
2. Renders a card with a Google sign-in button
3. Uses a server action to call `signIn("google", { redirectTo: "/dashboard" })`

```tsx
export async function SignIn() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    // Card UI with:
    // - "Sign In" heading
    // - Google sign-in button (FcGoogle icon) via server action
    // - Links to /terms and /privacy
  );
}
```

The form uses an inline server action:
```tsx
<form
  action={async () => {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }}
>
```

---

## Accessing the Session

### Server components / API routes
```ts
import { auth } from "@/app/auth";

const session = await auth();
const userId = session?.user?.id;
```

### Client components
```ts
import { useCurrentUser } from "@/hooks/use-current-user";

const user = useCurrentUser(); // returns session.data?.user
```

The root layout (`app/layout.tsx`) wraps the app in `<SessionProvider session={session}>` so `useSession()` works client-side.

---

## Database Schema (User model)

Minimal custom schema — no NextAuth default Account/Session tables:

```prisma
model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  createdAt DateTime  @default(now())

  @@index([email])
}
```

Users are created in the `signIn` callback on first login. No sessions or accounts tables — JWT strategy is used.

---

## Environment Variables

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

---

## Auth Flow Summary

```
User visits protected route
  → middleware checks auth() (Edge-safe authConfig)
  → no session → redirect to /signin

User clicks "Sign in with Google"
  → server action calls signIn("google")
  → redirected to Google OAuth
  → Google redirects back to /api/auth/callback/google

NextAuth callbacks run:
  1. signIn()  → upsert user in Prisma DB
  2. jwt()     → attach DB user.id to token
  3. session() → expose user.id on session object

User redirected to /dashboard
```
