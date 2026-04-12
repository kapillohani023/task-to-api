"use client";

import { useState } from "react";
import { Key } from "lucide-react";
import { T2AButton } from "@/components/ui/T2AButton";
import { GeminiKeyDialog } from "./GeminiKeyDialog";

export function ApiKeyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <T2AButton variant="secondary" size="icon" onClick={() => setOpen(true)}>
        <Key size={16} />
      </T2AButton>
      {open && (
        <GeminiKeyDialog
          open={true}
          onClose={() => setOpen(false)}
          title="Update Gemini API Key"
        />
      )}
    </>
  );
}
