"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { T2AButton } from "@/components/ui/T2AButton";
import { AddAgentDialog } from "./AddAgentDialog";

export function AddAgentButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <T2AButton variant="secondary" size="icon" onClick={() => setOpen(true)}>
        <Plus size={16} />
      </T2AButton>
      {open && <AddAgentDialog onClose={() => setOpen(false)} />}
    </>
  );
}
