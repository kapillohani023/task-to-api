import { cn } from "@/lib/cn";
import { fieldBase, fieldDisabled, typeHint, typeLabel } from "@/lib/ui";
import { AlertCircle } from "lucide-react";
import { InputHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

interface T2AInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: InputSize;
  /** Machine text (ids, urls, schemas) renders in Geist Mono — MASTER §1. */
  mono?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8 text-sm",
  md: "h-9 text-sm",
  lg: "h-10 text-sm",
};

export function T2AInput({
  label,
  hint,
  error,
  size = "md" as InputSize,
  mono,
  className,
  id,
  ...props
}: T2AInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className={typeLabel}>
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBase,
          "px-3",
          sizeClasses[size],
          mono && "font-mono text-[13px] tracking-tight",
          error && "border-danger focus:border-danger focus:ring-danger/40",
          props.disabled && fieldDisabled,
          className
        )}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle size={12} aria-hidden />
          {error}
        </p>
      )}
      {hint && !error && <p className={typeHint}>{hint}</p>}
    </div>
  );
}
