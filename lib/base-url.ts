import { headers } from "next/headers";

/**
 * Absolute origin of the current request (e.g. `https://t2a.example.com`).
 *
 * Client components must not read `window.location` during render — it is
 * undefined while they server-render. Resolve the origin here and pass it down.
 */
export async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");

  if (!host) return process.env.NEXTAUTH_URL ?? "";

  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}
