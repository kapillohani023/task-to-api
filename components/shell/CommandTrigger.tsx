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
        "hidden h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-inset pl-2.5 pr-2 text-sm text-fg-subtle",
        "transition-colors duration-[var(--dur-fast)] hover:border-border-strong hover:text-fg-muted sm:inline-flex",
        focusRingSurface
      )}
    >
      <Search size={13} aria-hidden />
      <span className="hidden md:inline">Search</span>
      <T2AKbd>⌘K</T2AKbd>
    </button>
  );
}
