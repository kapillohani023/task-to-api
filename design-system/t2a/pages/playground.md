# Page Override — Playground

> Overrides `../MASTER.md` for `/playground` and `/agent/[agentId]/playground`.
> Everything not stated here inherits from MASTER.

**Job to be done:** *"I wrote a task prompt and wired up MCP servers. Does this agent actually work, and
when it doesn't, where did it go wrong?"*

Today the only way to answer that is to copy the token out of the detail page, paste a cURL into a
terminal, wait up to 60s (`timeoutMs` default), and get back either JSON or `{"result":"…"}` with no way
to tell whether the model called a tool, which tool, or why the output missed the schema. The playground
exists to collapse that loop to one keystroke and to make the middle of the run visible.

---

## 1. Layout

Full-bleed, three panes on `xl`, two on `lg`, stacked accordion on mobile. This is the one route that
ignores `max-w-6xl`.

```
┌─ topbar ─────────────────────────────────────────────────────────────────────┐
│ ▌T2A  agents ▸ Invoice Parser ▸ playground        [⌘K]     ● key      [av]    │
├──────────────────┬───────────────────────────────┬───────────────────────────┤
│ AGENT            │ REQUEST              [POST]   │ RESPONSE                  │
│ ┌──────────────┐ │ /api/agents/cmf3k9…q1         │ ● 200  1.84s  2 tools     │
│ │Invoice Parser│▾│                               │ ┌ Output │Trace│Raw│cURL ┐│
│ └──────────────┘ │ Body            [sample][fmt] │                           │
│                  │ ┌───────────────────────────┐ │ ┌───────────────────────┐ │
│ OVERRIDES   ⟲    │ │1 {                        │ │ │ {                     │ │
│ temp  ▓▓▓░ 0.35  │ │2   "url": "https://…",    │ │ │   "total": 1240.5,    │ │
│ rounds      10   │ │3   "currency": "USD"      │ │ │   "currency": "USD",  │ │
│ timeout  60000ms │ │4 }                        │ │ │   "lines": [ … ]      │ │
│                  │ └───────────────────────────┘ │ │ }                     │ │
│ TOOLS       4 on │ ● valid JSON · matches schema │ └───────────────────────┘ │
│ ⬤ fetch_invoice  │                               │ ✓ matches output schema   │
│ ⬤ ocr_page       │ Authorization: Bearer ••••••  │                           │
│ ○ delete_file    │                               │ [copy] [save as sample]   │
│                  │        [ ▶ Run   ⌘↵ ]         │                           │
├──────────────────┴───────────────────────────────┴───────────────────────────┤
│ HISTORY  ● 200 1.84s 12:04  ● 200 2.1s 12:03  ● 500 0.4s 12:01   [clear]     │
└──────────────────────────────────────────────────────────────────────────────┘
```

- `xl` = 3 columns `280px / 1fr / 1fr`. `lg` = left pane collapses into a popover on the agent name;
  request/response stay side by side. `< lg` = single column, request → response → history, response
  auto-scrolls into view on Run.
- History is a 44px-tall strip pinned to the bottom, session-only (see §5).
- The whole page is `h-dvh overflow-hidden`; each pane scrolls independently.

---

## 2. Panes

### Left — Agent & overrides

- **Agent switcher** (`T2ADropDown` styled as a command trigger) so `/playground` works standalone and
  `/agent/[id]/playground` deep-links preselected. Switching agents pushes the route, keeps history.
- **Overrides**: `temperature`, `maxToolRounds`, `timeoutMs` — session-only, never persisted. When any
  differs from the saved agent, show an `accent` "overridden" chip and a `⟲ reset` action. This is the
  point of a playground: try 0.9 without committing it to the endpoint.
- **Tools**: read-only mirror of the agent's MCP config — server host + each enabled tool as
  `T2AStatusDot` + mono name. Disabled tools render at 40% with a strikethrough label. A "configure"
  link goes back to the detail page's Tools tab. If `mcpEnabled` is false, the whole block is an
  `T2AEmptyState`: "No tools — this agent answers from the prompt alone."

### Center — Request

- Method badge is **locked** to the agent's `method` (the API 405s on a mismatch), with the endpoint
  path in mono next to it.
- **GET agents have no body editor.** Replace it with a note: "GET requests send no body; the input
  schema is not used." (This makes bug 7 in MASTER §7 visible instead of silent.)
- **Body**: `T2AJsonEditor`. Gutter status line under it, always one of:
  `● valid JSON` / `● valid · matches input schema` / `● line 3: unexpected token` / `⚠ valid JSON, missing "url"`.
- **`[sample]`** generates a skeleton object from the agent's `inputSchema` (types → `""`, `0`, `false`,
  `[]`, `{}`; honors `required`, `enum` picks the first value, `example`/`default` win if present).
  This is the single highest-value affordance on the page — it turns "what does this thing want?" into one click.
- **`[fmt]`** = `JSON.stringify(parse(v), null, 2)`.
- **Headers**: read-only preview showing `Content-Type: application/json` and `Authorization: Bearer ••••••••`
  with a reveal-on-hold + copy. The real token is never typed by the user here.
- **Run**: primary accent button, `⌘↵` / `Ctrl+↵` bound page-wide, `T2AKbd` hint inside the button.
  While running it becomes **`■ Cancel`** (`danger` outline) — an `AbortController` is mandatory given a
  300s max timeout.

### Right — Response

Status strip (always visible, above the tabs): `T2AStatusDot` + HTTP code · total duration · tool-call
count · `mcp` chip if tools were live. `200` = accent, `4xx` = warn, `5xx` = danger.

Tabs (`T2ATabs`):

**Output** — `T2AJsonView`, collapsible, syntax-colored. Under it, schema verdict:
- `✓ matches output schema`
- `⚠ 2 issues` → expandable list: `missing required "currency"`, `"total": expected number, got string`.
- `— no output schema set` (neutral).
This is what makes the playground a *test* tool rather than a *demo* tool.

**Trace** — the differentiator. A vertical timeline, newest at the bottom, streaming in as the run
proceeds. Row = `T2AStatusDot` · mono label · duration pill · expander.

```
● 0ms      request accepted
● 12ms     mcp connect  https://tools.acme.dev/mcp        84ms
●          discovered 6 tools · 4 enabled
● 96ms     generation started        gemini-3.1-flash-lite  temp 0.35
● 410ms    ⚒ fetch_invoice          312ms
             ▸ args    { "url": "https://…" }
             ▸ result  { "pages": 3, … }                   2.1 KB
● 1.2s     ⚒ ocr_page               540ms
● 1.79s    generation complete       round 2/10
● 1.84s    200 · 412 B
```
Failures render inline in `danger` with the actual message — `McpServerUnreachableError` already carries
the URL, and the timeout error already carries the ms. Surface them verbatim; don't re-word.

**Raw** — the model's raw text **before** `JSON.parse`. Essential: the route silently falls back to
`{ result: output }` when parsing fails, so "why is my response wrapped in `result`?" is currently
unanswerable. Show the raw string in `T2ACode` and, when the fallback fired, a warn banner:
"Output was not valid JSON — returned as `{ result: … }`."

**cURL** — copy-paste-ready with the live token and the current body. `T2ACode` + copy.

---

## 3. States

| State | Treatment |
|---|---|
| Idle / never run | Response pane = `T2AEmptyState`, terminal glyph, "Run the agent to see its response", `⌘↵` hint |
| Running | Status strip shows `● running` + a live-ticking elapsed timer (mono, `tabular-nums`); Trace tab auto-selects and streams; Output tab shows skeleton lines; Run → Cancel |
| Success | Status strip resolves, Output auto-selects, toast suppressed (the pane *is* the feedback) |
| Model/API error (500) | Response pane shows the error message in a `danger` card + Trace still rendered up to the failure point. Never a bare "Agent execution failed" |
| MCP unreachable | `danger` card naming the URL + "Retry" + "Open tool settings" |
| Timeout | `warn` card: "Timed out after 60000ms" + "Raise timeout for this run" (bumps the override, doesn't persist) |
| Cancelled | `neutral` card, trace preserved |
| No Gemini key | Run disabled + inline prompt opening `GeminiKeyDialog` |
| Invalid JSON body | Run disabled, error under the editor, focus jumps to the offending line on click |

Announce run start/end via `aria-live="polite"` — a 60s operation must not be silent to a screen reader.

---

## 4. Motion

- Trace rows: fade + `translateY(6px)`, 160ms, on append only.
- Elapsed timer: text update only, no animation.
- Tab underline: `transform` slide 160ms.
- Response pane on first result (mobile): `scroll-margin-top` + smooth scroll, skipped under reduced motion.
- Run button: width reserved via `min-w-[120px]` so the label→loader swap doesn't reflow.

---

## 5. What this needs from the backend (design, not just UI)

The current `runAgent` lives inside `app/api/agents/[agentId]/route.ts` and returns only the final value.
The playground needs the middle of the run, so:

1. **Extract** `lib/run-agent.ts` → `runAgent(agent, body, { signal, onEvent? })`. The public route calls it
   with no listener; behavior there is unchanged.
2. **Instrument at the seams we control.** The Gemini SDK drives the tool loop
   (`automaticFunctionCalling`), so the observable boundaries are: `openMcpSession` (connect + `listTools`
   per server — already awaited there) and the `CallableTool.callTool` wrapper in `withDisabledFilter`
   (wrap it to time each call and emit `tool:start` / `tool:end`). Round count comes from
   `response.functionCalls` on the final response. **Be honest in the UI about that granularity** — label
   the model-side steps as "generation" rather than inventing per-token detail we can't see.
3. **New authenticated endpoint** `POST /api/agents/[agentId]/playground`, guarded by the **session**
   (`auth()` + `agent.userId === session.user.id`), *not* by the bearer token — the browser should never
   need the agent token to test, and the token stays copy-only. Accepts `{ body, overrides }`.
4. **Stream NDJSON** (`ReadableStream`, one JSON event per line, `Content-Type: application/x-ndjson`).
   Events: `accepted`, `mcp:connect`, `mcp:tools`, `gen:start`, `tool:start`, `tool:end`, `gen:end`,
   `result`, `error`. A Server Action can't stream progressively — use a route handler and read it with
   `fetch` + `TextDecoderStream` on the client.
5. **Abort**: pass `req.signal` through to `generateContent` and `session.close()` in the `finally`.
6. **Never** send `user.geminiApiKey` or MCP headers to the client; the trace shows header *keys* only.
7. Runs are **not persisted** — no schema change. History is `useState` in the page, lost on reload.
   (If run history is wanted later that's an `AgentRun` model, deliberately out of scope here.)

---

## 6. Playground-specific checklist

- [ ] `⌘↵` runs, `Esc` cancels a run, `⌘K` opens the agent switcher, `Tab` order = left → request → run → response
- [ ] Trace streams within 200ms of Run (first `accepted` event) — no dead air
- [ ] Cancel actually aborts the server work, not just the UI
- [ ] Token never rendered in plaintext except behind an explicit reveal, and never logged to the trace
- [ ] Raw tab always populated, including on the `{result: …}` fallback path
- [ ] Every pane scrolls independently; page itself never scrolls on `xl`
- [ ] Long tool results are truncated with a byte count + "expand" (a 2 MB result must not freeze the pane)
- [ ] Works at 375px as a stacked flow, with the Run button reachable without scrolling past the editor
