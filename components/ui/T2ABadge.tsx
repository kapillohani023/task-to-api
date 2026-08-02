import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

type Tone =
  | "get"
  | "post"
  | "success"
  | "warn"
  | "danger"
  | "neutral"
  | "accent";
type Size = "sm" | "md";

interface T2ABadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
}

// 1px border + ~12% tint fill. The single source of the HTTP method pill.
const toneClasses: Record<Tone, string> = {
  get: "border-method-get/40 bg-method-get/12 text-method-get",
  post: "border-method-post/40 bg-method-post/12 text-method-post",
  success: "border-accent/40 bg-accent/12 text-accent",
  accent: "border-accent/40 bg-accent/12 text-accent",
  warn: "border-warn/40 bg-warn/12 text-warn",
  danger: "border-danger/40 bg-danger/12 text-danger",
  neutral: "border-border bg-elevated text-fg-muted",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-5 px-1.5 text-[10px]",
  md: "h-6 px-2 text-[11px]",
};

export function T2ABadge({
  tone = "neutral",
  size = "sm",
  className,
  children,
  ...props
}: T2ABadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border font-mono font-medium uppercase tracking-[0.06em]",
        toneClasses[tone],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
