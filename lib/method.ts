import type { T2ASegmentedOption } from "@/components/ui/T2ASegmented";

export type HttpMethod = "GET" | "POST";

/** Single source of the GET/POST choice — MASTER §7 bug 10. */
export const METHOD_OPTIONS: T2ASegmentedOption<HttpMethod>[] = [
  { value: "GET", label: "GET", tone: "get" },
  { value: "POST", label: "POST", tone: "post" },
];

export const methodTone = (method: string) =>
  method === "GET" ? ("get" as const) : ("post" as const);
