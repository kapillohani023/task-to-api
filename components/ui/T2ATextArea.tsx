import { cn } from "@/lib/cn";
import { fieldBase, fieldDisabled, typeHint, typeLabel } from "@/lib/ui";
import { AlertCircle } from "lucide-react";
import { TextareaHTMLAttributes } from "react";

type TextAreaSize = "sm" | "md" | "lg";

interface T2ATextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: TextAreaSize;
  /** Machine text (ids, urls, schemas) renders in Geist Mono — MASTER §1. */
  mono?: boolean;
}

const sizeClasses: Record<TextAreaSize, string> = {
  sm: "py-1.5 text-sm",
  md: "py-2 text-sm",
  lg: "py-2.5 text-sm",
};

export function T2ATextArea({
  label,
  hint,
  error,
  size = "md",
  mono,
  className,
  id,
  ...props
}: T2ATextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className={typeLabel}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBase,
          "resize-y px-3",
          sizeClasses[size],
          mono && "font-mono text-[13px] leading-[1.6] tracking-tight",
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
