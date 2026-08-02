import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

type Variant = "surface" | "inset" | "elevated";
type Padding = "none" | "sm" | "md" | "lg";

interface T2ACardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
}

const variantClasses: Record<Variant, string> = {
  surface: "border border-border bg-surface",
  inset: "border border-border bg-inset",
  elevated: "border border-border bg-elevated shadow-pop",
};

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function T2ACard({
  variant = "surface",
  padding = "md",
  className,
  children,
  ...props
}: T2ACardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-md",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
