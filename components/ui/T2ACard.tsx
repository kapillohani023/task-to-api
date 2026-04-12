import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

type Variant = "default" | "subtle" | "elevated";
type Padding = "none" | "sm" | "md" | "lg";

interface T2ACardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
}

const variantClasses: Record<Variant, string> = {
  default:  "border-2 border-black bg-white",
  subtle:   "border border-zinc-200 bg-white",
  elevated: "border-2 border-black bg-white shadow-lg",
};

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
};

export function T2ACard({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: T2ACardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-lg",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
