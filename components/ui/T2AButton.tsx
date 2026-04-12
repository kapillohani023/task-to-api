import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "icon";
type Size = "sm" | "md" | "lg" | "icon";

interface T2AButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:   "border-2 border-black bg-black text-white hover:bg-zinc-800",
  secondary: "border-2 border-black bg-white text-black hover:bg-zinc-100",
  ghost:     "border-2 border-transparent bg-transparent text-black hover:bg-zinc-100",
  danger:    "border-2 border-black bg-transparent text-black hover:bg-red-700 hover:text-white",
  outline:   "border-2 border-black bg-transparent text-black hover:bg-zinc-100",
  icon:      "border-2 border-transparent bg-transparent text-black hover:bg-zinc-100",
};

const sizeClasses: Record<Size, string> = {
  sm:   "px-3 py-1.5 text-sm",
  md:   "px-4 py-2 text-base",
  lg:   "px-5 py-3 text-base",
  icon: "h-10 w-10 flex items-center justify-center",
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
        "cursor-pointer inline-flex items-center justify-center gap-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1",
        variantClasses[variant],
        sizeClasses[size],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}
