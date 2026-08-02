"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { createAgentAction } from "@/app/actions/agent";
import { T2ADialog } from "@/components/ui/T2ADialog";
import { T2AInput } from "@/components/ui/T2AInput";
import { T2ASlider } from "@/components/ui/T2ASlider";
import { T2ATextArea } from "@/components/ui/T2ATextArea";
import { T2AButton } from "@/components/ui/T2AButton";
import { T2ALoader } from "@/components/ui/T2ALoader";
import { T2ACopyableInput } from "@/components/ui/T2ACopyableInput";
import { T2ASegmented } from "@/components/ui/T2ASegmented";
import { METHOD_OPTIONS } from "@/lib/method";
import { typeLabel } from "@/lib/ui";

interface AddAgentDialogProps {
  onClose: () => void;
}

export function AddAgentDialog({ onClose }: AddAgentDialogProps) {
  const [state, action, isPending] = useActionState(createAgentAction, {
    error: null,
    success: false,
  });
  const [temperature, setTemperature] = useState(0.5);
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [token] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (state.success) onClose();
  }, [state.success, onClose]);

  return (
    <T2ADialog
      open={true}
      onClose={onClose}
      title="Add agent"
      className="max-w-lg"
      dismissOnBackdrop={false}
    >
      <form action={action} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto p-1">
        <T2AInput id="name" name="name" label="Name" disabled={isPending} />
        <T2ATextArea
          id="task"
          name="task"
          label="Task"
          rows={3}
          required
          disabled={isPending}
        />

        <input type="hidden" name="temperature" value={temperature} />
        <T2ASlider
          id="temperature"
          label="Temperature"
          min={0}
          max={1}
          step={0.01}
          value={temperature}
          onChange={setTemperature}
          disabled={isPending}
        />

        <T2ATextArea
          id="inputSchema"
          name="inputSchema"
          label="Input schema"
          rows={3}
          mono
          disabled={isPending}
        />
        <T2ATextArea
          id="outputSchema"
          name="outputSchema"
          label="Output schema"
          rows={3}
          mono
          disabled={isPending}
        />

        <input type="hidden" name="token" value={token} />
        <T2ACopyableInput value={token} label="Token" showLabel />

        <div className="flex flex-col gap-1.5">
          <span className={typeLabel}>Method</span>
          <input type="hidden" name="method" value={method} />
          <T2ASegmented
            label="HTTP method"
            options={METHOD_OPTIONS}
            value={method}
            onChange={setMethod}
            disabled={isPending}
          />
        </div>

        {state.error && (
          <p className="flex items-center gap-1.5 text-xs text-danger">
            <AlertCircle size={12} aria-hidden />
            {state.error}
          </p>
        )}

        <div className="mt-1 flex justify-end">
          <T2AButton type="submit" disabled={isPending} className="min-w-[124px]">
            {isPending ? <T2ALoader size="sm" /> : "Create agent"}
          </T2AButton>
        </div>
      </form>
    </T2ADialog>
  );
}
