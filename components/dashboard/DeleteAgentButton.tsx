"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { T2AButton } from "@/components/ui/T2AButton";
import { DeleteAgentDialog } from "./DeleteAgentDialog";
import { deleteAgentAction } from "@/app/actions/agent";

interface DeleteAgentButtonProps {
  agentId: string;
  agentName: string;
  variant?: "icon" | "generic";
  onDeleted?: () => void;
}

export function DeleteAgentButton({
  agentId,
  agentName,
  variant = "icon",
  onDeleted,
}: DeleteAgentButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAgentAction(agentId);
      if (!result.error) {
        setOpen(false);
        onDeleted?.();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <>
      {variant === "icon" ? (
        <T2AButton
          variant="danger"
          size="icon"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Trash2 size={16} />
        </T2AButton>
      ) : (
        <T2AButton
          variant="danger"
          size="sm"
          type="button"
          onClick={() => setOpen(true)}
        >
          <Trash2 size={16} />
          Delete Agent
        </T2AButton>
      )}
      {open && (
        <DeleteAgentDialog
          agentName={agentName}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
          isPending={isPending}
          error={error}
        />
      )}
    </>
  );
}
