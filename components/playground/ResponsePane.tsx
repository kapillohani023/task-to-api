"use client";

import { useState } from "react";
import { AlertCircle, Info, Terminal } from "lucide-react";
import { T2ATabs, T2ATabPanel } from "@/components/ui/T2ATabs";
import { T2AJsonView } from "@/components/ui/T2AJsonView";
import { T2ACode } from "@/components/ui/T2ACode";
import { T2AEmptyState } from "@/components/ui/T2AEmptyState";
import { T2AStatusDot } from "@/components/ui/T2AStatusDot";
import { T2ABadge } from "@/components/ui/T2ABadge";
import { T2ASkeleton } from "@/components/ui/T2ASkeleton";
import { T2AKbd } from "@/components/ui/T2AKbd";
import { checkAgainstSchema } from "@/lib/json-schema";
import { cn } from "@/lib/cn";
import { TraceList } from "./TraceList";
import type { RunOutcome } from "./usePlaygroundRun";
import type { PlaygroundAgent } from "./types";

type ResponseTab = "output" | "trace" | "raw" | "curl";

const TABS = [
  { value: "output" as const, label: "Output" },
  { value: "trace" as const, label: "Trace" },
  { value: "raw" as const, label: "Raw" },
  { value: "curl" as const, label: "cURL" },
];

export function ResponsePane({
  agent,
  outcome,
  elapsed,
  curl,
  tab,
  onTab,
}: {
  agent: PlaygroundAgent;
  outcome: RunOutcome;
  elapsed: number;
  curl: string;
  tab: ResponseTab;
  onTab: (next: ResponseTab) => void;
}) {
  const running = outcome.status === "running";
  const toolCalls = outcome.events.filter((e) => e.type === "tool:end").length;

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <StatusStrip
        status={outcome.status}
        ms={running ? elapsed : outcome.ms}
        toolCalls={toolCalls}
        mcp={agent.mcpEnabled && agent.servers.length > 0}
      />

      <T2ATabs tabs={TABS} value={tab} onChange={onTab} label="Response views" />

      <div className="min-h-0 flex-1 overflow-auto">
        <T2ATabPanel value="output" active={tab === "output"}>
          {running ? (
            <div className="flex flex-col gap-2">
              <T2ASkeleton className="h-4 w-1/3" />
              <T2ASkeleton className="h-4 w-2/3" />
              <T2ASkeleton className="h-4 w-1/2" />
            </div>
          ) : outcome.error ? (
            <ErrorCard outcome={outcome} />
          ) : outcome.result ? (
            <div className="flex flex-col gap-3">
              <T2AJsonView value={outcome.result.data} />
              <SchemaVerdict
                value={outcome.result.data}
                outputSchema={agent.outputSchema}
              />
            </div>
          ) : (
            <T2AEmptyState
              icon={Terminal}
              title="No run yet"
              description="Run the agent to see its response."
              action={
                <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
                  <T2AKbd>⌘</T2AKbd>
                  <T2AKbd>↵</T2AKbd>
                  to run
                </span>
              }
            />
          )}
        </T2ATabPanel>

        <T2ATabPanel value="trace" active={tab === "trace"}>
          <TraceList events={outcome.events} />
        </T2ATabPanel>

        <T2ATabPanel value="raw" active={tab === "raw"}>
          {outcome.result ? (
            <div className="flex flex-col gap-2">
              {outcome.result.wrapped && (
                <p className="flex items-start gap-2 rounded-md border border-warn/40 bg-warn/12 px-3 py-2 text-xs text-warn">
                  <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
                  Output was not valid JSON — returned as{" "}
                  <code className="font-mono">{"{ result: … }"}</code>.
                </p>
              )}
              <T2ACode
                language="text"
                code={outcome.result.raw || "(empty)"}
                maxHeight="max-h-[60vh]"
              />
            </div>
          ) : (
            <p className="text-xs text-fg-subtle">
              The model&apos;s text before parsing appears here after a run.
            </p>
          )}
        </T2ATabPanel>

        <T2ATabPanel value="curl" active={tab === "curl"}>
          <T2ACode language="bash" code={curl} maxHeight="max-h-[60vh]" />
        </T2ATabPanel>
      </div>
    </div>
  );
}

function StatusStrip({
  status,
  ms,
  toolCalls,
  mcp,
}: {
  status: RunOutcome["status"];
  ms: number;
  toolCalls: number;
  mcp: boolean;
}) {
  const label: Record<RunOutcome["status"], string> = {
    idle: "idle",
    running: "running",
    ok: "200",
    error: "500",
    cancelled: "cancelled",
  };
  const dot =
    status === "ok"
      ? "ok"
      : status === "error"
        ? "error"
        : status === "running"
          ? "running"
          : "idle";

  return (
    <div className="flex flex-wrap items-center gap-3" aria-live="polite">
      <T2AStatusDot status={dot} label={label[status]} />
      {status !== "idle" && (
        <span className="font-mono text-[11px] tabular-nums text-fg-muted">
          {ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`}
        </span>
      )}
      {toolCalls > 0 && (
        <span className="font-mono text-[11px] text-fg-muted">
          {toolCalls} tool call{toolCalls === 1 ? "" : "s"}
        </span>
      )}
      {mcp && <T2ABadge tone="neutral">mcp</T2ABadge>}
    </div>
  );
}

function ErrorCard({ outcome }: { outcome: RunOutcome }) {
  const error = outcome.error;
  if (!error) return null;

  const tone =
    error.kind === "timeout"
      ? "warn"
      : error.kind === "aborted"
        ? "neutral"
        : "danger";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border px-3 py-3 text-sm",
        tone === "warn" && "border-warn/40 bg-warn/12 text-warn",
        tone === "danger" && "border-danger/40 bg-danger-bg text-danger",
        tone === "neutral" && "border-border bg-elevated text-fg-muted"
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        <AlertCircle size={14} aria-hidden />
        {titleFor(error.kind)}
      </span>
      {/* Verbatim: McpServerUnreachableError names the URL, timeouts carry the ms. */}
      <p className="font-mono text-[12px] leading-[1.5] break-words">{error.message}</p>
    </div>
  );
}

function titleFor(kind: string): string {
  switch (kind) {
    case "mcp":
      return "MCP server unreachable";
    case "timeout":
      return "Timed out";
    case "aborted":
      return "Run cancelled";
    case "model":
      return "Agent execution failed";
    default:
      return "Failed";
  }
}

function SchemaVerdict({
  value,
  outputSchema,
}: {
  value: unknown;
  outputSchema: string;
}) {
  const [open, setOpen] = useState(false);
  const verdict = checkAgainstSchema(value, outputSchema);

  if (verdict.status === "none") {
    return <p className="text-xs text-fg-subtle">— no output schema set</p>;
  }
  if (verdict.status === "unparseable") {
    return (
      <p className="text-xs text-warn">
        Output schema isn&apos;t valid JSON, so it can&apos;t be checked.
      </p>
    );
  }
  if (verdict.status === "ok") {
    return <p className="text-xs text-accent">✓ matches output schema</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="cursor-pointer self-start rounded-sm text-xs text-warn hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        ⚠ {verdict.issues.length} issue{verdict.issues.length === 1 ? "" : "s"}
      </button>
      {open && (
        <ul className="flex flex-col gap-0.5">
          {verdict.issues.map((issue, i) => (
            <li key={i} className="font-mono text-[11px] text-fg-muted">
              <span className="text-syn-key">{issue.path}</span>: {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
