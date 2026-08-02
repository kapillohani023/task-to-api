"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { T2AInput } from "@/components/ui/T2AInput";
import { T2AButton } from "@/components/ui/T2AButton";
import { T2ASwitch } from "@/components/ui/T2ASwitch";
import { T2ACard } from "@/components/ui/T2ACard";
import { T2AEmptyState } from "@/components/ui/T2AEmptyState";
import { T2ASkeleton } from "@/components/ui/T2ASkeleton";
import { discoverServerToolsAction } from "@/app/actions/mcp";
import { fieldBase, focusRing, typeLabel } from "@/lib/ui";
import { cn } from "@/lib/cn";
import type { McpConfig, McpServerDraft, McpHeader } from "@/lib/mcp-types";

type DiscoverState = {
  loading: boolean;
  error: string | null;
  tools: { name: string; description: string }[] | null;
};

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
            aria-label="Header name"
            disabled={disabled}
            className={cn(fieldBase, "h-8 w-1/2 px-3 font-mono text-[13px]")}
          />
          <input
            value={row.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder={row.key ? "•••••• (hidden)" : "Value"}
            aria-label="Header value"
            disabled={disabled}
            className={cn(fieldBase, "h-8 w-1/2 px-3 font-mono text-[13px]")}
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            disabled={disabled}
            className={cn(
              "cursor-pointer rounded-sm p-1 text-fg-subtle transition-colors duration-[var(--dur-fast)] hover:text-danger",
              focusRing
            )}
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
        className={cn(
          "cursor-pointer self-start rounded-sm text-xs font-medium text-fg-muted transition-colors duration-[var(--dur-fast)] hover:text-fg",
          focusRing
        )}
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
    <T2ACard variant="inset" padding="none">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse server" : "Expand server"}
          className={cn(
            "cursor-pointer rounded-sm text-fg-subtle transition-colors duration-[var(--dur-fast)] hover:text-fg",
            focusRing
          )}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <input
          value={server.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://example.com/mcp"
          aria-label="MCP server URL"
          disabled={disabled}
          className={cn(fieldBase, "h-8 min-w-0 flex-1 px-3 font-mono text-[13px]")}
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className={cn(
            "cursor-pointer rounded-sm p-1 text-fg-subtle transition-colors duration-[var(--dur-fast)] hover:text-danger",
            focusRing
          )}
          aria-label="Delete server"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-border-subtle p-3">
          <div>
            <p className={cn(typeLabel, "mb-2")}>Headers</p>
            <HeaderEditor
              rows={server.headers}
              onChange={(headers) => onChange({ headers })}
              disabled={disabled}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className={typeLabel}>Tools</p>
              <button
                type="button"
                onClick={onDiscover}
                disabled={disabled || discovery?.loading || !server.url.trim()}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1 rounded-sm text-xs font-medium text-fg-muted transition-colors duration-[var(--dur-fast)] hover:text-fg disabled:cursor-not-allowed disabled:opacity-50",
                  focusRing
                )}
              >
                <RefreshCw
                  size={12}
                  className={discovery?.loading ? "animate-spin" : ""}
                />
                {discovery?.tools ? "Refresh" : "Load tools"}
              </button>
            </div>

            {!discovery ? (
              <p className="text-xs text-fg-subtle">
                Load tools to choose which are enabled.
              </p>
            ) : discovery.loading ? (
              <div className="flex flex-col gap-2">
                <T2ASkeleton className="h-5 w-2/3" />
                <T2ASkeleton className="h-5 w-1/2" />
              </div>
            ) : discovery.error ? (
              <p className="flex items-start gap-1.5 text-xs text-danger">
                <AlertCircle size={12} className="mt-0.5 shrink-0" aria-hidden />
                Unreachable: {discovery.error}
              </p>
            ) : discovery.tools && discovery.tools.length === 0 ? (
              <p className="text-xs text-fg-subtle">No tools exposed.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {discovery.tools?.map((tool) => (
                  <div key={tool.name} className="flex items-start gap-3">
                    <T2ASwitch
                      checked={!server.disabledTools.includes(tool.name)}
                      onChange={(next) => toggleTool(tool.name, next)}
                      disabled={disabled}
                      label={`Enable ${tool.name}`}
                      className="mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-[13px] tracking-tight text-fg">
                        {tool.name}
                      </p>
                      {tool.description && (
                        <p className="text-xs text-fg-subtle">{tool.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </T2ACard>
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
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.01em] text-fg">MCP tools</h2>
          <p className="text-sm text-fg-subtle">
            Let this agent call tools from HTTP MCP servers while it runs.
          </p>
        </div>
        <T2ASwitch
          checked={value.mcpEnabled}
          onChange={(next) => onChange({ ...value, mcpEnabled: next })}
          disabled={disabled}
          label="Enable MCP tools"
          className="mt-1"
        />
      </div>

      {value.mcpEnabled && (
        <>
          <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
            <div className="w-32">
              <T2AInput
                id="maxToolRounds"
                label="Max rounds"
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

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className={typeLabel}>Servers</p>
              <T2AButton
                size="sm"
                variant="secondary"
                type="button"
                onClick={addServer}
                disabled={disabled}
              >
                <Plus size={16} />
                Add server
              </T2AButton>
            </div>

            {value.servers.length === 0 && (
              <T2AEmptyState
                icon={Wrench}
                title="No servers yet"
                description="Point the agent at an HTTP MCP server to give it tools."
                className="py-8"
              />
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

          <p className="text-xs text-fg-subtle">
            MCP changes are saved with the agent — use “Save changes” below.
          </p>
        </>
      )}
    </div>
  );
}
