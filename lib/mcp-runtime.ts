import type { McpServer } from "@prisma/client";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { mcpToTool, type CallableTool, type FunctionCall, type Part } from "@google/genai";
import { connectMcpServer, parseHeaders, parseDisabledTools } from "./mcp";
import { previewText, type RunEventSink } from "./run-events";

/** Connected MCP servers exposed as SDK-callable tools. */
export type McpSession = {
  tools: CallableTool[];
  close: () => Promise<void>;
};

/** Thrown when a configured MCP server can't be reached at invocation time. */
export class McpServerUnreachableError extends Error {
  constructor(url: string, cause: unknown) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`MCP server unreachable (${url}): ${detail}`);
    this.name = "McpServerUnreachableError";
  }
}

// Wrap a CallableTool so disabled tools are hidden from the model, and — when a
// sink is supplied — so every call is timed. The SDK owns the tool loop, so this
// wrapper is the only place per-call detail is observable (playground.md §5.2).
function withDisabledFilter(
  base: CallableTool,
  disabled: Set<string>,
  onEvent?: RunEventSink,
  startedAt = Date.now()
): CallableTool {
  if (disabled.size === 0 && !onEvent) return base;

  const filterDeclarations = async () => {
    const tool = await base.tool();
    if (disabled.size === 0) return tool;
    return {
      ...tool,
      functionDeclarations: (tool.functionDeclarations ?? []).filter(
        (fd) => !fd.name || !disabled.has(fd.name)
      ),
    };
  };

  return {
    tool: filterDeclarations,
    async callTool(functionCalls: FunctionCall[]): Promise<Part[]> {
      if (!onEvent) return base.callTool(functionCalls);

      const id = nextCallId();
      const name = functionCalls.map((c) => c.name).join(", ") || "tool";
      onEvent({
        type: "tool:start",
        at: Date.now() - startedAt,
        id,
        name,
        args: safeStringify(functionCalls.map((c) => c.args)),
      });

      const began = Date.now();
      try {
        const parts = await base.callTool(functionCalls);
        const { preview, bytes, truncated } = previewText(safeStringify(parts));
        onEvent({
          type: "tool:end",
          at: Date.now() - startedAt,
          id,
          name,
          ms: Date.now() - began,
          bytes,
          preview,
          truncated,
        });
        return parts;
      } catch (e) {
        onEvent({
          type: "tool:end",
          at: Date.now() - startedAt,
          id,
          name,
          ms: Date.now() - began,
          bytes: 0,
          preview: "",
          truncated: false,
          error: e instanceof Error ? e.message : String(e),
        });
        throw e;
      }
    },
  };
}

let callCounter = 0;
const nextCallId = () => ++callCounter;

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

type Connection =
  | { ok: true; server: McpServer; client: Client; enabledCount: number }
  | { ok: false; server: McpServer; error: McpServerUnreachableError };

/**
 * Connect to every configured server (in parallel), verify it responds to
 * tools/list, and expose each as a filtered CallableTool for the Gen AI SDK.
 *
 * Fail-fast: if ANY server can't be reached, all opened connections are closed
 * and an McpServerUnreachableError naming the server is thrown.
 */
export async function openMcpSession(
  servers: McpServer[],
  options: { onEvent?: RunEventSink; startedAt?: number } = {}
): Promise<McpSession> {
  const { onEvent, startedAt = Date.now() } = options;
  let discovered = 0;
  let enabled = 0;

  const connections: Connection[] = await Promise.all(
    servers.map(async (server): Promise<Connection> => {
      const began = Date.now();
      const headers = parseHeaders(server.headers);
      try {
        const client = await connectMcpServer(server.url, headers);
        // Confirms reachability + a working session before we commit to the run,
        // and tells us how many tools survive the per-server disable filter.
        const { tools } = await client.listTools();
        const disabled = parseDisabledTools(server.disabledTools);
        const enabledCount = tools.filter((t) => !disabled.has(t.name)).length;
        discovered += tools.length;
        enabled += enabledCount;
        onEvent?.({
          type: "mcp:connect",
          at: began - startedAt,
          url: server.url,
          ms: Date.now() - began,
          ok: true,
          // Header VALUES are secrets; only the key names may cross the wire.
          headerKeys: Object.keys(headers),
        });
        return { ok: true, server, client, enabledCount };
      } catch (cause) {
        const error = new McpServerUnreachableError(server.url, cause);
        onEvent?.({
          type: "mcp:connect",
          at: began - startedAt,
          url: server.url,
          ms: Date.now() - began,
          ok: false,
          headerKeys: Object.keys(headers),
          error: error.message,
        });
        return { ok: false, server, error };
      }
    })
  );

  if (servers.length > 0) {
    onEvent?.({ type: "mcp:tools", at: Date.now() - startedAt, discovered, enabled });
  }

  const openClients = connections
    .filter((c): c is Extract<Connection, { ok: true }> => c.ok)
    .map((c) => c.client);

  const failed = connections.find((c): c is Extract<Connection, { ok: false }> => !c.ok);
  if (failed) {
    await Promise.allSettled(openClients.map((c) => c.close()));
    throw failed.error;
  }

  // Only expose servers that contribute at least one enabled tool — a tool with
  // no declarations would be rejected by the API, and zero total means the
  // caller falls back to a plain single-shot generation.
  const tools = connections
    .filter((c): c is Extract<Connection, { ok: true }> => c.ok && c.enabledCount > 0)
    .map((c) =>
      withDisabledFilter(
        mcpToTool(c.client),
        parseDisabledTools(c.server.disabledTools),
        onEvent,
        startedAt
      )
    );

  const close = async () => {
    await Promise.allSettled(openClients.map((c) => c.close()));
  };

  return { tools, close };
}

/** Reject if `promise` doesn't settle within `ms`. */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}
