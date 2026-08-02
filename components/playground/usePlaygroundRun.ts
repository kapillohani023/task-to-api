"use client";

import { useCallback, useRef, useState } from "react";
import type { RunEvent } from "@/lib/run-events";
import type { RunOverrides } from "@/lib/run-agent";

export type RunStatus = "idle" | "running" | "ok" | "error" | "cancelled";

export type RunOutcome = {
  status: RunStatus;
  events: RunEvent[];
  /** Terminal `result` event, when the run produced one. */
  result: Extract<RunEvent, { type: "result" }> | null;
  error: Extract<RunEvent, { type: "error" }> | null;
  ms: number;
};

export type HistoryEntry = {
  id: string;
  status: RunStatus;
  code: number;
  ms: number;
  at: number;
  toolCalls: number;
};

const EMPTY: RunOutcome = {
  status: "idle",
  events: [],
  result: null,
  error: null,
  ms: 0,
};

/**
 * Drives one playground run: POSTs to the NDJSON endpoint and appends each
 * line as it arrives, so the trace streams instead of landing all at once.
 */
export function usePlaygroundRun() {
  const [outcome, setOutcome] = useState<RunOutcome>(EMPTY);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => setOutcome(EMPTY), []);

  const run = useCallback(
    async (
      agentId: string,
      payload: { body: unknown; overrides: RunOverrides }
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const startedAt = Date.now();
      setOutcome({ ...EMPTY, status: "running" });

      const events: RunEvent[] = [];
      const push = (event: RunEvent) => {
        events.push(event);
        setOutcome((current) => ({ ...current, events: [...events] }));
      };

      let status: RunStatus = "ok";
      let result: RunOutcome["result"] = null;
      let error: RunOutcome["error"] = null;

      try {
        const res = await fetch(`/api/agents/${agentId}/playground`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const message = await res
            .json()
            .then((d) => (d as { error?: string }).error)
            .catch(() => null);
          throw new Error(message ?? `Request failed (${res.status})`);
        }

        const reader = res.body
          .pipeThrough(new TextDecoderStream())
          .getReader();

        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;

          // NDJSON: everything up to the last newline is complete.
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (line.trim() === "") continue;
            try {
              push(JSON.parse(line) as RunEvent);
            } catch {
              /* A partial line can only be the last one; ignore anything else. */
            }
          }
        }

        const reversed = [...events].reverse();
        result =
          (reversed.find((e) => e.type === "result") as RunOutcome["result"]) ?? null;
        error = (reversed.find((e) => e.type === "error") as RunOutcome["error"]) ?? null;

        if (error) status = error.kind === "aborted" ? "cancelled" : "error";
        else if (!result) status = "error";
      } catch (e) {
        if (controller.signal.aborted) {
          status = "cancelled";
        } else {
          status = "error";
          error = {
            type: "error",
            at: Date.now() - startedAt,
            ms: Date.now() - startedAt,
            kind: "unknown",
            message: e instanceof Error ? e.message : "Request failed",
          };
          events.push(error);
        }
      } finally {
        abortRef.current = null;
      }

      const ms = Date.now() - startedAt;
      setOutcome({ status, events: [...events], result, error, ms });

      setHistory((current) =>
        [
          {
            id: crypto.randomUUID(),
            status,
            code: status === "ok" ? 200 : status === "cancelled" ? 0 : 500,
            ms,
            at: Date.now(),
            toolCalls: events.filter((e) => e.type === "tool:end").length,
          },
          ...current,
        ].slice(0, 12)
      );
    },
    []
  );

  return { outcome, history, run, cancel, reset, clearHistory: () => setHistory([]) };
}
