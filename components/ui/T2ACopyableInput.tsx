"use client";

import { cn } from "@/lib/cn";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface T2ACopyableInputProps {
  value: string;
  label?: string;
  className?: string;
}

export function T2ACopyableInput({ value, label, className }: T2ACopyableInputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="sr-only">{label}</label>
      )}
      <input
        type="text"
        value={value}
        readOnly
        disabled
        className="w-full rounded border-2 border-black bg-zinc-100 py-2 pl-4 pr-10 font-mono text-sm text-black"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-black hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}
