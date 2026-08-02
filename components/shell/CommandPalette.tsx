"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Keyboard, LayoutGrid, Play, Search, Terminal } from "lucide-react";
import { T2AKbd } from "@/components/ui/T2AKbd";
import { T2ABadge } from "@/components/ui/T2ABadge";
import { methodTone } from "@/lib/method";
import { cn } from "@/lib/cn";
import { ShortcutsDialog } from "./ShortcutsDialog";

export type PaletteAgent = { id: string; name: string; method: string };

type PaletteContextValue = { open: () => void };
const PaletteContext = createContext<PaletteContextValue | null>(null);

export function useCommandPalette() {
  return useContext(PaletteContext);
}

type Item = {
  id: string;
  label: string;
  hint?: string;
  badge?: React.ReactNode;
  icon: React.ReactNode;
  run: () => void;
};

export function CommandPalette({
  agents,
  children,
}: {
  agents: PaletteAgent[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const openPalette = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // ⌘K / Ctrl+K anywhere; "?" opens the keyboard map when not typing.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "?" && !isTyping()) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => {
      close();
      router.push(href);
    };

    const navigation: Item[] = [
      {
        id: "nav-agents",
        label: "Agents",
        hint: "dashboard",
        icon: <LayoutGrid size={14} />,
        run: go("/dashboard"),
      },
      {
        id: "nav-playground",
        label: "Playground",
        hint: "run an agent",
        icon: <Play size={14} />,
        run: go("/playground"),
      },
      {
        id: "nav-shortcuts",
        label: "Keyboard shortcuts",
        hint: "?",
        icon: <Keyboard size={14} />,
        run: () => {
          close();
          setShortcutsOpen(true);
        },
      },
    ];

    const agentItems: Item[] = agents.flatMap((agent) => [
      {
        id: `agent-${agent.id}`,
        label: agent.name,
        hint: "open",
        badge: <T2ABadge tone={methodTone(agent.method)}>{agent.method}</T2ABadge>,
        icon: <Terminal size={14} />,
        run: go(`/agent/${agent.id}`),
      },
      {
        id: `run-${agent.id}`,
        label: `Run ${agent.name}`,
        hint: "playground",
        icon: <Play size={14} />,
        run: go(`/agent/${agent.id}/playground`),
      },
    ]);

    const all = [...navigation, ...agentItems];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((item) => item.label.toLowerCase().includes(q));
  }, [agents, query, router, close]);

  const clampedActive = Math.min(active, Math.max(items.length - 1, 0));

  return (
    <PaletteContext.Provider value={{ open: openPalette }}>
      {children}

      <dialog
        ref={dialogRef}
        onClose={close}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        aria-label="Command palette"
        className="m-0 mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-lg rounded-lg border border-border bg-surface p-0 text-fg shadow-pop backdrop:bg-base/70 backdrop:backdrop-blur-sm open:animate-[t2a-dialog-in_var(--dur-slow)_var(--ease-out)]"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search size={14} className="shrink-0 text-fg-subtle" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => (items.length === 0 ? 0 : (i + 1) % items.length));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) =>
                  items.length === 0 ? 0 : (i - 1 + items.length) % items.length
                );
              } else if (e.key === "Enter") {
                e.preventDefault();
                items[clampedActive]?.run();
              }
            }}
            placeholder="Search agents and actions"
            aria-label="Search agents and actions"
            className="h-11 w-full bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-none"
          />
          <T2AKbd className="shrink-0">esc</T2AKbd>
        </div>

        <ul className="max-h-[50vh] overflow-y-auto py-1">
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-fg-subtle">
              Nothing matches “{query}”.
            </li>
          )}
          {items.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={item.run}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-[var(--dur-fast)]",
                  i === clampedActive ? "bg-elevated text-fg" : "text-fg-muted"
                )}
              >
                <span className="shrink-0 text-fg-subtle">{item.icon}</span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge}
                {item.hint && (
                  <span className="shrink-0 font-mono text-[11px] text-fg-subtle">
                    {item.hint}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </dialog>

      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </PaletteContext.Provider>
  );
}

function isTyping(): boolean {
  const el = document.activeElement;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  );
}
