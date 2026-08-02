"use client";

import { cn } from "@/lib/cn";
import { focusRing } from "@/lib/ui";
import { Check, Copy } from "lucide-react";
import { useId, useState } from "react";

interface T2ACopyableInputProps {
  value: string;
  /** Accessible name for the field and the copy button. */
  label: string;
  /** Render the label visibly above the field instead of screen-reader only. */
  showLabel?: boolean;
  className?: string;
}

/**
 * Read-only, not disabled — a disabled input can be neither selected nor
 * focused, which made the token uncopyable by keyboard (MASTER §7 bug 8).
 */
export function T2ACopyableInput({
  value,
  label,
  showLabel,
  className,
}: T2ACopyableInputProps) {
  const id = useId();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className={
          showLabel
            ? "text-xs font-medium uppercase tracking-[0.08em] text-fg-muted"
            : "sr-only"
        }
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          readOnly
          aria-readonly
          onClick={(e) => e.currentTarget.select()}
          className={cn(
            "h-9 w-full select-all rounded-sm border border-border bg-inset pl-3 pr-10 font-mono text-[13px] tracking-tight text-fg-muted",
            "transition-colors duration-[var(--dur-fast)] focus:border-border-strong focus:text-fg focus:outline-none focus:ring-1 focus:ring-accent/40"
          )}
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
          className={cn(
            "absolute end-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-1.5 text-fg-subtle",
            "transition-colors duration-[var(--dur-fast)] hover:bg-elevated hover:text-fg",
            focusRing
          )}
        >
          {copied ? (
            <Check size={14} className="text-accent" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
