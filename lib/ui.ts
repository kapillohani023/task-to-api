/**
 * Shared class fragments for the T2A design system (design-system/t2a/MASTER.md).
 * Keeping these in one place is what makes "focus ring is never removed" enforceable.
 */

/** MASTER §6 — the focus ring, identical on every interactive element. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base";

/** Same ring, but offset against a surface/inset panel rather than the page. */
export const focusRingSurface =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/** MASTER §2 — field chrome shared by input, textarea and select. */
export const fieldBase =
  "w-full rounded-sm border border-border bg-inset text-fg placeholder:text-fg-subtle transition-colors duration-[var(--dur-fast)] focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-accent/40";

export const fieldDisabled = "cursor-not-allowed opacity-50";

/** MASTER §2 typography roles. */
export const typeLabel =
  "text-xs font-medium uppercase tracking-[0.08em] text-fg-muted";
export const typeHint = "text-xs text-fg-subtle";
export const typeMono = "font-mono text-[13px] tracking-tight text-fg-muted";
