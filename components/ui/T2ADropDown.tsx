import { cn } from "@/lib/cn";
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
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        className={cn(
          "w-full rounded border-2 border-black bg-white px-4 py-2 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-black",
          error && "border-red-600 focus:ring-red-600",
          props.disabled && "cursor-not-allowed bg-zinc-100 opacity-60",
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
