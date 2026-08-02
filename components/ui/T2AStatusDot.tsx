import { cn } from "@/lib/cn";

export type T2AStatus = "idle" | "running" | "ok" | "error";

const dotClasses: Record<T2AStatus, string> = {
  idle: "bg-fg-subtle",
  running: "bg-warn animate-pulse",
  ok: "bg-accent",
  error: "bg-danger",
};

const defaultLabel: Record<T2AStatus, string> = {
  idle: "Idle",
  running: "Running",
  ok: "OK",
  error: "Error",
};

/** Dot + word. Status never rides on hue alone (MASTER §6). */
export function T2AStatusDot({
  status,
  label,
  className,
}: {
  status: T2AStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-fg-muted", className)}>
      <span
        aria-hidden
        className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[status])}
      />
      {label ?? defaultLabel[status]}
    </span>
  );
}
