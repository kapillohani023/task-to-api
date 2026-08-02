"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { T2ALoader } from "@/components/ui/T2ALoader";
import { getInitials } from "@/lib/util";
import { cn } from "@/lib/cn";
import { focusRingSurface } from "@/lib/ui";

export function AccountMenu({
  name,
  email,
  image,
}: {
  name: string | null;
  email: string | null;
  image: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-inset text-[11px] font-semibold text-fg-muted",
          "transition-colors duration-[var(--dur-fast)] hover:border-border-strong hover:text-fg",
          focusRingSurface
        )}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          getInitials(name || email || "?")
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-40 w-60 overflow-hidden rounded-md border border-border bg-elevated shadow-pop animate-[t2a-fade-up_var(--dur-base)_var(--ease-out)]"
        >
          <div className="border-b border-border-subtle px-3 py-2.5">
            {name && <p className="truncate text-sm font-medium text-fg">{name}</p>}
            {email && (
              <p className="truncate font-mono text-[11px] tracking-tight text-fg-subtle">
                {email}
              </p>
            )}
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={() => startTransition(() => signOutAction())}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-fg-muted",
              "transition-colors duration-[var(--dur-fast)] hover:bg-surface hover:text-fg disabled:opacity-50",
              focusRingSurface
            )}
          >
            {isPending ? <T2ALoader size="sm" /> : <LogOut size={16} />}
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
