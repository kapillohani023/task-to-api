"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Agent } from "@prisma/client";
import { AgentsGrid } from "./AgentsGrid";
import { AddAgentButton } from "./AddAgentButton";
import { T2ASegmented } from "@/components/ui/T2ASegmented";
import { T2ASwitch } from "@/components/ui/T2ASwitch";
import { T2AKbd } from "@/components/ui/T2AKbd";
import { cn } from "@/lib/cn";
import { fieldBase } from "@/lib/ui";

type MethodFilter = "ALL" | "GET" | "POST";

const METHOD_FILTERS = [
  { value: "ALL" as const, label: "All" },
  { value: "GET" as const, label: "GET", tone: "get" as const },
  { value: "POST" as const, label: "POST", tone: "post" as const },
];

export function DashboardContent({ agents }: { agents: Agent[] }) {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<MethodFilter>("ALL");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, unless the user is already typing somewhere.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      searchRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((agent) => {
      if (method !== "ALL" && agent.method !== method) return false;
      if (!q) return true;
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.task.toLowerCase().includes(q) ||
        agent.id.toLowerCase().includes(q)
      );
    });
  }, [agents, query, method, mcpOnly]);

  const isFiltered = query.trim() !== "" || method !== "ALL" || mcpOnly;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-fg">Agents</h1>
          <span className="font-mono text-[13px] tabular-nums tracking-tight text-fg-subtle">
            {isFiltered ? `${filtered.length}/${agents.length}` : agents.length}
          </span>
        </div>

        {agents.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search
                size={14}
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents"
                aria-label="Search agents"
                className={cn(fieldBase, "h-9 pl-9 pr-12 text-sm")}
              />
              {query === "" && (
                <T2AKbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                  /
                </T2AKbd>
              )}
            </div>

            <T2ASegmented
              label="Filter by method"
              options={METHOD_FILTERS}
              value={method}
              onChange={setMethod}
            />

            <label className="flex cursor-pointer items-center gap-2 text-xs text-fg-muted">
              <T2ASwitch
                checked={mcpOnly}
                onChange={setMcpOnly}
                label="Show only agents with MCP tools"
              />
              MCP only
            </label>

            <div className="ml-auto">
              <AddAgentButton label="New agent" />
            </div>
          </div>
        )}
      </div>

      <AgentsGrid agents={filtered} filtered={isFiltered} />
    </main>
  );
}
