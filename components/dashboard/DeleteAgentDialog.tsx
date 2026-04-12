"use client";

import { T2ADialog } from "@/components/ui/T2ADialog";
import { T2AButton } from "@/components/ui/T2AButton";
import { T2ALoader } from "@/components/ui/T2ALoader";
import { T2ATypography } from "@/components/ui/T2ATypography";

interface DeleteAgentDialogProps {
  agentName: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  error?: string | null;
}

export function DeleteAgentDialog({
  agentName,
  onClose,
  onConfirm,
  isPending,
  error,
}: DeleteAgentDialogProps) {
  return (
    <T2ADialog open={true} onClose={isPending ? () => {} : onClose} title="Delete Agent">
      <div className="flex flex-col gap-4">
        <T2ATypography variant="body">
          Are you sure you want to delete <strong>{agentName}</strong>? This action cannot be
          undone.
        </T2ATypography>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <T2AButton variant="secondary" type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </T2AButton>
          <T2AButton variant="danger" type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? <T2ALoader size="sm" /> : "Delete"}
          </T2AButton>
        </div>
      </div>
    </T2ADialog>
  );
}
