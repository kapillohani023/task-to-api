"use client";

import { T2ACode } from "@/components/ui/T2ACode";
import { T2ACopyableInput } from "@/components/ui/T2ACopyableInput";
import { T2ABadge } from "@/components/ui/T2ABadge";
import { methodTone, type HttpMethod } from "@/lib/method";
import { typeLabel } from "@/lib/ui";

export function buildCurl({
  url,
  method,
  token,
  inputSchema,
}: {
  url: string;
  method: HttpMethod;
  token: string;
  inputSchema: string;
}): string {
  const lines = [
    `curl -X ${method} ${url} \\`,
    `  -H "Authorization: Bearer ${token}"`,
  ];

  if (method === "POST") {
    lines[lines.length - 1] += ` \\`;
    lines.push(`  -H "Content-Type: application/json" \\`);
    lines.push(`  -d '${sampleBody(inputSchema)}'`);
  }

  return lines.join("\n");
}

/** A minimal object literal derived from the schema's top-level properties. */
function sampleBody(inputSchema: string): string {
  try {
    const schema = JSON.parse(inputSchema) as {
      properties?: Record<string, { type?: string }>;
    };
    const props = schema.properties;
    if (!props) return "{}";

    const sample = Object.fromEntries(
      Object.entries(props).map(([key, def]) => [key, sampleValue(def?.type)])
    );
    return JSON.stringify(sample);
  } catch {
    return "{}";
  }
}

function sampleValue(type?: string): unknown {
  switch (type) {
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "…";
  }
}

/** The shape the route actually returns — see app/api/agents/[agentId]/route.ts. */
function responseShape(outputSchema: string): string {
  if (outputSchema.trim() === "") {
    return JSON.stringify({ result: "…" }, null, 2);
  }

  try {
    const schema = JSON.parse(outputSchema) as {
      properties?: Record<string, { type?: string }>;
    };
    if (!schema.properties) return JSON.stringify({ result: "…" }, null, 2);

    const shape = Object.fromEntries(
      Object.entries(schema.properties).map(([key, def]) => [key, sampleValue(def?.type)])
    );
    return JSON.stringify(shape, null, 2);
  } catch {
    return JSON.stringify({ result: "…" }, null, 2);
  }
}

export function IntegrationPanel({
  url,
  method,
  token,
  inputSchema,
  outputSchema,
}: {
  url: string;
  method: HttpMethod;
  token: string;
  inputSchema: string;
  outputSchema: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className={typeLabel}>Endpoint</span>
        <div className="flex items-center gap-2">
          <T2ABadge tone={methodTone(method)}>{method}</T2ABadge>
          <T2ACopyableInput value={url} label="Endpoint URL" className="min-w-0 flex-1" />
        </div>
      </div>

      <T2ACopyableInput value={token} label="Token" showLabel />

      <div className="flex flex-col gap-1.5">
        <span className={typeLabel}>cURL</span>
        <T2ACode
          language="bash"
          code={buildCurl({ url, method, token, inputSchema })}
          maxHeight="max-h-52"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={typeLabel}>Response shape</span>
        <T2ACode language="json" code={responseShape(outputSchema)} maxHeight="max-h-52" />
        <p className="text-xs text-fg-subtle">
          Output that doesn&apos;t parse as JSON comes back wrapped as{" "}
          <code className="font-mono text-[11px] text-fg-muted">{"{ result: … }"}</code>.
        </p>
      </div>
    </div>
  );
}
