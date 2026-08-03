import { LayoutGrid, Play, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

/**
 * Primary navigation, shared by the desktop rail and the mobile bar.
 * Settings (⚙) joins this list when that route exists — see REVAMP.md.
 */
export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Agents",
    icon: LayoutGrid,
    // `/agent/[id]` belongs to Agents; `/agent/[id]/playground` does not.
    match: (p) =>
      p.startsWith("/dashboard") || (p.startsWith("/agent/") && !p.endsWith("/playground")),
  },
  {
    href: "/playground",
    label: "Playground",
    icon: Play,
    match: (p) => p === "/playground" || p.endsWith("/playground"),
  },
];
