"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { T2AInput } from "@/components/ui/T2AInput";
import { T2AButton } from "@/components/ui/T2AButton";
import { discoverServerToolsAction } from "@/app/actions/mcp";
import type { McpConfig, McpServerDraft, McpHeader } from "@/lib/mcp-types";

type DiscoverState = {
  loading: boolean;
  error: string | null;
  tools: { name: string; description: string }[] | null;
};

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-black transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
        checked ? "bg-green-400" : "bg-white"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full border border-black bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** Editable key/value header rows. Existing secret values render blank (write-only). */
function HeaderEditor({
  rows,
  onChange,
  disabled,
}: {
  rows: McpHeader[];
  onChange: (rows: McpHeader[]) => void;
  disabled?: boolean;
}) {
  const update = (index: number, patch: Partial<McpHeader>) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={row.key}
            onChange={(e) => update(i, { key: e.target.value })}
            placeholder="Header (e.g. Authorization)"
            disabled={disabled}
            className="w-1/2 rounded border-2 border-black bg-white px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            value={row.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder={row.key ? "•••••• (hidden)" : "Value"}
            disabled={disabled}
            className="w-1/2 rounded border-2 border-black bg-white px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            disabled={disabled}
            className="text-zinc-500 hover:text-red-600"
            aria-label="Remove header"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { key: "", value: "" }])}
        disabled={disabled}
        className="self-start text-sm font-medium text-zinc-600 hover:text-black"
      >
        + Add header
      </button>
    </div>
  );
}

function ServerRow({
  server,
  discovery,
  onChange,
  onRemove,
  onDiscover,
  disabled,
}: {
  server: McpServerDraft;
  discovery: DiscoverState | undefined;
  onChange: (patch: Partial<McpServerDraft>) => void;
  onRemove: () => void;
  onDiscover: () => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(server.id === null);

  const toggleTool = (name: string, enabled: boolean) => {
    const set = new Set(server.disabledTools);
    if (enabled) set.delete(name);
    else set.add(name);
    onChange({ disabledTools: [...set] });
  };

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !discovery) onDiscover();
  };

  return (
    <div className="rounded border-2 border-black bg-white">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={toggleExpanded}
          className="text-zinc-600 hover:text-black"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <input
          value={server.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://example.com/mcp"
          disabled={disabled}
          className="min-w-0 flex-1 rounded border-2 border-black bg-white px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="text-zinc-500 hover:text-red-600"
          aria-label="Delete server"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-4 border-t-2 border-black p-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Headers
            </p>
            <HeaderEditor
              rows={server.headers}
              onChange={(headers) => onChange({ headers })}
              disabled={disabled}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tools
              </p>
              <button
                type="button"
                onClick={onDiscover}
                disabled={disabled || discovery?.loading || !server.url.trim()}
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-black disabled:opacity-50"
              >
                <RefreshCw size={12} className={discovery?.loading ? "animate-spin" : ""} />
                {discovery?.tools ? "Refresh" : "Load tools"}
              </button>
            </div>

            {!discovery ? (
              <p className="text-sm text-zinc-400">Load tools to choose which are enabled.</p>
            ) : discovery.loading ? (
              <p className="text-sm text-zinc-400">Discovering…</p>
            ) : discovery.error ? (
              <p className="text-sm text-red-600">Unreachable: {discovery.error}</p>
            ) : discovery.tools && discovery.tools.length === 0 ? (
              <p className="text-sm text-zinc-400">No tools exposed.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {discovery.tools?.map((tool) => (
                  <div key={tool.name} className="flex items-start gap-3">
                    <Toggle
                      checked={!server.disabledTools.includes(tool.name)}
                      onChange={(next) => toggleTool(tool.name, next)}
                      disabled={disabled}
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-black">{tool.name}</p>
                      {tool.description && (
                        <p className="text-xs text-zinc-500">{tool.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function McpSection({
  value,
  onChange,
  disabled,
}: {
  value: McpConfig;
  onChange: (next: McpConfig) => void;
  disabled?: boolean;
}) {
  const [discovery, setDiscovery] = useState<Record<string, DiscoverState>>({});
  const [, startTransition] = useTransition();

  const patchServer = (key: string, patch: Partial<McpServerDraft>) =>
    onChange({
      ...value,
      servers: value.servers.map((s) => (s.key === key ? { ...s, ...patch } : s)),
    });

  const removeServer = (key: string) =>
    onChange({ ...value, servers: value.servers.filter((s) => s.key !== key) });

  const addServer = () =>
    onChange({
      ...value,
      servers: [
        ...value.servers,
        {
          key: crypto.randomUUID(),
          id: null,
          url: "",
          headers: [],
          headerKeys: [],
          disabledTools: [],
        },
      ],
    });

  const discover = (server: McpServerDraft) => {
    setDiscovery((d) => ({
      ...d,
      [server.key]: { loading: true, error: null, tools: d[server.key]?.tools ?? null },
    }));
    startTransition(async () => {
      const res = await discoverServerToolsAction(server.id, server.url, server.headers);
      setDiscovery((d) => ({
        ...d,
        [server.key]: { loading: false, error: res.error, tools: res.tools },
      }));
    });
  };

  const setNumber = (field: "maxToolRounds" | "timeoutMs", raw: string) =>
    onChange({ ...value, [field]: raw === "" ? 0 : Number(raw) });

  return (
    <div className="flex flex-col gap-4 rounded border-2 border-black bg-zinc-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black">MCP Tools</h2>
          <p className="text-sm text-zinc-500">
            Let this agent call tools from HTTP MCP servers while it runs.
          </p>
        </div>
        <Toggle
          checked={value.mcpEnabled}
          onChange={(next) => onChange({ ...value, mcpEnabled: next })}
          disabled={disabled}
        />
      </div>

      {value.mcpEnabled && (
        <>
          <div className="flex flex-wrap items-end gap-3 border-t-2 border-black pt-4">
            <div className="w-32">
              <T2AInput
                id="maxToolRounds"
                label="Max tool rounds"
                type="number"
                min={1}
                max={50}
                value={String(value.maxToolRounds)}
                onChange={(e) => setNumber("maxToolRounds", e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="w-40">
              <T2AInput
                id="timeoutMs"
                label="Timeout (ms)"
                type="number"
                min={1000}
                max={300000}
                value={String(value.timeoutMs)}
                onChange={(e) => setNumber("timeoutMs", e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t-2 border-black pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-black">Servers</p>
              <T2AButton size="sm" variant="secondary" type="button" onClick={addServer} disabled={disabled}>
                <Plus size={16} />
                Add server
              </T2AButton>
            </div>

            {value.servers.length === 0 && (
              <p className="text-sm text-zinc-400">No servers yet. Add one above.</p>
            )}

            {value.servers.map((server) => (
              <ServerRow
                key={server.key}
                server={server}
                discovery={discovery[server.key]}
                onChange={(patch) => patchServer(server.key, patch)}
                onRemove={() => removeServer(server.key)}
                onDiscover={() => discover(server)}
                disabled={disabled}
              />
            ))}
          </div>

          <p className="text-xs text-zinc-400">
            MCP changes are saved with the agent — click “Save Changes” below.
          </p>
        </>
      )}
    </div>
  );
}
