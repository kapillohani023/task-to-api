"use client";

import { T2ADialog } from "@/components/ui/T2ADialog";
import { T2AKbd } from "@/components/ui/T2AKbd";

const GROUPS: { title: string; rows: { keys: string[]; label: string }[] }[] = [
  {
    title: "Anywhere",
    rows: [
      { keys: ["⌘", "K"], label: "Open the command palette" },
      { keys: ["?"], label: "Show this list" },
      { keys: ["Esc"], label: "Close a dialog" },
    ],
  },
  {
    title: "Agents",
    rows: [{ keys: ["/"], label: "Focus the search field" }],
  },
  {
    title: "Playground",
    rows: [
      { keys: ["⌘", "↵"], label: "Run the agent" },
      { keys: ["Esc"], label: "Cancel a running agent" },
    ],
  },
];

export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <T2ADialog open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="flex flex-col gap-5">
        {GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-fg-muted">
              {group.title}
            </p>
            <ul className="flex flex-col gap-1.5">
              {group.rows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 text-sm text-fg-muted"
                >
                  <span>{row.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {row.keys.map((key) => (
                      <T2AKbd key={key}>{key}</T2AKbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </T2ADialog>
  );
}
