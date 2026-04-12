import { cn } from "@/lib/cn";

interface T2AToastProps {
  open: boolean;
  message: string;
  className?: string;
}

export function T2AToast({ open, message, className }: T2AToastProps) {
  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed right-4 top-4 z-50 rounded border-2 border-black bg-green-300 px-4 py-3 text-sm font-medium text-black shadow-[6px_6px_0_0_#000]",
        className
      )}
    >
      {message}
    </div>
  );
}
