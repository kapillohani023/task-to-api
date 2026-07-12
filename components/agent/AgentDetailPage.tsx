"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateAgentAction } from "@/app/actions/agent";
import type { Agent } from "@prisma/client";
import { T2AInput } from "@/components/ui/T2AInput";
import { T2ASlider } from "@/components/ui/T2ASlider";
import { T2ATextArea } from "@/components/ui/T2ATextArea";
import { T2AButton } from "@/components/ui/T2AButton";
import { T2ALoader } from "@/components/ui/T2ALoader";
import { T2ACopyableInput } from "@/components/ui/T2ACopyableInput";
import { T2AToast } from "@/components/ui/T2AToast";
import { DeleteAgentButton } from "@/components/dashboard/DeleteAgentButton";
import { McpSection } from "@/components/agent/McpSection";
import type { ClientMcpServer, McpConfig, McpServerInput } from "@/lib/mcp-types";
import { ArrowLeft } from "lucide-react";

type AgentFormValues = {
  name: string;
  task: string;
  temperature: number;
  inputSchema: string;
  outputSchema: string;
  method: "GET" | "POST";
};

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
}: {
  agent: Agent;
  servers: ClientMcpServer[];
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
  const [showSavedToast, setShowSavedToast] = useState(false);
  const wasPendingRef = useRef(false);

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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <T2AToast open={showSavedToast} message="Changes saved successfully." />

      <header className="sticky top-0 z-10 flex items-center gap-4 border-b-2 border-black bg-white px-6 py-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded border-2 border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-black"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <form id="agent-form" action={action} className="flex flex-col gap-5">
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
            rows={4}
            value={formValues.task}
            onChange={(e) =>
              setFormValues((current) => ({ ...current, task: e.target.value }))
            }
            required
            disabled={isPending}
          />

          <input type="hidden" name="temperature" value={formValues.temperature} />
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

          <T2ATextArea
            id="inputSchema"
            name="inputSchema"
            label="Input Schema"
            rows={4}
            value={formValues.inputSchema}
            onChange={(e) =>
              setFormValues((current) => ({
                ...current,
                inputSchema: e.target.value,
              }))
            }
            disabled={isPending}
          />

          <T2ATextArea
            id="outputSchema"
            name="outputSchema"
            label="Output Schema"
            rows={4}
            value={formValues.outputSchema}
            onChange={(e) =>
              setFormValues((current) => ({
                ...current,
                outputSchema: e.target.value,
              }))
            }
            disabled={isPending}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Token</label>
            <T2ACopyableInput value={agent.token} label="Token" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Method</label>
            <div className="flex gap-2">
              <input type="hidden" name="method" value={formValues.method} />
              <button
                type="button"
                onClick={() =>
                  setFormValues((current) => ({ ...current, method: "GET" }))
                }
                disabled={isPending}
                className={`rounded border-2 border-black px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                  formValues.method === "GET"
                    ? "bg-green-400 text-black"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                GET
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormValues((current) => ({ ...current, method: "POST" }))
                }
                disabled={isPending}
                className={`rounded border-2 border-black px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
                  formValues.method === "POST"
                    ? "bg-yellow-400 text-black"
                    : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                POST
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">API URL</label>
            <T2ACopyableInput
              value={`${window.location.origin}/api/agents/${agent.id}`}
              label="API URL"
            />
          </div>

          {/* MCP config travels with the agent form via these hidden fields. */}
          <input type="hidden" name="mcpEnabled" value={String(mcpConfig.mcpEnabled)} />
          <input type="hidden" name="maxToolRounds" value={String(mcpConfig.maxToolRounds)} />
          <input type="hidden" name="timeoutMs" value={String(mcpConfig.timeoutMs)} />
          <input type="hidden" name="mcpServers" value={JSON.stringify(mcpPayload.servers)} />

          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        </form>

        <div className="mt-6">
          <McpSection value={mcpConfig} onChange={setMcpConfig} disabled={isPending} />
        </div>

        <div className="mt-6 flex items-center justify-between border-t-2 border-black pt-4">
          <DeleteAgentButton
            agentId={agent.id}
            agentName={agent.name}
            variant="generic"
            onDeleted={() => router.push("/dashboard")}
          />
          <T2AButton type="submit" form="agent-form" disabled={isPending || !hasChanges}>
            {isPending ? <T2ALoader size="sm" /> : "Save Changes"}
          </T2AButton>
        </div>
      </main>
    </div>
  );
}
