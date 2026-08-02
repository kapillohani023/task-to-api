import { cn } from "@/lib/cn";
import { focusRing } from "@/lib/ui";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "icon";
type Size = "sm" | "md" | "lg" | "icon";

interface T2AButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-transparent bg-accent text-accent-fg hover:bg-accent-dim",
  secondary:
    "border border-border bg-elevated text-fg hover:border-border-strong",
  ghost:
    "border border-transparent bg-transparent text-fg-muted hover:bg-elevated hover:text-fg",
  danger:
    "border border-danger/40 bg-transparent text-danger hover:border-danger hover:bg-danger-bg",
  outline:
    "border border-border bg-transparent text-fg hover:border-border-strong hover:bg-elevated",
  icon: "border border-transparent bg-transparent text-fg-muted hover:bg-elevated hover:text-fg",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
  icon: "h-9 w-9",
};

export function T2AButton({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: T2AButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium",
        "transition-colors duration-[var(--dur-fast)] ease-out active:translate-y-px",
        // MASTER §6 — 44px minimum on coarse pointers.
        "[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
        focusRing,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "cursor-not-allowed opacity-50 active:translate-y-0",
        className
      )}
    >
      {children}
    </button>
  );
}
