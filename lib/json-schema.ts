/**
 * A deliberately small JSON-Schema subset: enough to generate a sample body and
 * to tell the user *why* an output missed its schema. Not a spec-complete
 * validator — no $ref, allOf/anyOf, or format assertions.
 */

export type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  default?: unknown;
  example?: unknown;
};

export function parseSchema(source: string): JsonSchema | null {
  if (source.trim() === "") return null;
  try {
    const parsed = JSON.parse(source);
    return parsed && typeof parsed === "object" ? (parsed as JsonSchema) : null;
  } catch {
    return null;
  }
}

function firstType(schema: JsonSchema): string | undefined {
  return Array.isArray(schema.type) ? schema.type[0] : schema.type;
}

/** Skeleton value for a schema node. `example`/`default` win when present. */
export function sampleFromSchema(schema: JsonSchema): unknown {
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];

  switch (firstType(schema)) {
    case "object":
      return sampleObject(schema);
    case "array":
      return schema.items ? [sampleFromSchema(schema.items)] : [];
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "null":
      return null;
    case "string":
      return "";
    default:
      return schema.properties ? sampleObject(schema) : "";
  }
}

function sampleObject(schema: JsonSchema): Record<string, unknown> {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const keys = Object.keys(props);
  // With a `required` list, lead with those — they are what the agent needs.
  const ordered = [
    ...keys.filter((k) => required.has(k)),
    ...keys.filter((k) => !required.has(k)),
  ];

  return Object.fromEntries(ordered.map((key) => [key, sampleFromSchema(props[key])]));
}

/** `{}` when the schema is unusable, so [sample] always produces valid JSON. */
export function sampleBody(schemaSource: string): string {
  const schema = parseSchema(schemaSource);
  if (!schema) return "{}";
  const sample = sampleFromSchema(schema);
  return JSON.stringify(
    sample && typeof sample === "object" ? sample : {},
    null,
    2
  );
}

export type SchemaIssue = { path: string; message: string };

function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function typeMatches(expected: string, value: unknown): boolean {
  const actual = typeOf(value);
  if (expected === "integer") return actual === "number" && Number.isInteger(value);
  if (expected === "number") return actual === "number";
  return expected === actual;
}

/** Recursive check of required keys and declared types. */
export function validateAgainstSchema(
  value: unknown,
  schema: JsonSchema,
  path = ""
): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const expected = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];

  if (expected.length > 0 && !expected.some((t) => typeMatches(t, value))) {
    issues.push({
      path: path || "(root)",
      message: `expected ${expected.join(" | ")}, got ${typeOf(value)}`,
    });
    return issues;
  }

  if (schema.enum && schema.enum.length > 0 && !schema.enum.includes(value)) {
    issues.push({
      path: path || "(root)",
      message: `expected one of ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}`,
    });
  }

  if (schema.properties && value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of schema.required ?? []) {
      if (!(key in record)) {
        issues.push({ path: path ? `${path}.${key}` : key, message: "missing required" });
      }
    }
    for (const [key, child] of Object.entries(schema.properties)) {
      if (!(key in record)) continue;
      issues.push(
        ...validateAgainstSchema(record[key], child, path ? `${path}.${key}` : key)
      );
    }
  }

  if (schema.items && Array.isArray(value)) {
    value.forEach((item, i) => {
      issues.push(...validateAgainstSchema(item, schema.items!, `${path}[${i}]`));
    });
  }

  return issues;
}

export type SchemaVerdict =
  | { status: "none" }
  | { status: "unparseable" }
  | { status: "ok" }
  | { status: "issues"; issues: SchemaIssue[] };

export function checkAgainstSchema(value: unknown, schemaSource: string): SchemaVerdict {
  if (schemaSource.trim() === "") return { status: "none" };
  const schema = parseSchema(schemaSource);
  if (!schema) return { status: "unparseable" };

  const issues = validateAgainstSchema(value, schema);
  return issues.length === 0 ? { status: "ok" } : { status: "issues", issues };
}
