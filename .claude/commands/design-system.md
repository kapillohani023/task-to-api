# Design System Reference

Use this skill when building UI components, styling pages, or making design decisions. It defines the visual language to follow across all projects.

---

## Color System

### Philosophy
High-contrast, bold aesthetic. Black and white as primary pair with a limited grayscale palette. Minimal color — let content and structure do the talking.

### Core Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Background | `#ffffff` | `oklch(0.145 0 0)` | Page background |
| Foreground | `#171717` | `oklch(0.985 0 0)` | Primary text |
| Primary | `#030213` | `oklch(0.985 0 0)` | Buttons, key actions |
| Primary Foreground | `#ffffff` | `oklch(0.205 0 0)` | Text on primary |
| Secondary | `oklch(0.95 0.0058 264.53)` | — | Secondary surfaces |
| Muted | `#ececf0` | `oklch(0.269 0 0)` | Disabled, subtle bg |
| Muted Foreground | `#717182` | `oklch(0.708 0 0)` | Secondary text |
| Accent | `#e9ebef` | `oklch(0.269 0 0)` | Hover states, highlights |
| Destructive | `#d4183d` | `oklch(0.396 0.141 25.723)` | Errors, delete actions |

### Chart / Data Visualization Colors
- Chart 1: `oklch(0.646 0.222 41.116)` — orange
- Chart 2: `oklch(0.6 0.118 184.704)` — teal
- Chart 3: `oklch(0.398 0.07 227.392)` — blue
- Chart 4: `oklch(0.828 0.189 84.429)` — yellow
- Chart 5: `oklch(0.769 0.188 70.08)` — gold

### Grayscale Usage (Tailwind)
- `zinc-100` / `zinc-200` — subtle backgrounds, borders
- `zinc-500` / `zinc-600` — captions, muted text
- `zinc-700` — labels
- `zinc-800` — hover states on dark buttons
- `gray-50` through `gray-900` — used sparingly for secondary surfaces

### Rules
- Prefer CSS custom properties (`--background`, `--foreground`, etc.) over hardcoded values
- Use OKLCH color space for dark mode tokens — perceptually uniform
- Never use color alone to convey meaning — pair with icons or text
- Destructive red is reserved for errors and delete actions only

---

## Typography

### Font Stack
- **Primary**: Geist Sans (`var(--font-geist-sans)`)
- **Monospace**: Geist Mono (`var(--font-geist-mono)`)
- **Fallback**: Helvetica, Arial, sans-serif

### Scale

| Variant | Size | Weight | Tailwind Classes |
|---------|------|--------|------------------|
| h1 | 2.25rem (36px) | 700 bold | `text-4xl font-bold tracking-tight` |
| h2 | 1.875rem (30px) | 600 semibold | `text-3xl font-semibold tracking-tight` |
| h3 | 1.5rem (24px) | 600 semibold | `text-2xl font-semibold` |
| h4 | 1.25rem (20px) | 600 semibold | `text-xl font-semibold` |
| body | 1rem (16px) | 400 normal | `text-base text-black` |
| label | 0.875rem (14px) | 500 medium | `text-sm font-medium text-zinc-700` |
| muted | 0.875rem (14px) | 400 normal | `text-sm text-zinc-600` |
| caption | 0.75rem (12px) | 400 normal | `text-xs text-zinc-500` |

### Rules
- Line height: `1.5` everywhere
- Use `tracking-tight` only on h1 and h2
- Body text is always `text-black` (light) or foreground color (dark)
- Captions and muted text use zinc shades, never pure black

---

## Spacing & Layout

### Spacing Scale (Tailwind units, 1 unit = 4px)
- **Gaps**: 2 (8px), 3 (12px), 4 (16px), 6 (24px)
- **Padding**: 2, 3, 4, 6, 8, 10
- **Margins**: bottom — 4, 6; top — 8
- **Stack spacing**: `space-y-4`, `space-y-6`, `space-y-8`

### Layout Patterns
- Full viewport height: `h-screen`
- Flex column layouts: `flex flex-col flex-1`
- Grid: `grid-cols-1` on mobile, `md:grid-cols-3` on tablet+
- Container max-width: `max-w-md` (28rem) for forms/dialogs, `max-w-full` for dashboards
- Mobile-first responsive design with `md:` breakpoints

---

## Border Radius

| Token | Value |
|-------|-------|
| `--radius` | 0.625rem (10px) |
| `--radius-sm` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 10px |
| `--radius-xl` | 14px |

### Usage
- Buttons: `rounded` (default 4px)
- Cards: `rounded-lg`
- Avatars / badges: `rounded-full`
- Dialogs: `rounded-lg`

---

## Borders & Shadows

### Border Style
- **Primary border**: `border-2 border-black` — bold, structural borders on cards and buttons
- **Subtle border**: `border border-zinc-200` — secondary cards, dividers
- **Divider**: `border-b-2 border-black` — section separators in dialogs

### Shadows
- `shadow-lg` — elevated cards only
- Shadows are rare — the design relies on borders, not shadows, for depth

---

## Component Patterns

### Naming Convention
All custom components use the `Ss` prefix (e.g., `SsButton`, `SsCard`, `SsInput`, `SsDialog`).

### Button Variants

| Variant | Style |
|---------|-------|
| primary | `border-black bg-black text-white hover:bg-zinc-800` |
| secondary | `border-black bg-white text-black hover:bg-zinc-100` |
| ghost | `border-transparent bg-transparent hover:bg-zinc-100` |
| danger | `border-black bg-black text-white hover:bg-red-900` |
| outline | `border-black bg-transparent text-black hover:bg-zinc-100` |
| icon | `border-transparent bg-transparent hover:bg-zinc-100` |

Button sizes: `sm` (px-3 py-1.5 text-sm), `md` (px-4 py-2 text-base), `lg` (px-5 py-3 text-base), `icon` (h-10 w-10)

### Card Variants

| Variant | Style |
|---------|-------|
| default | `border-2 border-black bg-white` |
| subtle | `border border-zinc-200 bg-white` |
| elevated | `border-2 border-black bg-white shadow-lg` |

Card padding: `none`, `sm` (p-3), `md` (p-4), `lg` (p-6)

### Input Style
- Base: `rounded border-2 border-black bg-white px-4`
- Focus: `focus:ring-2 focus:ring-black`
- Error text: `text-red-600`
- Hint text: `text-zinc-500`
- Sizes: sm (py-1.5 text-sm), md (py-2 text-base), lg (py-3 text-base)

### Dialog Style
- Backdrop: `bg-black/80`
- Content: centered with `max-w-md`, uses default card style
- Header divider: `border-b-2 border-black`

---

## Animations & Transitions

### Transitions
- All interactive elements: `transition-colors` (default duration)
- Chat elements: `transition-opacity`
- Keep transitions simple — no elaborate entrances or exits

### Loading Animation
- Vertical bar animation with staggered delays (0s, 0.25s, 0.5s)
- `scaleY(1.5)` pulse effect
- Black bars on white background

---

## Icons

### Library
- **Primary**: `lucide-react` — clean, consistent line icons
- **Branded**: `react-icons` — for third-party logos (e.g., FcGoogle)

### Sizes
- Navigation: 24px
- Inline / buttons: 20px
- Small indicators: 16px
- Large hero: 32px

---

## Dark Mode

### Implementation
- CSS custom properties with `.dark` class toggle
- `@media (prefers-color-scheme: dark)` as fallback
- OKLCH color space for perceptually uniform dark tokens
- Variable naming: `--color-*`, `--sidebar-*`, `--chart-*`

### Rules
- Every color must have both light and dark variants
- Test contrast ratios in both modes
- Dark background: near-black (`oklch(0.145 0 0)`), not pure `#000`
- Dark foreground: off-white (`oklch(0.985 0 0)`), not pure `#fff`

---

## Design Principles

1. **High contrast** — Bold 2px black borders define structure. No soft, ambient UI.
2. **Minimal color** — Black, white, and grayscale dominate. Color is reserved for data visualization and destructive actions.
3. **Content-first** — Typography and spacing create hierarchy, not decoration.
4. **Mobile-first** — Design for small screens, then enhance at `md:` breakpoint.
5. **Accessible** — Visible focus rings (`ring-2 ring-black`), sufficient contrast ratios, never color-only indicators.
6. **Consistent** — Use the component library (`Ss*` components). Don't reinvent buttons or cards.
