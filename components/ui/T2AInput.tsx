import { cn } from "@/lib/cn";
import { InputHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

interface T2AInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "py-1.5 text-sm",
  md: "py-2 text-base",
  lg: "py-3 text-base",
};

export function T2AInput({
  label,
  hint,
  error,
  size = "md" as InputSize,
  className,
  id,
  ...props
}: T2AInputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        className={cn(
          "w-full rounded border-2 border-black bg-white px-4 text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black",
          sizeClasses[size],
          error && "border-red-600 focus:ring-red-600",
          props.disabled && "cursor-not-allowed bg-zinc-100 opacity-60",
          className
        )}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
