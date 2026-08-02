"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Play } from "lucide-react";
import { cn } from "@/lib/cn";

// Settings (⚙) joins this list when that route exists — see REVAMP.md phase 5.
const items = [
  {
    href: "/dashboard",
    label: "Agents",
    icon: LayoutGrid,
    // `/agent/[id]` belongs to Agents; `/agent/[id]/playground` does not.
    match: (p: string) =>
      p.startsWith("/dashboard") || (p.startsWith("/agent/") && !p.endsWith("/playground")),
  },
  {
    href: "/playground",
    label: "Playground",
    icon: Play,
    match: (p: string) => p === "/playground" || p.endsWith("/playground"),
  },
];

export function AppRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-16 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface py-3 md:flex"
    >
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-[var(--dur-fast)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              active
                ? "bg-elevated text-fg"
                : "text-fg-subtle hover:bg-elevated hover:text-fg-muted"
            )}
          >
            {/* Active state is a bar + full-opacity icon, never colour alone. */}
            {active && (
              <span
                aria-hidden
                className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent"
              />
            )}
            <Icon size={20} />
          </Link>
        );
      })}
    </nav>
  );
}
