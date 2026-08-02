"use client";

import { T2ACode } from "@/components/ui/T2ACode";
import { T2ACopyableInput } from "@/components/ui/T2ACopyableInput";
import { T2ABadge } from "@/components/ui/T2ABadge";
import { methodTone, type HttpMethod } from "@/lib/method";
import { parseSchema, sampleBody, sampleFromSchema } from "@/lib/json-schema";
import { typeLabel } from "@/lib/ui";

export function buildCurl({
  url,
  method,
  token,
  body,
}: {
  url: string;
  method: HttpMethod;
  token: string;
  /** Request body for POST; ignored for GET, which sends none. */
  body?: string;
}): string {
  if (method === "GET") {
    return [`curl ${url} \\`, `  -H "Authorization: Bearer ${token}"`].join("\n");
  }

  // Collapse to a single line so the -d payload stays copy-pasteable.
  const payload = compact(body ?? "{}");
  return [
    `curl -X POST ${url} \\`,
    `  -H "Authorization: Bearer ${token}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '${payload}'`,
  ].join("\n");
}

function compact(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json));
  } catch {
    return json.replace(/\s+/g, " ").trim() || "{}";
  }
}

/** The shape the route actually returns — see app/api/agents/[agentId]/route.ts. */
function responseShape(outputSchema: string): string {
  const schema = parseSchema(outputSchema);
  if (!schema || !schema.properties) {
    return JSON.stringify({ result: "…" }, null, 2);
  }
  return JSON.stringify(sampleFromSchema(schema), null, 2);
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
          code={buildCurl({ url, method, token, body: sampleBody(inputSchema) })}
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
