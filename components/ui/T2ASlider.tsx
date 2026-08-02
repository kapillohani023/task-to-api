import { cn } from "@/lib/cn";
import { focusRing, typeHint, typeLabel } from "@/lib/ui";

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
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className={typeLabel}>
            {label}
          </label>
          <span className="font-mono text-[13px] tabular-nums tracking-tight text-fg">
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
        // 4px rail, accent fill to the left of the thumb, 14px thumb — MASTER §3.
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0 ${pct}%, var(--color-border) ${pct}% 100%)`,
        }}
        className={cn(
          "h-1 w-full cursor-pointer appearance-none rounded-full",
          "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-[var(--dur-fast)] hover:[&::-webkit-slider-thumb]:scale-110",
          "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-fg",
          focusRing,
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      />
      {hint && <p className={typeHint}>{hint}</p>}
    </div>
  );
}
