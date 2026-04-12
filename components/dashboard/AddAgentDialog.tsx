"use client";

import { useActionState, useEffect, useState } from "react";
import { createAgentAction } from "@/app/actions/agent";
import { T2ADialog } from "@/components/ui/T2ADialog";
import { T2AInput } from "@/components/ui/T2AInput";
import { T2ASlider } from "@/components/ui/T2ASlider";
import { T2ATextArea } from "@/components/ui/T2ATextArea";
import { T2AButton } from "@/components/ui/T2AButton";
import { T2ALoader } from "@/components/ui/T2ALoader";
import { T2ACopyableInput } from "@/components/ui/T2ACopyableInput";

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
    <T2ADialog open={true} onClose={onClose} title="Add Agent" className="max-w-lg">
      <form action={action} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-1">
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
          label="Input Schema"
          rows={3}
          disabled={isPending}
        />
        <T2ATextArea
          id="outputSchema"
          name="outputSchema"
          label="Output Schema"
          rows={3}
          disabled={isPending}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Token</label>
          <input type="hidden" name="token" value={token} />
          <T2ACopyableInput value={token} label="Token" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-700">Method</label>
          <div className="flex gap-2">
            <input type="hidden" name="method" value={method} />
            <button
              type="button"
              onClick={() => setMethod("GET")}
              disabled={isPending}
              className={`rounded border-2 border-black px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                method === "GET"
                  ? "bg-green-400 text-black"
                  : "bg-white text-black hover:bg-zinc-100"
              }`}
            >
              GET
            </button>
            <button
              type="button"
              onClick={() => setMethod("POST")}
              disabled={isPending}
              className={`rounded border-2 border-black px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                method === "POST"
                  ? "bg-yellow-400 text-black"
                  : "bg-white text-black hover:bg-zinc-100"
              }`}
            >
              POST
            </button>
          </div>
        </div>

        {state.error && <p className="text-xs text-red-600">{state.error}</p>}

        <div className="flex justify-end">
          <T2AButton type="submit" disabled={isPending}>
            {isPending ? <T2ALoader size="sm" /> : "Create Agent"}
          </T2AButton>
        </div>
      </form>
    </T2ADialog>
  );
}
