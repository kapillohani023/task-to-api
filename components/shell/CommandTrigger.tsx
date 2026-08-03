"use client";

import { Search } from "lucide-react";
import { T2AKbd } from "@/components/ui/T2AKbd";
import { useCommandPalette } from "./CommandPalette";
import { cn } from "@/lib/cn";
import { focusRingSurface } from "@/lib/ui";

export function CommandTrigger() {
  const palette = useCommandPalette();
  if (!palette) return null;

  return (
    <button
      type="button"
      onClick={palette.open}
      aria-label="Open command palette"
      className={cn(
        "inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-inset px-2 text-sm text-fg-subtle sm:pl-2.5",
        "transition-colors duration-[var(--dur-fast)] hover:border-border-strong hover:text-fg-muted",
        focusRingSurface
      )}
    >
      <Search size={13} aria-hidden />
      <span className="hidden md:inline">Search</span>
      {/* The key hint is noise on touch, where there is no ⌘. */}
      <T2AKbd className="hidden sm:inline-flex">⌘K</T2AKbd>
    </button>
  );
}
