"use server";

import { signOut } from "@/app/auth";

/** Callable from client components (the account menu). */
export async function signOutAction() {
  await signOut({ redirectTo: "/signin" });
}
