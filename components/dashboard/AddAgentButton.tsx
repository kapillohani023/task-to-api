"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { T2AButton } from "@/components/ui/T2AButton";
import { AddAgentDialog } from "./AddAgentDialog";

/** Icon-only in the header; pass `label` to render it as a full action button. */
export function AddAgentButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {label ? (
        <T2AButton onClick={() => setOpen(true)}>
          <Plus size={16} />
          {label}
        </T2AButton>
      ) : (
        <T2AButton
          variant="secondary"
          size="icon"
          aria-label="New agent"
          title="New agent"
          onClick={() => setOpen(true)}
        >
          <Plus size={16} />
        </T2AButton>
      )}
      {open && <AddAgentDialog onClose={() => setOpen(false)} />}
    </>
  );
}
