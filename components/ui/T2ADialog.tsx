"use client";

import { cn } from "@/lib/cn";
import { ReactNode, useEffect } from "react";

interface T2ADialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function T2ADialog({ open, onClose, title, children, footer, className }: T2ADialogProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-lg border-2 border-black bg-white",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="border-b-2 border-black px-6 py-4">
            <h2 className="text-xl font-semibold tracking-tight text-black">{title}</h2>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="border-t-2 border-black px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
