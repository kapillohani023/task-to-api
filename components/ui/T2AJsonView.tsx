"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Collapsible, syntax-coloured JSON. The playground's response renderer. */
export function T2AJsonView({
  value,
  className,
  initiallyExpanded = true,
}: {
  value: unknown;
  className?: string;
  initiallyExpanded?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-auto rounded-md border border-border bg-inset px-3 py-2 font-mono text-[13px] leading-[1.6]",
        className
      )}
    >
      <Node value={value} depth={0} defaultOpen={initiallyExpanded} />
    </div>
  );
}

function Node({
  value,
  depth,
  keyName,
  defaultOpen,
}: {
  value: unknown;
  depth: number;
  keyName?: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(depth < 2 ? defaultOpen : false);
  const isArray = Array.isArray(value);
  const isObject = !isArray && value !== null && typeof value === "object";

  if (!isArray && !isObject) {
    return (
      <div style={{ paddingLeft: depth * 12 }}>
        {keyName !== undefined && (
          <>
            <span className="text-syn-key">&quot;{keyName}&quot;</span>
            <span className="text-syn-punct">: </span>
          </>
        )}
        <Scalar value={value} />
      </div>
    );
  }

  const entries = isArray
    ? (value as unknown[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);
  const open_ = isArray ? "[" : "{";
  const close = isArray ? "]" : "}";

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-1 rounded-sm text-left hover:bg-elevated focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <span className="text-fg-subtle" aria-hidden>
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        {keyName !== undefined && (
          <>
            <span className="text-syn-key">&quot;{keyName}&quot;</span>
            <span className="text-syn-punct">:</span>
          </>
        )}
        <span className="text-syn-punct">{open_}</span>
        {!open && (
          <span className="text-fg-subtle">
            {entries.length} {entries.length === 1 ? "item" : "items"}
            <span className="text-syn-punct">{close}</span>
          </span>
        )}
      </button>

      {open && (
        <>
          {entries.map(([k, v]) => (
            <Node
              key={k}
              value={v}
              depth={depth + 1}
              keyName={isArray ? undefined : k}
              defaultOpen={defaultOpen}
            />
          ))}
          <div className="text-syn-punct" style={{ paddingLeft: 0 }}>
            {close}
          </div>
        </>
      )}
    </div>
  );
}

function Scalar({ value }: { value: unknown }) {
  if (typeof value === "string")
    return <span className="text-syn-string">&quot;{value}&quot;</span>;
  if (typeof value === "number")
    return <span className="text-syn-number">{String(value)}</span>;
  if (typeof value === "boolean")
    return <span className="text-syn-bool">{String(value)}</span>;
  if (value === null) return <span className="text-syn-null">null</span>;
  return <span className="text-fg">{String(value)}</span>;
}
