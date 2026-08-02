"use client";

import { useState } from "react";
import { GeminiKeyDialog } from "@/components/dashboard/GeminiKeyDialog";
import { T2AStatusDot } from "@/components/ui/T2AStatusDot";
import { cn } from "@/lib/cn";
import { focusRingSurface } from "@/lib/ui";

/**
 * Topbar key indicator. Opens on click, and opens itself when no key is
 * stored — the app cannot run an agent without one.
 */
export function GeminiKeyStatus({ hasKey }: { hasKey: boolean }) {
  const [open, setOpen] = useState(!hasKey);

  // A first-time key save has no onClose to call, so close on the prop flip
  // once the saved key arrives with the refreshed server tree.
  const [prevHasKey, setPrevHasKey] = useState(hasKey);
  if (prevHasKey !== hasKey) {
    setPrevHasKey(hasKey);
    if (hasKey) setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Gemini API key"
        className={cn(
          "hidden cursor-pointer items-center rounded-sm px-1.5 py-1 transition-colors duration-[var(--dur-fast)] hover:bg-elevated sm:inline-flex",
          focusRingSurface
        )}
      >
        <T2AStatusDot
          status={hasKey ? "ok" : "error"}
          label={hasKey ? "key set" : "key missing"}
        />
      </button>
      <GeminiKeyDialog
        open={open}
        onClose={hasKey ? () => setOpen(false) : undefined}
        title={hasKey ? "Update Gemini API key" : "Set up Gemini API key"}
      />
    </>
  );
}
