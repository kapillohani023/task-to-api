"use client";

import { cn } from "@/lib/cn";
import { ReactNode, useEffect, useRef } from "react";

interface T2ADialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Backdrop click closes. Turn off for dialogs holding an in-progress form. */
  dismissOnBackdrop?: boolean;
}

/**
 * Built on the native `<dialog>` element: focus trap, inert background,
 * scroll lock and Esc-to-close all come from the platform (MASTER §7 bug 3).
 */
export function T2ADialog({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  dismissOnBackdrop = true,
}: T2ADialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      // `close` fires for Esc and for programmatic close — keep parent state in sync.
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (!dismissOnBackdrop) return;
        // Clicks that land on the dialog element itself are backdrop clicks.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby={title ? "t2a-dialog-title" : undefined}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-surface p-0 text-fg shadow-pop",
        "backdrop:bg-base/70 backdrop:backdrop-blur-sm",
        "open:animate-[t2a-dialog-in_var(--dur-slow)_var(--ease-out)]",
        className
      )}
    >
      {title && (
        <div className="border-b border-border px-5 py-4">
          <h2
            id="t2a-dialog-title"
            className="text-lg font-semibold tracking-[-0.01em] text-fg"
          >
            {title}
          </h2>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
    </dialog>
  );
}
