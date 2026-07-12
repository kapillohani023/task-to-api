import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { McpHeader } from "./mcp-types";

export type { McpHeader };

/** A tool as discovered from an MCP server via tools/list. */
export type McpTool = {
  name: string;
  description: string;
  inputSchema: unknown;
};

/**
 * Parse the JSON-encoded `headers` column into a fetch-ready record.
 * Silently ignores malformed rows so a bad value never breaks a run.
 */
export function parseHeaders(headersJson: string): Record<string, string> {
  try {
    const rows = JSON.parse(headersJson) as McpHeader[];
    if (!Array.isArray(rows)) return {};
    const out: Record<string, string> = {};
    for (const row of rows) {
      if (row && typeof row.key === "string" && row.key.trim() !== "") {
        out[row.key] = typeof row.value === "string" ? row.value : "";
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Parse the JSON-encoded `disabledTools` column into a Set of tool names. */
export function parseDisabledTools(disabledJson: string): Set<string> {
  try {
    const names = JSON.parse(disabledJson) as string[];
    return new Set(Array.isArray(names) ? names.filter((n) => typeof n === "string") : []);
  } catch {
    return new Set();
  }
}

/**
 * Open a connected MCP client to a Streamable-HTTP server.
 * Caller is responsible for calling `client.close()`.
 */
export async function connectMcpServer(
  url: string,
  headers: Record<string, string>
): Promise<Client> {
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    requestInit: Object.keys(headers).length > 0 ? { headers } : undefined,
  });
  const client = new Client({ name: "task-to-api", version: "0.1.0" });
  await client.connect(transport);
  return client;
}

/** List the tools exposed by a connected MCP client. */
export async function listMcpTools(client: Client): Promise<McpTool[]> {
  const { tools } = await client.listTools();
  return tools.map((t) => ({
    name: t.name,
    description: t.description ?? "",
    inputSchema: t.inputSchema,
  }));
}
