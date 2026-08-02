import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

interface T2AEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function T2AEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: T2AEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-inset text-fg-subtle">
        <Icon size={18} aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-fg">{title}</p>
        {description && (
          <p className="text-sm text-fg-subtle">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
