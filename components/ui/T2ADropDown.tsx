import { cn } from "@/lib/cn";
import { fieldBase, fieldDisabled, typeHint, typeLabel } from "@/lib/ui";
import { AlertCircle } from "lucide-react";
import { SelectHTMLAttributes } from "react";

interface T2ADropDownOption {
  value: string;
  label: string;
}

interface T2ADropDownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: T2ADropDownOption[];
  placeholder?: string;
}

export function T2ADropDown({
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  id,
  ...props
}: T2ADropDownProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className={typeLabel}>
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBase,
          "h-9 cursor-pointer px-3 text-sm",
          error && "border-danger focus:border-danger focus:ring-danger/40",
          props.disabled && fieldDisabled,
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface">
            {opt.label}
          </option>
        ))}
      </select>
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
