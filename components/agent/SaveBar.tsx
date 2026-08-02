"use client";

import { T2AButton } from "@/components/ui/T2AButton";
import { T2ALoader } from "@/components/ui/T2ALoader";

/** Slides up from the bottom whenever the form is dirty (MASTER §4). */
export function SaveBar({
  visible,
  isPending,
  formId,
  onDiscard,
}: {
  visible: boolean;
  isPending: boolean;
  formId: string;
  onDiscard: () => void;
}) {
  if (!visible) return null;

  return (
    <div
      role="status"
      className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 animate-[t2a-toast-in_var(--dur-base)_var(--ease-out)]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-fg-muted">Unsaved changes</span>
        <div className="flex items-center gap-2">
          <T2AButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={isPending}
          >
            Discard
          </T2AButton>
          <T2AButton
            type="submit"
            form={formId}
            size="sm"
            disabled={isPending}
            className="min-w-[112px]"
          >
            {isPending ? <T2ALoader size="sm" /> : "Save changes"}
          </T2AButton>
        </div>
      </div>
    </div>
  );
}
