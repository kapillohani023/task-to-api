import { cn } from "@/lib/cn";

interface T2ASliderProps {
  id?: string;
  label?: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function T2ASlider({
  id,
  label,
  hint,
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  className,
}: T2ASliderProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-sm font-medium text-zinc-700">
            {label}
          </label>
          <span className="text-sm font-medium tabular-nums text-black">
            {value.toFixed(2)}
          </span>
        </div>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full border-2 border-black bg-zinc-100 accent-black",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      />
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
