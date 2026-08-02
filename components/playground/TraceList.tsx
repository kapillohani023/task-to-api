"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Wrench } from "lucide-react";
import type { RunEvent } from "@/lib/run-events";
import { cn } from "@/lib/cn";

const fmtMs = (ms: number) => (ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`);
const fmtBytes = (b: number) => (b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`);

/** Vertical timeline, newest at the bottom, appended as events stream in. */
export function TraceList({ events }: { events: RunEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="px-1 py-2 text-xs text-fg-subtle">
        The trace fills in while the agent runs.
      </p>
    );
  }

  return (
    <ol aria-live="polite" className="flex flex-col">
      {events.map((event, i) => (
        <TraceRow key={i} event={event} />
      ))}
    </ol>
  );
}

function TraceRow({ event }: { event: RunEvent }) {
  const [open, setOpen] = useState(false);
  const failed =
    event.type === "error" ||
    (event.type === "mcp:connect" && !event.ok) ||
    (event.type === "tool:end" && Boolean(event.error));

  const detail = describe(event);

  return (
    <li className="animate-[t2a-fade-up_160ms_var(--ease-out)] border-b border-border-subtle py-1.5 last:border-b-0">
      <div className="flex items-start gap-2">
        <span
          aria-hidden
          className={cn(
            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
            failed ? "bg-danger" : event.type === "result" ? "bg-accent" : "bg-fg-subtle"
          )}
        />
        <span className="w-14 shrink-0 pt-0.5 font-mono text-[11px] tabular-nums text-fg-subtle">
          {fmtMs(event.at)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            {detail.icon}
            <span
              className={cn(
                "min-w-0 flex-1 truncate font-mono text-[12px] tracking-tight",
                failed ? "text-danger" : "text-fg"
              )}
            >
              {detail.label}
            </span>
            {detail.duration !== undefined && (
              <span className="shrink-0 rounded-sm border border-border px-1 font-mono text-[10px] tabular-nums text-fg-muted">
                {fmtMs(detail.duration)}
              </span>
            )}
            {detail.body && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? "Hide detail" : "Show detail"}
                className="shrink-0 cursor-pointer text-fg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
          </div>
          {detail.note && (
            <p className={cn("text-[11px]", failed ? "text-danger" : "text-fg-subtle")}>
              {detail.note}
            </p>
          )}
          {open && detail.body && (
            <pre className="mt-1 max-h-48 overflow-auto rounded-sm border border-border bg-inset px-2 py-1.5 font-mono text-[11px] leading-[1.5] text-fg-muted">
              {detail.body}
            </pre>
          )}
        </div>
      </div>
    </li>
  );
}

type Detail = {
  label: string;
  note?: string;
  duration?: number;
  body?: string;
  icon?: React.ReactNode;
};

function describe(event: RunEvent): Detail {
  switch (event.type) {
    case "accepted":
      return { label: "request accepted" };
    case "mcp:connect":
      return {
        label: `mcp connect  ${event.url}`,
        duration: event.ms,
        note: event.ok
          ? event.headerKeys.length > 0
            ? `headers: ${event.headerKeys.join(", ")}`
            : undefined
          : event.error,
      };
    case "mcp:tools":
      return {
        label: `discovered ${event.discovered} tools · ${event.enabled} enabled`,
      };
    case "gen:start":
      return {
        label: `generation started  ${event.model}`,
        note: `temp ${event.temperature} · ${event.toolCount} tool source${
          event.toolCount === 1 ? "" : "s"
        }`,
      };
    case "tool:start":
      return {
        label: event.name,
        icon: <Wrench size={11} className="shrink-0 text-fg-subtle" aria-hidden />,
        body: event.args,
        note: "args",
      };
    case "tool:end":
      return {
        label: event.name,
        icon: <Wrench size={11} className="shrink-0 text-fg-subtle" aria-hidden />,
        duration: event.ms,
        body: event.error ? undefined : event.preview,
        note: event.error
          ? event.error
          : `result ${fmtBytes(event.bytes)}${event.truncated ? " (truncated)" : ""}`,
      };
    case "gen:end":
      return {
        label: "generation complete",
        duration: event.ms,
        note: event.rounds > 0 ? `${event.rounds} tool round(s)` : undefined,
      };
    case "result":
      return {
        label: `200 · ${fmtBytes(new TextEncoder().encode(event.raw).length)}`,
        duration: event.ms,
      };
    case "error":
      return {
        label: event.kind,
        icon: <AlertCircle size={11} className="shrink-0 text-danger" aria-hidden />,
        note: event.message,
      };
  }
}
