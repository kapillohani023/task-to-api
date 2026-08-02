"use client";

import { cn } from "@/lib/cn";
import { focusRing } from "@/lib/ui";
import { useRef } from "react";

export interface T2ATab<T extends string> {
  value: T;
  label: string;
  /** Optional trailing count/indicator. */
  badge?: React.ReactNode;
}

interface T2ATabsProps<T extends string> {
  tabs: T2ATab<T>[];
  value: T;
  onChange: (next: T) => void;
  label: string;
  className?: string;
}

/** Underline tabs with arrow-key navigation. Pair panels with `T2ATabPanel`. */
export function T2ATabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  className,
}: T2ATabsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (delta: number) => {
    const index = tabs.findIndex((t) => t.value === value);
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    onChange(next.value);
    ref.current?.querySelectorAll("button")[tabs.indexOf(next)]?.focus();
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      className={cn("flex items-center gap-1 border-b border-border", className)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        }
      }}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`tab-${tab.value}`}
            aria-selected={active}
            aria-controls={`panel-${tab.value}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px inline-flex cursor-pointer items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium",
              "transition-colors duration-[var(--dur-fast)]",
              focusRing,
              active
                ? "border-accent text-fg"
                : "border-transparent text-fg-subtle hover:text-fg-muted"
            )}
          >
            {tab.label}
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}

export function T2ATabPanel({
  value,
  active,
  children,
  className,
  keepMounted,
}: {
  value: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
  /**
   * Render inactive panels as `hidden` instead of unmounting them. Required
   * when panels hold fields of a shared form — unmounted inputs submit nothing.
   */
  keepMounted?: boolean;
}) {
  if (!active && !keepMounted) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!active}
      tabIndex={active ? 0 : -1}
      className={cn(
        active && "animate-[t2a-fade-up_var(--dur-base)_var(--ease-out)]",
        "focus-visible:outline-none",
        className
      )}
    >
      {children}
    </div>
  );
}
