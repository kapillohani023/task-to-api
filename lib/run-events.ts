/**
 * Streaming trace events for a playground run (see design-system/t2a/pages/playground.md §5).
 *
 * These cross the wire to the browser as NDJSON, so they must never carry the
 * Gemini key, MCP header values, or anything else secret — header *keys* only.
 */

export type RunEvent =
  | { type: "accepted"; at: number }
  | {
      type: "mcp:connect";
      at: number;
      url: string;
      ms: number;
      ok: boolean;
      headerKeys: string[];
      error?: string;
    }
  | { type: "mcp:tools"; at: number; discovered: number; enabled: number }
  | {
      type: "gen:start";
      at: number;
      model: string;
      temperature: number;
      toolCount: number;
    }
  | { type: "tool:start"; at: number; id: number; name: string; args: string }
  | {
      type: "tool:end";
      at: number;
      id: number;
      name: string;
      ms: number;
      bytes: number;
      preview: string;
      truncated: boolean;
      error?: string;
    }
  | { type: "gen:end"; at: number; ms: number; rounds: number }
  | {
      type: "result";
      at: number;
      ms: number;
      raw: string;
      data: unknown;
      /** True when the raw text didn't parse and came back as `{ result: … }`. */
      wrapped: boolean;
    }
  | {
      type: "error";
      at: number;
      ms: number;
      kind: "mcp" | "timeout" | "model" | "aborted" | "unknown";
      message: string;
    };

export type RunEventSink = (event: RunEvent) => void;

/** Tool results are unbounded; the trace pane is not. */
export const TRACE_PREVIEW_BYTES = 2000;

export function previewText(text: string): {
  preview: string;
  bytes: number;
  truncated: boolean;
} {
  const bytes = new TextEncoder().encode(text).length;
  if (text.length <= TRACE_PREVIEW_BYTES) {
    return { preview: text, bytes, truncated: false };
  }
  return {
    preview: `${text.slice(0, TRACE_PREVIEW_BYTES)}…`,
    bytes,
    truncated: true,
  };
}
