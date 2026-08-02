# T2A Revamp — Rollout Plan

Companion to `MASTER.md` (system) and `pages/playground.md` (new surface).
This file is the *sequence*: what to change, in what order, and how to not break things mid-flight.

---

## Where the codebase stands

| Area | Today | Verdict |
|---|---|---|
| Runtime | Next 16 App Router, React 19, RSC-first, Server Actions, Prisma/Postgres, NextAuth v5 (Google) | Solid. No framework work needed. |
| Data model | `User → Agent → McpServer`. No run history, no usage counters. | Fine. The playground needs **no migration**. |
| Agent execution | `app/api/agents/[agentId]/route.ts` — bearer auth, method gate, prompt assembly, MCP session, Gemini `automaticFunctionCalling`, JSON-parse-or-wrap | Logic is good; it's just **trapped in the route handler** and emits nothing observable. |
| MCP | `lib/mcp-runtime.ts` — parallel connect, fail-fast, per-server tool disable via a `CallableTool` wrapper | Well-built. The `withDisabledFilter` wrapper is the natural instrumentation seam. |
| UI kit | 11 `T2A*` primitives, consistent neo-brutalist (`border-2 border-black` on white) | Consistent but wrong register for a dev tool, and missing everything data-shaped (badge, tabs, code, JSON, skeleton, empty state). |
| Screens | signin · dashboard (header + grid) · agent detail (306-line single-column form) · terms/privacy | Detail page is the pressure point: 6 fields + MCP config + token + URL + delete all in one scroll. |
| Docs drift | `.claude/commands/design-system.md` documents an `Ss*` prefix and a light palette; the code uses `T2A*` | Update the doc as part of Phase 0. |

**Ten concrete bugs found** are listed in `MASTER.md` §7. Two are user-visible today and worth fixing
regardless of whether the revamp ships: the Helvetica override that discards the loaded Geist fonts, and
the `window.location.origin` read during render in `AgentDetailPage`.

---

## Phases

Each phase is independently shippable and leaves the app working.

**Status:** Phase 0 ✅ · Phase 1 ✅ · Phase 2 ✅ · Phase 3 ✅ (2026-08-02) · Phase 4–5 pending.
Phase 1 shipped the token migration across every screen, so `bg-white` / `border-black` /
`text-zinc-*` are now zero-occurrence in `app/` and `components/` — keep it that way.
Phase 2 moved `/dashboard` and `/agent/[agentId]` under `app/(app)/` (URLs unchanged) behind a
shared shell: topbar (brand · breadcrumbs · key status · account menu) + icon rail.
Phase 3 split the detail page into Config / Schema / Tools / Integration tabs + a sticky
integration rail + a dirty-state save bar. **Tab panels holding form fields must stay mounted**
(`T2ATabPanel keepMounted`) — an unmounted input contributes nothing to `FormData`, so
unmounting the Config panel would silently blank `name`/`task` on save.
Deferred by design, with the note of where they land:
- `T2AJsonView` → Phase 4 (the playground's response renderer). `T2AJsonEditor` shipped in Phase 3.
- Rail items for playground (▶) and settings (⚙) → added when those routes exist (Phase 4/5);
  the rail renders only Agents today rather than dead nav.
- The `⌘K` topbar trigger → Phase 5 with the palette itself, same reason.
- The Run action on the agent card → Phase 4, when `/playground` exists.

### Phase 0 — Foundation (no visual change to logic)
1. `app/globals.css`: replace the token block with MASTER §2, fix `body { font-family: var(--font-sans) }`,
   fix the scrollbar colors, add the `prefers-reduced-motion` guard.
2. `app/layout.tsx`: swap Geist Sans → **Inter** (`--font-inter`), keep Geist Mono.
3. Fix `window.location.origin` (pass a base URL from the server component).
4. Update `.claude/commands/design-system.md` to match reality (`T2A*`, dark tokens) — or delete it in
   favor of `design-system/t2a/MASTER.md` as the single source.

### Phase 1 — Primitives
Restyle the 11 existing `T2A*` components against the new tokens; rebuild `T2ADialog` on native `<dialog>`;
promote `Toggle` → `T2ASwitch`. Add `T2ABadge`, `T2ASegmented`, `T2ACode`, `T2ATabs`, `T2AEmptyState`,
`T2ASkeleton`, `T2AKbd`, `T2AStatusDot`. **The app goes dark at the end of this phase** — every
`bg-white` / `border-black` in `app/` and `components/` must be gone before merging, or the result is a
half-migrated UI, which looks worse than either end state.

### Phase 2 — Shell + Dashboard
New `app/(app)/layout.tsx` with the icon rail + topbar; move sign-out into the account menu; dashboard
toolbar (search, method filter, MCP filter); redesigned `AgentCard` (monogram, mono id, task clamp, temp
meter, tool count, Run action); `T2AEmptyState`; real skeletons in `loading.tsx`.

### Phase 3 — Agent detail
Split into `T2ATabs` (Config / Schema / Tools / Integration) + sticky integration rail + dirty-state save
bar. Reuse the existing `hasChanges` computation as the save-bar trigger. Restyle `McpSection` in place —
its state model is already correct, only the chrome changes. Add the GET + input-schema warning.

### Phase 4 — Playground (the new surface)
**4a. Backend** — extract `lib/run-agent.ts`, instrument `openMcpSession` + the `callTool` wrapper, add
`POST /api/agents/[agentId]/playground` (session-guarded, NDJSON stream, `AbortSignal`). Public route
behavior must be byte-identical after the extraction; that's the acceptance test.
**4b. Frontend** — `/playground` and `/agent/[agentId]/playground` per `pages/playground.md`:
three panes, `T2AJsonEditor`, streaming trace, schema verdict, raw output, cURL, session history.

### Phase 5 — Polish
Command palette (`⌘K`), `/` to focus search, keyboard map, stagger-in on the grid, 375/768/1024/1440 pass,
full checklist in MASTER §9 + playground §6.

---

## Effort / value

| Phase | Value | Notes |
|---|---|---|
| 0 | High / trivial | Two real bugs; unblocks everything else |
| 1 | High | The bulk of the "techy SaaS" feel lives here |
| 2 | Medium-high | First impression + the Run entry point |
| 3 | High | Fixes the worst usability pressure in the product |
| 4a | **Highest** | Nothing else in the product tells you *why* a run failed |
| 4b | Highest | The feature the user actually asked for |
| 5 | Medium | Do it last, don't skip it |

---

## Risks

- **Half-migration.** Phase 1 must land atomically across `components/` and `app/`. A dark shell around a
  white card is worse than the current UI.
- **Trace fidelity.** The Gemini SDK owns the tool loop, so per-round model reasoning isn't observable.
  Show what's real (MCP connect, tool call args/result/duration, round count, totals) and don't fake the rest.
- **Long tool results.** MCP responses are unbounded; truncate in the trace with a byte count or the pane will jank.
- **Secrets.** The playground runs server-side precisely so `geminiApiKey` and MCP headers never cross the
  wire. Trace events carry header *keys* only.
- **Cancel must really cancel.** Wire `AbortSignal` into `generateContent` and close MCP clients in `finally`,
  or a cancelled run keeps burning quota.

---

## Out of scope (named so it isn't assumed)

Run persistence / history across reloads (`AgentRun` model), usage analytics or cost tracking, agent
versioning + diffing, multi-model support (`TOOL_MODEL` is a single constant today), team/sharing, and a
light theme. Each is a real feature, none is needed for this revamp.
