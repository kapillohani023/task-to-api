import { cn } from "@/lib/cn";

/**
 * Shimmer block. Skeletons must match the real layout box-for-box so the
 * swap costs no layout shift (MASTER §9).
 */
export function T2ASkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-sm bg-elevated bg-[length:200%_100%]",
        "bg-[linear-gradient(90deg,var(--color-elevated)_0%,var(--color-border)_50%,var(--color-elevated)_100%)]",
        "animate-[t2a-shimmer_1.4s_linear_infinite]",
        className
      )}
    />
  );
}
