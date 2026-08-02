"use client";

import { cn } from "@/lib/cn";
import { focusRing } from "@/lib/ui";
import { useRef } from "react";

export interface T2ASegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Tint applied when this option is the selected one. */
  tone?: "accent" | "get" | "post";
}

interface T2ASegmentedProps<T extends string> {
  options: T2ASegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  disabled?: boolean;
  /** Accessible name for the group. */
  label: string;
  className?: string;
}

const selectedTone = {
  accent: "bg-accent/12 text-accent border-accent/40",
  get: "bg-method-get/12 text-method-get border-method-get/40",
  post: "bg-method-post/12 text-method-post border-method-post/40",
} as const;

/** Roving-tabindex pill group. Replaces the hand-rolled GET/POST buttons. */
export function T2ASegmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
  label,
  className,
}: T2ASegmentedProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (delta: number) => {
    const index = options.findIndex((o) => o.value === value);
    const next = options[(index + delta + options.length) % options.length];
    onChange(next.value);
    const buttons = ref.current?.querySelectorAll("button");
    buttons?.[options.indexOf(next)]?.focus();
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-inset p-1",
        disabled && "opacity-50",
        className
      )}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-7 rounded-sm border px-3 font-mono text-xs font-medium uppercase tracking-[0.06em]",
              "transition-colors duration-[var(--dur-fast)]",
              focusRing,
              active
                ? selectedTone[option.tone ?? "accent"]
                : "border-transparent text-fg-subtle hover:text-fg",
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
