"use client";

import { cn } from "@/lib/cn";
import { focusRing } from "@/lib/ui";

interface T2ASwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  /** Accessible name. Required when no visible label sits next to the switch. */
  label?: string;
  className?: string;
}

export function T2ASwitch({
  checked,
  onChange,
  disabled,
  label,
  className,
}: T2ASwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border",
        "transition-colors duration-[var(--dur-base)] ease-out",
        checked ? "bg-accent" : "bg-border",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        focusRing,
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-fg transition-transform duration-[var(--dur-base)] ease-out",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
