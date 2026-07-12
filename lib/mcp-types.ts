// Shared, client-safe types for MCP config UI + actions.
// Kept out of "use server" (actions) and SDK-importing (lib/mcp) modules so
// client components can import them without pulling in server-only code.

export type McpActionResult = { error: string | null };

/** A server as exposed to the client — header values are never sent back. */
export type ClientMcpServer = {
  id: string;
  url: string;
  headerKeys: string[];
  disabledTools: string[];
};

export type DiscoveredTool = { name: string; description: string; enabled: boolean };

export type DiscoveredServer = {
  id: string;
  url: string;
  error: string | null;
  tools: DiscoveredTool[];
};

/** A single header row (key/value). */
export type McpHeader = { key: string; value: string };

/**
 * A server as edited in the client form (before save). Header values left blank
 * on an existing server mean "keep the stored secret".
 */
export type McpServerDraft = {
  key: string; // stable local key for React lists
  id: string | null; // persisted id, or null for a not-yet-saved server
  url: string;
  headers: McpHeader[];
  headerKeys: string[]; // originally-stored header keys (for placeholders/dirty compare)
  disabledTools: string[];
};

/** Full MCP config as edited in the form and submitted with the agent. */
export type McpConfig = {
  mcpEnabled: boolean;
  maxToolRounds: number;
  timeoutMs: number;
  servers: McpServerDraft[];
};

/** Server shape sent to the server action for reconciliation on save. */
export type McpServerInput = {
  id: string | null;
  url: string;
  headers: McpHeader[];
  disabledTools: string[];
};
