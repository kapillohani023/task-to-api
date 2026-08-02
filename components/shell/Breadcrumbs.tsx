"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbContextValue = {
  label: string | null;
  setLabel: (label: string | null) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);
  return (
    <BreadcrumbContext.Provider value={{ label, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

/**
 * Pages own the trailing crumb — only the page knows the record's name.
 * Registering it from a page keeps the topbar in the shell.
 */
export function useBreadcrumb(label: string | null) {
  const ctx = useContext(BreadcrumbContext);
  const setLabel = ctx?.setLabel;

  useEffect(() => {
    setLabel?.(label);
    return () => setLabel?.(null);
  }, [label, setLabel]);
}

export function Breadcrumbs() {
  const ctx = useContext(BreadcrumbContext);
  const pathname = usePathname();
  const onAgents = pathname === "/dashboard";

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 flex-1 items-center gap-2 text-sm"
    >
      <Link
        href="/dashboard"
        aria-current={onAgents ? "page" : undefined}
        className={`rounded-sm transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
          onAgents ? "text-fg" : "text-fg-muted hover:text-fg"
        }`}
      >
        agents
      </Link>
      {ctx?.label && (
        <>
          <span aria-hidden className="text-fg-subtle">
            /
          </span>
          <span className="min-w-0 truncate font-medium text-fg">{ctx.label}</span>
        </>
      )}
    </nav>
  );
}
