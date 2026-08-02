"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Play, Square, Sparkles } from "lucide-react";
import { T2AButton } from "@/components/ui/T2AButton";
import { T2ABadge } from "@/components/ui/T2ABadge";
import { T2AKbd } from "@/components/ui/T2AKbd";
import { T2AJsonEditor, parseJsonError } from "@/components/ui/T2AJsonEditor";
import { T2ALoader } from "@/components/ui/T2ALoader";
import { buildCurl } from "@/components/agent/IntegrationPanel";
import { useBreadcrumb } from "@/components/shell/Breadcrumbs";
import { methodTone } from "@/lib/method";
import { sampleBody } from "@/lib/json-schema";
import { typeLabel } from "@/lib/ui";
import { cn } from "@/lib/cn";
import { AgentPane } from "./AgentPane";
import { ResponsePane } from "./ResponsePane";
import { usePlaygroundRun } from "./usePlaygroundRun";
import { defaultOverrides, type AgentOption, type PlaygroundAgent } from "./types";

export function PlaygroundPage({
  agent,
  agents,
  baseUrl,
  hasKey,
}: {
  agent: PlaygroundAgent;
  agents: AgentOption[];
  baseUrl: string;
  hasKey: boolean;
}) {
  const router = useRouter();
  const { outcome, history, run, cancel, clearHistory } = usePlaygroundRun();
  const [body, setBody] = useState(() => sampleBody(agent.inputSchema));
  const [overrides, setOverrides] = useState(() => defaultOverrides(agent));
  const [tab, setTab] = useState<"output" | "trace" | "raw" | "curl">("output");
  const [elapsed, setElapsed] = useState(0);
  const responseRef = useRef<HTMLElement>(null);

  useBreadcrumb(`${agent.name} · playground`);

  const running = outcome.status === "running";
  const bodyError = agent.method === "POST" ? parseJsonError(body, true) : null;
  const canRun = hasKey && !running && !bodyError;

  // Live elapsed timer while a run is in flight.
  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - started), 100);
    return () => window.clearInterval(id);
  }, [running]);

  // The trace is the interesting view while running; the output when it lands.
  // Render-phase adjustment, not an effect — see react.dev "adjusting state
  // when a prop changes".
  const [prevStatus, setPrevStatus] = useState(outcome.status);
  if (prevStatus !== outcome.status) {
    setPrevStatus(outcome.status);
    if (outcome.status === "running") setTab("trace");
    else if (outcome.status === "ok") setTab("output");
  }

  const start = useMemo(
    () => () => {
      if (!canRun) return;
      let parsed: unknown = null;
      if (agent.method === "POST" && body.trim() !== "") {
        try {
          parsed = JSON.parse(body);
        } catch {
          return;
        }
      }
      setElapsed(0);
      responseRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      void run(agent.id, { body: parsed, overrides });
    },
    [agent.id, agent.method, body, canRun, overrides, run]
  );

  // ⌘↵ / Ctrl+↵ runs, Esc cancels — page-wide.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        start();
      } else if (e.key === "Escape" && running) {
        e.preventDefault();
        cancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [start, cancel, running]);

  const endpoint = `${baseUrl}/api/agents/${agent.id}`;
  const curl = buildCurl({
    url: endpoint,
    method: agent.method,
    token: agent.token,
    body,
  });

  const selectAgent = (id: string) => router.push(`/agent/${id}/playground`);

  const agentPane = (
    <AgentPane
      agent={agent}
      agents={agents}
      overrides={overrides}
      onOverrides={setOverrides}
      onSelectAgent={selectAgent}
      disabled={running}
    />
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden xl:grid-cols-[280px_1fr_1fr]">
        <aside className="hidden min-h-0 overflow-y-auto border-r border-border px-4 py-4 xl:block">
          {agentPane}
        </aside>

        <section className="flex min-h-0 flex-col gap-3 overflow-y-auto border-b border-border px-4 py-4 lg:border-b-0 lg:border-r">
          <details className="rounded-md border border-border bg-surface px-3 py-2 xl:hidden">
            <summary className="cursor-pointer text-sm font-medium text-fg">
              {agent.name} · overrides & tools
            </summary>
            <div className="pt-3">{agentPane}</div>
          </details>

          <div className="flex items-center gap-2">
            <T2ABadge tone={methodTone(agent.method)} size="md">
              {agent.method}
            </T2ABadge>
            <span className="min-w-0 truncate font-mono text-[12px] tracking-tight text-fg-muted">
              /api/agents/{agent.id}
            </span>
          </div>

          {agent.method === "GET" ? (
            <p className="flex items-start gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs text-fg-muted">
              <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
              GET requests send no body, so the input schema is not used.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={typeLabel}>Body</span>
                <button
                  type="button"
                  onClick={() => setBody(sampleBody(agent.inputSchema))}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-sm text-[11px] font-medium text-fg-muted transition-colors duration-[var(--dur-fast)] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Sparkles size={12} aria-hidden />
                  Sample
                </button>
              </div>
              <T2AJsonEditor
                label="Request body"
                value={body}
                onChange={setBody}
                rows={10}
                disabled={running}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className={typeLabel}>Headers</span>
            <div className="rounded-sm border border-border bg-inset px-3 py-2 font-mono text-[11px] leading-[1.7] text-fg-muted">
              {agent.method === "POST" && <div>Content-Type: application/json</div>}
              <div>Authorization: Bearer ••••••••</div>
            </div>
            <p className="text-xs text-fg-subtle">
              The playground authenticates with your session — the token is never
              sent from the browser.
            </p>
          </div>

          {!hasKey && (
            <p className="rounded-md border border-warn/40 bg-warn/12 px-3 py-2 text-xs text-warn">
              Set a Gemini API key (top bar) before running.
            </p>
          )}

          {/* Sticky so Run stays reachable without scrolling past the editor. */}
          <div className="sticky bottom-0 -mx-4 mt-auto flex items-center gap-2 border-t border-border bg-base/95 px-4 py-3 backdrop-blur">
            {running ? (
              <T2AButton
                type="button"
                variant="danger"
                onClick={cancel}
                className="min-w-[120px]"
              >
                <Square size={14} />
                Cancel
              </T2AButton>
            ) : (
              <T2AButton
                type="button"
                onClick={start}
                disabled={!canRun}
                className="min-w-[120px]"
              >
                <Play size={14} />
                Run
                <span className="ml-1 flex items-center gap-0.5 opacity-70">
                  <T2AKbd className="border-accent-fg/20 bg-accent-fg/10 text-accent-fg">
                    ⌘
                  </T2AKbd>
                  <T2AKbd className="border-accent-fg/20 bg-accent-fg/10 text-accent-fg">
                    ↵
                  </T2AKbd>
                </span>
              </T2AButton>
            )}
            {running && <T2ALoader size="sm" />}
          </div>
        </section>

        <section
          ref={responseRef}
          className="flex min-h-0 flex-col overflow-hidden px-4 py-4"
        >
          <ResponsePane
            agent={agent}
            outcome={outcome}
            elapsed={elapsed}
            curl={curl}
            tab={tab}
            onTab={setTab}
          />
        </section>
      </div>

      <div className="flex h-11 shrink-0 items-center gap-3 overflow-x-auto border-t border-border bg-surface px-4">
        <span className={cn(typeLabel, "shrink-0")}>History</span>
        {history.length === 0 ? (
          <span className="text-xs text-fg-subtle">
            Runs from this session appear here.
          </span>
        ) : (
          <>
            {history.map((entry) => (
              <span
                key={entry.id}
                className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-fg-muted"
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    entry.status === "ok"
                      ? "bg-accent"
                      : entry.status === "cancelled"
                        ? "bg-fg-subtle"
                        : "bg-danger"
                  )}
                />
                {entry.status === "cancelled" ? "—" : entry.code}
                <span className="tabular-nums">{(entry.ms / 1000).toFixed(2)}s</span>
                <span className="text-fg-subtle">
                  {new Date(entry.at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
            ))}
            <button
              type="button"
              onClick={clearHistory}
              className="ml-auto shrink-0 cursor-pointer rounded-sm text-xs text-fg-subtle transition-colors duration-[var(--dur-fast)] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}
