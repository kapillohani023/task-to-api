# T2A Design System — MASTER

> **LOGIC:** When building a specific page, first check `design-system/t2a/pages/<page>.md`.
> If that file exists, its rules **override** this file. Otherwise follow the rules below.

**Project:** T2A (Task → API)
**Category:** Developer Tool / API Developer Portal
**Stack:** Next.js 16 (App Router, RSC) · React 19 · Tailwind CSS v4 · lucide-react
**Dials:** Variance 6/10 (balanced-modern) · Motion 5/10 (standard) · Density 8/10 (dense/dashboard)
**Source:** `ui-ux-pro-max` — style *Modern Dark*, product *Developer Tool / IDE* + *API Developer Portal*, type pairing *Inter / Inter*.
**Revised:** 2026-08-02 — hand-tuned for web (the generated file was React-Native flavored and had a card-on-background collision; those specs are replaced below).

---

## 1. Identity

**Name of the look: "Console."**

T2A turns a prompt into a live HTTP endpoint. The UI should feel like the thing it produces: an
instrument panel, not a form. Three ideas carry the whole system:

1. **Dark-first surfaces, hairline structure.** Depth comes from a stack of near-black surfaces and
   1px translucent borders — not from 2px black outlines and not from big shadows.
2. **Monospace is a semantic, not a decoration.** Anything the machine consumes or emits — IDs,
   tokens, URLs, JSON, tool names, durations — is mono. Prose is Inter. The eye learns the split.
3. **Green means live.** A single accent (`--accent`, emerald) is reserved for "this endpoint is
   real and running": the Run button, the 200 pill, the enabled-tool switch. Nothing decorative is green.

### What this replaces

The current UI is neo-brutalist: `border-2 border-black` on `bg-white`, flat green/yellow fills,
`shadow-[6px_6px_0_0_#000]` toast. It is consistent but reads as a prototype, and it is the *loudest*
possible frame for content (JSON, schemas, tool lists) that needs to recede. Every 2px black border
becomes a 1px `--border` hairline; every white surface becomes a `--surface` step.

---

## 2. Tokens

Declare in `app/globals.css` under `@theme` (Tailwind v4). **Never write a raw hex in a component.**

```css
@import "tailwindcss";

@theme {
  /* ---- surfaces (dark is the default and only mode at launch) ---- */
  --color-base:      #020617;  /* page background            */
  --color-surface:   #0B1120;  /* cards, panels              */
  --color-elevated:  #111A2E;  /* dialogs, popovers, hover   */
  --color-inset:     #060D1B;  /* code blocks, input wells   */

  /* ---- structure ---- */
  --color-border:        #1E293B;             /* default hairline      */
  --color-border-subtle: rgb(148 163 184/.10);/* inside dense groups   */
  --color-border-strong: #334155;             /* focus-adjacent, heads */

  /* ---- text ---- */
  --color-fg:        #F8FAFC;  /* headings, primary          */
  --color-fg-muted:  #94A3B8;  /* labels, secondary  8.9:1   */
  --color-fg-subtle: #64748B;  /* captions, hints    5.0:1   */

  /* ---- accent: "live" ---- */
  --color-accent:      #22C55E;
  --color-accent-fg:   #04140A;  /* text ON accent, 12.4:1   */
  --color-accent-dim:  #16A34A;  /* pressed                  */
  --color-accent-glow: rgb(34 197 94/.18);

  /* ---- semantic ---- */
  --color-info:      #38BDF8;
  --color-warn:      #FBBF24;
  --color-danger:    #F87171;   /* on dark, 400 not 500      */
  --color-danger-bg: rgb(248 113 113/.12);

  /* ---- HTTP method (never color-only — always paired with the text) ---- */
  --color-method-get:  #38BDF8;
  --color-method-post: #FBBF24;

  /* ---- syntax (JSON viewer) ---- */
  --color-syn-key:    #7DD3FC;
  --color-syn-string: #86EFAC;
  --color-syn-number: #FBBF24;
  --color-syn-bool:   #C4B5FD;
  --color-syn-null:   #64748B;
  --color-syn-punct:  #475569;

  /* ---- type ---- */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, "SF Mono", monospace;

  /* ---- radius ---- */
  --radius-sm: 6px;    /* badges, chips, inputs   */
  --radius-md: 10px;   /* buttons, cards          */
  --radius-lg: 14px;   /* dialogs, panels         */

  /* ---- elevation: rings first, shadows barely ---- */
  --shadow-panel: 0 1px 0 0 rgb(255 255 255/.03) inset;
  --shadow-pop:   0 16px 40px -12px rgb(2 6 23/.8);
  --shadow-glow:  0 0 0 1px var(--color-accent-glow), 0 8px 24px -8px var(--color-accent-glow);

  /* ---- motion ---- */
  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast:   120ms;   /* hover, press          */
  --dur-base:   200ms;   /* enter, expand         */
  --dur-slow:   320ms;   /* dialog, pane          */
}
```

### Spacing (density 8/10)

Use Tailwind's scale; the dense rhythm is `1 / 2 / 3 / 4 / 6 / 8` (4–32px). Rules:

| Context | Value |
|---|---|
| Icon ↔ label gap | `gap-2` (8px) |
| Field ↔ field (form stack) | `gap-3` (12px) |
| Card padding | `p-4` (16px), `p-5` on the widest breakpoint |
| Panel/section padding | `px-5 py-4` |
| Section ↔ section | `gap-6` (24px) |
| App shell gutters | `px-4 md:px-6` |
| Max content width | `max-w-6xl` for dashboard, `max-w-none` for the playground (it is full-bleed) |

### Typography

Inter for UI (variable, `next/font/google`), Geist Mono for machine text (already loaded — see §7 bug 1).

| Role | Class | Use |
|---|---|---|
| `display` | `text-2xl font-semibold tracking-[-0.02em] text-fg` | Page title only |
| `h2` | `text-lg font-semibold tracking-[-0.01em] text-fg` | Panel headings |
| `h3` | `text-sm font-semibold text-fg` | Sub-sections |
| `body` | `text-sm text-fg` | Default. 14px, not 16 — this is a dense tool |
| `label` | `text-xs font-medium uppercase tracking-[0.08em] text-fg-muted` | Field labels, panel eyebrows |
| `hint` | `text-xs text-fg-subtle` | Helper + error-adjacent text |
| `mono` | `font-mono text-[13px] tracking-tight text-fg-muted` | IDs, URLs, tool names, durations |
| `code` | `font-mono text-[13px] leading-[1.6]` | JSON blocks, cURL |

Line-height 1.5 everywhere except code (1.6) and display (1.2).

---

## 3. Components (`components/ui/T2A*`)

Keep the `T2A` prefix. (`.claude/commands/design-system.md` says `Ss*` — that is stale and contradicts
every file in `components/ui/`. Fix the doc, not the code.)

### Existing — restyle

| Component | Change |
|---|---|
| `T2AButton` | Variants → `primary` (accent fill, `text-accent-fg`), `secondary` (`bg-elevated` + `border`), `ghost`, `outline`, `danger` (`text-danger` + `border-danger/40`, fill only on hover), `icon`. Heights **32 / 36 / 40px** (`sm/md/lg`); icon = 36×36 with a 44px tap target via `before:` pseudo on touch. Press = `active:translate-y-px`, no scale. Focus = `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-base`. |
| `T2ACard` | `surface` (default: `bg-surface border border-border`), `inset` (`bg-inset`), `elevated` (`bg-elevated shadow-pop`). Drop `shadow-lg`. Radius `--radius-md`. |
| `T2AInput` / `T2ATextArea` | `bg-inset border border-border`, `placeholder:text-fg-subtle`, focus `border-border-strong + ring-1 ring-accent/40`. Add `mono?: boolean` for schema/URL fields. Error: `border-danger` + message with a `<AlertCircle size={12}/>` — never color alone. |
| `T2ASlider` | Custom track: 4px `bg-border` rail, accent fill to the left of the thumb, 14px thumb `bg-fg`. Show the numeric value in `mono`. |
| `T2ADialog` | **Rebuild on `<dialog>`** (`showModal()`): native focus trap, `::backdrop` blur, inert background, Esc for free. Enter `opacity+scale(.98→1)` `--dur-slow --ease-out`. Fixes §7 bug 3. |
| `T2AToast` | Move to **bottom-right**, `bg-elevated border border-border shadow-pop`, 3px left border in the semantic color, `<Check/>` icon, slide-up 200ms. Kill the `6px_6px_0_0_#000` block shadow. |
| `T2ACopyableInput` | Stop using `disabled` (it kills selection + focus). Use `readOnly` + `aria-readonly`, mono, `select-all` on click, copy button with a "Copied" tooltip. Fixes §7 bug 8. |
| `T2ALoader` | Keep the 3-bar idea, recolor to `bg-accent`, and gate on `prefers-reduced-motion` (static dots when reduced). |
| `T2ADropDown` | Restyle only; native `<select>` stays. |
| `Toggle` (in `McpSection`) | Promote to `components/ui/T2ASwitch.tsx` — it is used in two places already. Off = `bg-border`, on = `bg-accent`, thumb `bg-fg`, 200ms. |

### New — required by the revamp

| Component | Purpose |
|---|---|
| `T2ABadge` | `tone: get \| post \| success \| warn \| danger \| neutral \| accent`, `size: sm \| md`. 1px border + 12% tint fill, mono uppercase text. The single source of the method pill. |
| `T2ASegmented` | Two/three-option pill group. Replaces the hand-rolled GET/POST buttons duplicated in `AddAgentDialog` and `AgentDetailPage`. Roving-tabindex keyboard support. |
| `T2ACode` | Read-only code surface: `bg-inset`, optional line numbers, language label, copy button, `overflow-x-auto`, max-height + fade. Used for cURL, raw output, tool args. |
| `T2AJsonView` | Pretty-printed JSON with the `--color-syn-*` palette, collapsible objects/arrays, key path on hover. The playground's response renderer. |
| `T2AJsonEditor` | Editable JSON textarea in mono + live parse: gutter dot turns `danger` with the parse error message under it, `accent` when valid. No CodeMirror dependency — a `<textarea>` over a highlighted `<pre>` is enough and keeps the bundle flat. |
| `T2ATabs` | Underline tabs, `role="tablist"`, arrow-key nav. Used by agent detail + playground response pane. |
| `T2AEmptyState` | Icon + title + one line + primary action. Replaces the bare "No agents yet." / "No servers yet." strings. |
| `T2ASkeleton` | Shimmer blocks for `loading.tsx` — currently those files exist but render nothing structural. |
| `T2AKbd` | `⌘` `↵` key caps for the shortcut hints (Run = `⌘↵`, palette = `⌘K`). |
| `T2AStatusDot` | 6px dot + label: `idle / running / ok / error`. Paired text always present. |

---

## 4. Layout

### App shell (new `app/(app)/layout.tsx`)

```
┌──────────────────────────────────────────────────────────────┐
│ ▌T2A   agents ▸ Invoice Parser        [⌘K]      ● key   [av] │  56px topbar, bg-surface, border-b
├────┬─────────────────────────────────────────────────────────┤
│ ▤  │                                                          │  64px icon rail (md+)
│ ▶  │                  page content                            │  ▤ agents  ▶ playground
│ ⚙  │                                                          │  ⚙ settings
└────┴─────────────────────────────────────────────────────────┘
```

- Below `md` the rail becomes a **bottom bar** (`MobileNav`) carrying the same items — a layout
  sibling, not `fixed`, so full-height panes can subtract its 56px. (Specced as a bottom sheet
  trigger; a bar won because with two destinations a sheet is a tap for nothing.)
  Rail items are icon + `title` + `aria-label`, active
  item gets a 2px accent left-bar **and** full-opacity icon (never color alone).
- Topbar carries breadcrumbs (`agents / <name>`), a `⌘K` command trigger, the Gemini-key status dot
  (`accent` = set, `warn` = missing → opens `GeminiKeyDialog`), and the account menu (sign out moves here,
  out of the header button row).

### Dashboard `/dashboard`

Toolbar row: search (`/` to focus) · method filter (`All / GET / POST`) · **New agent**.
(An `MCP only` toggle was specced and built, then cut — the MCP chip on the card is enough.)
Then the grid, `sm:2 lg:3 2xl:4`, `gap-3`.

**Agent card**
```
┌───────────────────────────────────────┐
│ ⬤ IP   Invoice Parser          [POST] │  ← 32px monogram, name, method badge
│ cmf3k9…q1                             │  ← mono id, click = copy
│ Extracts line items and totals from…  │  ← task, 2-line clamp, text-fg-subtle
│ ───────────────────────────────────── │
│ temp ▓▓▓▓▓░░░ 0.35   ⚒ 4 tools   ▶ Run│  ← temp meter, MCP chip, run → playground
└───────────────────────────────────────┘
```
Hover: `border-border-strong` + `bg-elevated`, 120ms — no lift, no scale (dense grid). Delete moves
out of the corner into a `⋯` menu (it currently sits on top of the card link, which is a mis-click waiting to happen).
Empty state: `T2AEmptyState` with a terminal glyph, "No agents yet", "Describe a task, get an HTTP endpoint.", **Create your first agent**.

### Agent detail `/agent/[agentId]`

Split the 306-line single-column form into **tabs + a sticky integration rail**:

```
┌─────────────────────────────────────────┬──────────────────────┐
│ Invoice Parser                    [POST]│  ENDPOINT            │
│ ┌ Config │ Schema │ Tools │ Integration │  POST /api/agents/…  │
│                                          │  [copy] [▶ Playground]│
│  name, task, temperature                 │                      │
│  ...                                     │  TOKEN  ••••  [copy] │
│                                          │  cURL  ┌──────────┐  │
│                                          │        │ curl -X … │  │
└─────────────────────────────────────────┴──────────────────────┘
   ┌───────────────────────────────────────────────────────────┐
   │ Unsaved changes            [Discard]        [Save changes] │  ← sticky, slides up when dirty
   └───────────────────────────────────────────────────────────┘
```

- **Config**: name, task (auto-grow textarea), temperature, method (`T2ASegmented`).
- **Schema**: input + output JSON schema side-by-side on `lg`, `T2AJsonEditor` with live validation and a
  "Format" action. Inline note when method is GET *and* an input schema exists — GET sends no body, so
  the schema is inert (currently silently ignored).
- **Tools**: the existing `McpSection`, restyled — server rows become `T2ACard variant="inset"`, tool
  toggles become `T2ASwitch` rows with mono names, discovery states get proper skeleton/empty/error.
- **Integration**: full endpoint, token, cURL, response-shape preview.
- The dirty-state save bar replaces the bottom-of-page button (`hasChanges` logic already exists and is correct).

### Playground

See `pages/playground.md` — it overrides this file for that route.

---

## 5. Motion

Standard tier (5/10). Everything uses `--ease-out`, everything under 320ms, and everything is wrapped in
`@media (prefers-reduced-motion: reduce) { … animation: none }`.

| Element | Motion |
|---|---|
| Card grid mount | Stagger `opacity 0→1, y 8→0`, 40ms each, 240ms — CSS `animation-delay` via `--i`, **no GSAP dependency** (gsap is not in `package.json` and is not worth adding for this) |
| Hover/press | `--dur-fast`, color/border only |
| Dialog | Backdrop fade + panel `scale(.98)→1`, `--dur-slow` |
| Tab switch | Underline slides via `transform`, content cross-fades 120ms |
| Save bar | `translateY(100%)→0`, `--dur-base` |
| Run button → running | Label swaps to `T2ALoader`, button holds its width (reserve with `min-w`) |
| Trace events | New row fades + slides 6px; the list is `aria-live="polite"` |

Never animate `width`/`height` — use `transform` and `grid-template-rows: 0fr→1fr` for the MCP expanders.

---

## 6. Accessibility floor (non-negotiable)

- Contrast verified on `--color-base` `#020617`: `--fg` 18.1:1 · `--fg-muted` 8.9:1 · `--fg-subtle` 5.0:1
  (body-legal) · `--accent` 9.2:1 · `--danger` 7.4:1. `--accent-fg` on `--accent` = 12.4:1.
- Method is **badge text + color**, tool state is **switch position + label**, run status is **dot + word**.
  No meaning ever rides on hue alone.
- Every icon-only control gets `aria-label`; every input gets a visible `<label htmlFor>`.
- Focus ring is `ring-2 ring-accent ring-offset-2 ring-offset-base` and is never removed.
- Touch targets ≥ 44×44 on coarse pointers (`@media (pointer: coarse)`).
- Dialogs: `<dialog showModal>` for the trap; the playground's long-running Run announces via `aria-live`.

---

## 7. Bugs the revamp must fix (found in the deep dive)

1. **Fonts are loaded and then discarded.** `app/layout.tsx` wires `--font-geist-sans/mono`, but
   `app/globals.css` sets `body { font-family: Helvetica, Arial, sans-serif; }`, which wins. Every screen
   is currently rendering in Helvetica/Arial. → set `font-family: var(--font-sans)`.
2. **`window` accessed during render.** `AgentDetailPage.tsx:~250` — `` `${window.location.origin}/api/…` ``
   inside a `"use client"` component that still server-renders. → move to `useEffect`/`useSyncExternalStore`,
   or pass an absolute base URL down from the server component.
3. **`T2ADialog` is not a dialog.** No `role="dialog"`, no `aria-modal`, no focus trap, no scroll lock,
   and a backdrop click discards an in-progress form with no confirm. → native `<dialog>`.
4. **Dark mode is declared but not implemented.** `globals.css` has a `prefers-color-scheme: dark` block
   setting `--background`, while every surface is a literal `bg-white`. Going dark-first resolves this.
5. **Scrollbar is hardcoded black** (`::-webkit-scrollbar-thumb { background: black }` + `scrollbar-color: black`)
   — invisible on a dark base. → `--color-border-strong`.
6. **Delete overlays the card link** (`AgentCard.tsx` absolute button inside a `<Link>` wrapper) → move to a menu.
7. **GET + input schema is silently inert.** The API builds an input-schema prompt fragment, but `GET`
   passes `body = null`. → warn in the Schema tab.
8. **`T2ACopyableInput` uses `disabled`** on the field, so the token can't be selected or focused, and its
   `<label>` has no `htmlFor`. → `readOnly`.
9. **`loading.tsx` files exist but render nothing meaningful** → `T2ASkeleton` matching the real layout (CLS).
10. **Duplicated GET/POST button markup** in two files → `T2ASegmented`.

---

## 8. Anti-patterns

- ❌ Emoji as icons — lucide-react only, 16px inline / 18px controls / 20px nav.
- ❌ Raw hex in components — token or nothing.
- ❌ `border-2 border-black` — the whole point of the revamp.
- ❌ Light-mode-first, or a half-migrated white surface left in place.
- ❌ Spinner-only feedback on a run that can take 60s (see `timeoutMs` default) — stream a trace.
- ❌ Animating layout properties; lift/scale on dense grids.
- ❌ Color-only status.

## 9. Pre-delivery checklist

- [ ] No raw hex / no `bg-white` / no `border-black` left in `components/` or `app/`
- [ ] Fonts actually applied (bug 1) — verify computed `font-family` is Inter
- [ ] All icons lucide, consistent sizes; `cursor-pointer` on every clickable
- [ ] Hover + focus-visible on every interactive element, 120–320ms
- [ ] Contrast ≥ 4.5:1 (body) / 3:1 (UI) against `--base`
- [ ] `prefers-reduced-motion` honored by every animation
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal scroll; code blocks scroll inside their own box
- [ ] Keyboard: tab order sane, dialog traps focus, `⌘↵` runs, `Esc` closes, `/` focuses search
- [ ] Skeletons match final layout (CLS < 0.1)
- [ ] Secrets (Gemini key, MCP headers) never reach the client
