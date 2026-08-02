# Design System Reference

**The single source of truth is `design-system/t2a/MASTER.md`.** Read it before writing any UI.
This file is a pointer only — do not restate tokens or component specs here, they drift.

## How to use it

1. Building a specific page? Check `design-system/t2a/pages/<page>.md` first — a page file
   **overrides** MASTER for that route.
2. Otherwise follow `design-system/t2a/MASTER.md`.
3. Mid-revamp sequencing (what lands in which phase) lives in `design-system/t2a/REVAMP.md`.

## The three rules that get broken most

- **Components use `T2A*`, not `Ss*`.** Everything in `components/ui/` is `T2AButton`,
  `T2ACard`, `T2AInput`, … Keep the prefix.
- **No raw hex in a component.** Tokens are declared in `app/globals.css` under `@theme`
  (Tailwind v4) and used as `bg-surface`, `text-fg-muted`, `border-border`, `text-accent`, …
- **Dark-first.** `bg-white`, `border-black`, `border-2`, and `text-zinc-*` are the old
  neo-brutalist system and are being removed. Never add new ones.

Machine text (IDs, tokens, URLs, JSON, tool names, durations) is `font-mono`; prose is Inter
(`font-sans`). Icons are `lucide-react` only — `react-icons` is for third-party logos (FcGoogle).
