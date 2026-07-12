import type { McpServer } from "@prisma/client";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { mcpToTool, type CallableTool } from "@google/genai";
import { connectMcpServer, parseHeaders, parseDisabledTools } from "./mcp";

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

// Wrap a CallableTool so disabled tools are hidden from the model. The SDK still
// converts schemas and executes calls; we only trim which declarations it sees.
function withDisabledFilter(base: CallableTool, disabled: Set<string>): CallableTool {
  if (disabled.size === 0) return base;
  return {
    async tool() {
      const tool = await base.tool();
      return {
        ...tool,
        functionDeclarations: (tool.functionDeclarations ?? []).filter(
          (fd) => !fd.name || !disabled.has(fd.name)
        ),
      };
    },
    callTool(functionCalls) {
      return base.callTool(functionCalls);
    },
  };
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
export async function openMcpSession(servers: McpServer[]): Promise<McpSession> {
  const connections: Connection[] = await Promise.all(
    servers.map(async (server): Promise<Connection> => {
      try {
        const client = await connectMcpServer(server.url, parseHeaders(server.headers));
        // Confirms reachability + a working session before we commit to the run,
        // and tells us how many tools survive the per-server disable filter.
        const { tools } = await client.listTools();
        const disabled = parseDisabledTools(server.disabledTools);
        const enabledCount = tools.filter((t) => !disabled.has(t.name)).length;
        return { ok: true, server, client, enabledCount };
      } catch (cause) {
        return { ok: false, server, error: new McpServerUnreachableError(server.url, cause) };
      }
    })
  );

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
    .map((c) => withDisabledFilter(mcpToTool(c.client), parseDisabledTools(c.server.disabledTools)));

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
