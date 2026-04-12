"use client";

import { useState } from "react";
import { SiGooglegemini } from "react-icons/si";
import { T2AButton } from "@/components/ui/T2AButton";
import { GeminiKeyDialog } from "./GeminiKeyDialog";

export function UpdateGeminiKeyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <T2AButton variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <SiGooglegemini size={16} />
        Gemini
      </T2AButton>
      <GeminiKeyDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Update Gemini API Key"
      />
    </>
  );
}
