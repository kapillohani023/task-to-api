import { cn } from "@/lib/cn";
import { AlertCircle, Check, Info } from "lucide-react";

type Tone = "success" | "danger" | "info";

interface T2AToastProps {
  open: boolean;
  message: string;
  tone?: Tone;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  success: "border-l-accent text-fg",
  danger: "border-l-danger text-fg",
  info: "border-l-info text-fg",
};

const toneIcon: Record<Tone, typeof Check> = {
  success: Check,
  danger: AlertCircle,
  info: Info,
};

export function T2AToast({
  open,
  message,
  tone = "success",
  className,
}: T2AToastProps) {
  if (!open) return null;

  const Icon = toneIcon[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border border-border border-l-[3px] bg-elevated px-4 py-3 text-sm font-medium shadow-pop",
        "animate-[t2a-toast-in_var(--dur-base)_var(--ease-out)]",
        toneClasses[tone],
        className
      )}
    >
      <Icon
        size={16}
        aria-hidden
        className={cn(
          tone === "success" && "text-accent",
          tone === "danger" && "text-danger",
          tone === "info" && "text-info"
        )}
      />
      {message}
    </div>
  );
}
