"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAgentAction } from "@/app/actions/agent";
import type { Agent } from "@prisma/client";
import { T2AInput } from "@/components/ui/T2AInput";
import { T2ASlider } from "@/components/ui/T2ASlider";
import { T2ATextArea } from "@/components/ui/T2ATextArea";
import { T2AToast } from "@/components/ui/T2AToast";
import { T2ABadge } from "@/components/ui/T2ABadge";
import { T2ASegmented } from "@/components/ui/T2ASegmented";
import { T2ATabs, T2ATabPanel } from "@/components/ui/T2ATabs";
import { T2AJsonEditor } from "@/components/ui/T2AJsonEditor";
import { T2ACopyableInput } from "@/components/ui/T2ACopyableInput";
import { DeleteAgentButton } from "@/components/dashboard/DeleteAgentButton";
import { McpSection } from "@/components/agent/McpSection";
import { IntegrationPanel } from "@/components/agent/IntegrationPanel";
import { SaveBar } from "@/components/agent/SaveBar";
import type { ClientMcpServer, McpConfig, McpServerInput } from "@/lib/mcp-types";
import { METHOD_OPTIONS, methodTone } from "@/lib/method";
import { typeLabel } from "@/lib/ui";
import { useBreadcrumb } from "@/components/shell/Breadcrumbs";
import { AlertCircle, Info } from "lucide-react";

type AgentFormValues = {
  name: string;
  task: string;
  temperature: number;
  inputSchema: string;
  outputSchema: string;
  method: "GET" | "POST";
};

type TabValue = "config" | "schema" | "tools" | "integration";

const TABS = [
  { value: "config" as const, label: "Config" },
  { value: "schema" as const, label: "Schema" },
  { value: "tools" as const, label: "Tools" },
  { value: "integration" as const, label: "Integration" },
];

function getAgentFormValues(agent: Agent): AgentFormValues {
  return {
    name: agent.name,
    task: agent.task,
    temperature: agent.temperature,
    inputSchema: agent.inputSchema,
    outputSchema: agent.outputSchema,
    method: agent.method as "GET" | "POST",
  };
}

function buildMcpConfig(agent: Agent, servers: ClientMcpServer[]): McpConfig {
  return {
    mcpEnabled: agent.mcpEnabled,
    maxToolRounds: agent.maxToolRounds,
    timeoutMs: agent.timeoutMs,
    servers: servers.map((s) => ({
      key: s.id,
      id: s.id,
      url: s.url,
      headers: s.headerKeys.map((key) => ({ key, value: "" })),
      headerKeys: s.headerKeys,
      disabledTools: s.disabledTools,
    })),
  };
}

// The exact shape persisted on save — also used for dirty comparison.
function toMcpPayload(config: McpConfig): {
  mcpEnabled: boolean;
  maxToolRounds: number;
  timeoutMs: number;
  servers: McpServerInput[];
} {
  return {
    mcpEnabled: config.mcpEnabled,
    maxToolRounds: config.maxToolRounds,
    timeoutMs: config.timeoutMs,
    servers: config.servers.map((s) => ({
      id: s.id,
      url: s.url,
      headers: s.headers,
      disabledTools: s.disabledTools,
    })),
  };
}

export function AgentDetailPage({
  agent,
  servers,
  baseUrl,
}: {
  agent: Agent;
  servers: ClientMcpServer[];
  /** Absolute origin resolved on the server — see lib/base-url.ts. */
  baseUrl: string;
}) {
  const router = useRouter();
  const updateWithId = updateAgentAction.bind(null, agent.id);
  const [state, action, isPending] = useActionState(updateWithId, {
    error: null,
    success: false,
  });
  const [formValues, setFormValues] = useState<AgentFormValues>(() =>
    getAgentFormValues(agent)
  );
  const [mcpConfig, setMcpConfig] = useState<McpConfig>(() =>
    buildMcpConfig(agent, servers)
  );
  const [tab, setTab] = useState<TabValue>("config");
  const [showSavedToast, setShowSavedToast] = useState(false);
  const wasPendingRef = useRef(false);

  useBreadcrumb(agent.name);

  const initialValues = getAgentFormValues(agent);
  const initialMcpPayload = JSON.stringify(toMcpPayload(buildMcpConfig(agent, servers)));
  const mcpPayload = toMcpPayload(mcpConfig);
  const hasChanges =
    formValues.name !== initialValues.name ||
    formValues.task !== initialValues.task ||
    formValues.temperature !== initialValues.temperature ||
    formValues.inputSchema !== initialValues.inputSchema ||
    formValues.outputSchema !== initialValues.outputSchema ||
    formValues.method !== initialValues.method ||
    JSON.stringify(mcpPayload) !== initialMcpPayload;

  // Re-sync local edits whenever freshly-saved data arrives as new props
  // (e.g. after router.refresh()). Render-phase adjustment rather than an
  // effect — see react.dev "adjusting state when a prop changes".
  const propSignature = `${JSON.stringify(initialValues)}|${initialMcpPayload}`;
  const [syncedSignature, setSyncedSignature] = useState(propSignature);
  if (syncedSignature !== propSignature) {
    setSyncedSignature(propSignature);
    setFormValues(getAgentFormValues(agent));
    setMcpConfig(buildMcpConfig(agent, servers));
  }

  // Surface the "saved" toast on the pending→done transition. Render-phase
  // detection (not an effect) so it doesn't trip cascading-render lint.
  const [prevPending, setPrevPending] = useState(isPending);
  if (prevPending !== isPending) {
    setPrevPending(isPending);
    if (prevPending && !isPending && state.success) setShowSavedToast(true);
  }

  useEffect(() => {
    if (wasPendingRef.current && !isPending && state.success) {
      router.refresh();
    }

    wasPendingRef.current = isPending;
  }, [isPending, router, state.success]);

  useEffect(() => {
    if (!showSavedToast) return;

    const timeoutId = window.setTimeout(() => {
      setShowSavedToast(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSavedToast]);

  const discard = () => {
    setFormValues(getAgentFormValues(agent));
    setMcpConfig(buildMcpConfig(agent, servers));
  };

  const endpoint = `${baseUrl}/api/agents/${agent.id}`;
  // GET carries no body, so an input schema on a GET agent never receives input.
  const inertInputSchema =
    formValues.method === "GET" && formValues.inputSchema.trim() !== "";

  return (
    <>
      <T2AToast open={showSavedToast} message="Changes saved." />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col">
            <div className="mb-4 flex items-center gap-3">
              <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-[-0.02em] text-fg">
                {agent.name}
              </h1>
              <T2ABadge tone={methodTone(formValues.method)} size="md">
                {formValues.method}
              </T2ABadge>
            </div>

            <T2ATabs
              tabs={TABS}
              value={tab}
              onChange={setTab}
              label="Agent sections"
              className="mb-5"
            />

            {/* Panels stay mounted: an unmounted input submits nothing. */}
            <form id="agent-form" action={action} className="flex flex-col">
              <T2ATabPanel value="config" active={tab === "config"} keepMounted>
                <div className="flex flex-col gap-3">
                  <T2AInput
                    id="name"
                    name="name"
                    label="Name"
                    value={formValues.name}
                    onChange={(e) =>
                      setFormValues((current) => ({ ...current, name: e.target.value }))
                    }
                    disabled={isPending}
                  />

                  <T2ATextArea
                    id="task"
                    name="task"
                    label="Task"
                    rows={6}
                    value={formValues.task}
                    onChange={(e) =>
                      setFormValues((current) => ({ ...current, task: e.target.value }))
                    }
                    required
                    disabled={isPending}
                  />

                  <input
                    type="hidden"
                    name="temperature"
                    value={formValues.temperature}
                  />
                  <T2ASlider
                    id="temperature"
                    label="Temperature"
                    min={0}
                    max={1}
                    step={0.01}
                    value={formValues.temperature}
                    onChange={(temp) =>
                      setFormValues((current) => ({ ...current, temperature: temp }))
                    }
                    disabled={isPending}
                  />

                  <div className="flex flex-col gap-1.5">
                    <span className={typeLabel}>Method</span>
                    <input type="hidden" name="method" value={formValues.method} />
                    <T2ASegmented
                      label="HTTP method"
                      options={METHOD_OPTIONS}
                      value={formValues.method}
                      onChange={(method) =>
                        setFormValues((current) => ({ ...current, method }))
                      }
                      disabled={isPending}
                    />
                  </div>
                </div>
              </T2ATabPanel>

              <T2ATabPanel value="schema" active={tab === "schema"} keepMounted>
                <div className="flex flex-col gap-4">
                  {inertInputSchema && (
                    <p className="flex items-start gap-2 rounded-md border border-warn/40 bg-warn/12 px-3 py-2 text-xs text-warn">
                      <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
                      This agent is GET, which sends no request body — the input schema
                      never receives input. Switch to POST to use it.
                    </p>
                  )}
                  {/* Side by side only where each editor still has room. */}
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <input
                      type="hidden"
                      name="inputSchema"
                      value={formValues.inputSchema}
                    />
                    <T2AJsonEditor
                      label="Input schema"
                      value={formValues.inputSchema}
                      onChange={(inputSchema) =>
                        setFormValues((current) => ({ ...current, inputSchema }))
                      }
                      disabled={isPending}
                      hint="Describes the request body."
                    />

                    <input
                      type="hidden"
                      name="outputSchema"
                      value={formValues.outputSchema}
                    />
                    <T2AJsonEditor
                      label="Output schema"
                      value={formValues.outputSchema}
                      onChange={(outputSchema) =>
                        setFormValues((current) => ({ ...current, outputSchema }))
                      }
                      disabled={isPending}
                      hint="Response is parsed against this; unparseable output is wrapped."
                    />
                  </div>
                </div>
              </T2ATabPanel>

              <T2ATabPanel value="tools" active={tab === "tools"} keepMounted>
                <McpSection
                  value={mcpConfig}
                  onChange={setMcpConfig}
                  disabled={isPending}
                />
              </T2ATabPanel>

              {/* MCP config travels with the agent form via these hidden fields. */}
              <input type="hidden" name="mcpEnabled" value={String(mcpConfig.mcpEnabled)} />
              <input type="hidden" name="maxToolRounds" value={String(mcpConfig.maxToolRounds)} />
              <input type="hidden" name="timeoutMs" value={String(mcpConfig.timeoutMs)} />
              <input type="hidden" name="mcpServers" value={JSON.stringify(mcpPayload.servers)} />
            </form>

            <T2ATabPanel value="integration" active={tab === "integration"}>
              <IntegrationPanel
                url={endpoint}
                method={formValues.method}
                token={agent.token}
                inputSchema={formValues.inputSchema}
                outputSchema={formValues.outputSchema}
              />
            </T2ATabPanel>

            {state.error && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-danger">
                <AlertCircle size={12} aria-hidden />
                {state.error}
              </p>
            )}

            <div className="mt-8 border-t border-border pt-4">
              <DeleteAgentButton
                agentId={agent.id}
                agentName={agent.name}
                variant="generic"
                onDeleted={() => router.push("/dashboard")}
              />
            </div>

            <SaveBar
              visible={hasChanges}
              isPending={isPending}
              formId="agent-form"
              onDiscard={discard}
            />
          </div>

          {/* Always-visible integration reference; the tab carries the full detail. */}
          <aside className="hidden lg:block">
            <div className="sticky top-[4.5rem] flex flex-col gap-4 rounded-md border border-border bg-surface px-4 py-4">
              <div className="flex flex-col gap-1.5">
                <span className={typeLabel}>Endpoint</span>
                <div className="flex items-center gap-2">
                  <T2ABadge tone={methodTone(formValues.method)}>
                    {formValues.method}
                  </T2ABadge>
                  <T2ACopyableInput
                    value={endpoint}
                    label="Endpoint URL"
                    className="min-w-0 flex-1"
                  />
                </div>
              </div>
              <T2ACopyableInput value={agent.token} label="Token" showLabel />
              <button
                type="button"
                onClick={() => setTab("integration")}
                className="cursor-pointer self-start rounded-sm text-xs font-medium text-fg-muted transition-colors duration-[var(--dur-fast)] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                View cURL and response shape →
              </button>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
