import { cn } from "@/lib/cn";

export function T2AKbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-elevated px-1.5",
        "font-mono text-[11px] leading-none text-fg-muted",
        className
      )}
    >
      {children}
    </kbd>
  );
}
