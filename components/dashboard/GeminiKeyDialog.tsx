"use client";

import { useActionState, useEffect } from "react";
import { saveGeminiApiKey } from "@/app/actions/gemini";
import { T2ADialog } from "@/components/ui/T2ADialog";
import { T2AInput } from "@/components/ui/T2AInput";
import { T2AButton } from "@/components/ui/T2AButton";
import { T2ALoader } from "@/components/ui/T2ALoader";

interface GeminiKeyDialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
}

export function GeminiKeyDialog({
  open,
  onClose,
  title = "Set up Gemini API Key",
}: GeminiKeyDialogProps) {
  const [state, action, isPending] = useActionState(saveGeminiApiKey, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (state.success) onClose?.();
  }, [state.success]);

  return (
    <T2ADialog open={open} onClose={onClose ?? (() => {})} title={title}>
      <form action={action} className="flex flex-col gap-4">
        <p className="text-sm text-zinc-600">
          A valid Gemini API key is required to use T2A. Enter your key below.
        </p>
        <T2AInput
          id="geminiApiKey"
          name="geminiApiKey"
          label="Gemini API Key"
          disabled={isPending}
          error={state.error ?? undefined}
        />
        <div className="flex justify-end">
          <T2AButton type="submit" disabled={isPending}>
            {isPending ? <T2ALoader size="sm" /> : "Save"}
          </T2AButton>
        </div>
      </form>
    </T2ADialog>
  );
}
