"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { navItems } from "./nav-items";

/**
 * Bottom bar below `md`, where the icon rail is hidden. It is a layout sibling
 * (not fixed), so panes sized against the viewport can subtract its height.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 flex h-14 shrink-0 items-stretch border-t border-border bg-surface/95 backdrop-blur md:hidden"
    >
      {navItems.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-[var(--dur-fast)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
              active ? "text-fg" : "text-fg-subtle"
            )}
          >
            {/* Bar + full-opacity icon — never colour alone. */}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent"
              />
            )}
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
