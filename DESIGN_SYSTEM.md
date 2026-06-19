# Design System

Motive's visual language is a **three-layer token model** with a runtime theming layer on
top. Tokens are authored once and flow outward to every component; themes re-skin the whole
app by remapping one layer. This document is the written reference — the live, generated
swatches live in Storybook under **Foundations/Tokens**
(`apps/storybook/stories/Foundations.Tokens.mdx`).

## The three layers

```
Layer 1  Primitive palette      named hue ramps, fixed values         never themed
Layer 2  Semantic tokens        purpose roles (foreground, brand…)    remapped per theme
Layer 3  Fleet / domain tokens  app concepts (driver status, …)       built on layers 1–2
```

### Layer 1 — Primitives

Static, named color ramps (50 → 1000) plus the type/spacing/radius scales. These never
change between themes — they are the raw material.

- **Canonical source (hex):** `packages/tailwind-config/src/tokens/index.ts` — `mtvColors`
  (palettes: neutral, blue, purple, magenta, gold, green, red, tan, berry, coral, olive,
  teal, indigo, emerald, rose, yellow, orange) and `tokens` (spacing, fontSize, fontWeight,
  lineHeight, letterSpacing, borderRadius, fontFamily). This file is intentionally hex so it
  can be consumed in non-CSS contexts and by the Tailwind preset.
- **Runtime (oklch):** `packages/tailwind-config/src/theme.css` declares the same primitives
  as `--mtv-color-{palette}-{shade}` CSS variables in oklch, inside the `@theme` block, plus
  the static chart-series tokens and the font/size/radius scales.

Primitives are **not** referenced directly by components — only by Layer 2.

### Layer 2 — Semantic tokens

Purpose-named roles that map onto primitives. These are what components consume. They are
redefined per theme, so the same component re-skins automatically.

- **Source:** `packages/tailwind-config/src/themes/{arc,console,legacy}.css`, each scoped to
  `html[data-theme="…"]`.
- **Naming:** `--mtv-color-{category}-{role}`
  - **category** — `foreground`, `surface`, `border`, `brand`, `link`, `status`, `chart`
  - **role** — the variant within the category, e.g. `foreground-default` /
    `foreground-muted` / `foreground-on-accent`; `surface-base` / `surface-raised` /
    `surface-overlay`; `brand-default` / `brand-hover` / `brand-ring`; `status-critical` /
    `status-critical-subtle`.

### Layer 3 — Fleet / domain tokens

Application-domain colors that name _fleet concepts_ rather than UI roles, built on top of
layers 1–2.

- **Source:** `apps/web/app/assets/css/main.css`.
- **Naming:** `--fleet-{group}-{role}`, e.g. `--fleet-status-driving`, `--fleet-status-idle`,
  `--fleet-severity-critical`, `--fleet-event-violation`, `--fleet-delta-increase`.
- These resolve to primitive or semantic tokens (e.g.
  `--fleet-status-driving: var(--mtv-color-green-500)`), giving the app one place to retune
  domain semantics. Map markers, list accents, and gauges read these.

**Rule:** components reference Layer 2 (and Layer 3 in the web app), never Layer 1 directly.
That indirection is what makes a theme switch consistent.

## Theme switching — `data-theme`

Themes are selected by the `data-theme` attribute on `<html>`:

- `arc` — Precision black, neutral, parametric hue/tint (default).
- `console` — Flat dark, blue accent, edge-to-edge.
- `legacy` — Split chrome (black sidebar, white main), light background.

`useTheme().applyTheme(id)` (`apps/web/app/composables/useTheme.ts`) sets the attribute and
persists the choice to `localStorage` (`motive-theme`). Each `themes/*.css` file redefines
the Layer 2 semantic tokens under its `html[data-theme="…"]` selector, so flipping the
attribute swaps the entire semantic layer with no reload. `useTheme` also migrates
removed/renamed legacy theme ids to their current equivalents.

## Parametric Arc tint/hue

Arc is special: instead of shipping separate tinted themes, it is authored as a **single
parametric theme** driven by two CSS variables on the document root:

- `--mtv-tint` — `0` = pure neutral … `1` = full tint
- `--mtv-hue` — hue angle in degrees (0–360)

Every chromatic Arc token is written so that at `--mtv-tint: 0` it equals the original
achromatic value, and at `--mtv-tint: 1` it reaches the fully tinted value at `--mtv-hue`.
The interpolation is done in oklch with `calc()`. For example, in
`packages/tailwind-config/src/themes/arc.css`:

```css
/* near-white → vivid accent: lightness drops, chroma rises with tint */
--mtv-color-brand-default: oklch(
  calc(0.913 - 0.336 * var(--mtv-tint, 0)) /* L */ calc(0.215 * var(--mtv-tint, 0)) /* C */
    var(--mtv-hue, 0) /* H */
);

/* contrast flip: dark text on a near-white accent → white text on a vivid accent */
--mtv-color-foreground-on-accent: oklch(calc(0.216 + 0.784 * var(--mtv-tint, 0)) 0 0);

/* alpha tokens: lightness fades from white toward the hue, alpha preserved */
--mtv-color-border-default: oklch(
  calc(1 - 0.423 * var(--mtv-tint, 0)) calc(0.215 * var(--mtv-tint, 0)) var(--mtv-hue, 0) / 0.1
);
```

**Reference implementation:** `apps/web/app/composables/useTheme.ts`.

- `setHue(deg)` sets `--mtv-hue` and enables tint (`--mtv-tint: 1`); `setNeutral()` disables
  it. Both persist to `localStorage` (`motive-arc-hue`, `motive-arc-tint`).
- `HUE_PRESETS` (in `tokens/index.ts`) provides quick-pick hues — red `27`, amber `58`,
  slate `248`, violet `286` — which are the accent hues of the former standalone tinted
  themes that Arc absorbed.

## Consuming tokens

- **Vue components / scoped CSS:** `@reference "@motive/tailwind-config/theme.css"`, then use
  Tailwind utilities (`@apply`) for layout and `var(--mtv-color-*)` for themeable color.
  Semantic tokens only — see [packages/ui/AUTHORING.md](./packages/ui/AUTHORING.md).
- **Canvas / WebGL (Leaflet, MapLibre, D3):** these can't read CSS variables, so resolve
  concrete values via `useCssColors()` and re-resolve on theme change via
  `useThemeObserver()` / `isDarkTheme()` (`useTheme.ts`).

## Where tokens live — quick map

| Concern                                            | File                                                           |
| -------------------------------------------------- | -------------------------------------------------------------- |
| Primitive palette + scales (hex, canonical)        | `packages/tailwind-config/src/tokens/index.ts`                 |
| Primitives as CSS vars (oklch) + Tailwind `@theme` | `packages/tailwind-config/src/theme.css`                       |
| Semantic tokens per theme                          | `packages/tailwind-config/src/themes/{arc,console,legacy}.css` |
| Fleet/domain tokens                                | `apps/web/app/assets/css/main.css`                             |
| Theme/tint runtime + persistence                   | `apps/web/app/composables/useTheme.ts`                         |
| Live token gallery                                 | `apps/storybook/stories/Foundations.Tokens.mdx`                |

> The Storybook **Foundations/Tokens** page renders every primitive and semantic token
> programmatically from the exported `mtvColors` / `tokens` objects, so it stays in sync with
> the source automatically. Treat it as the visual companion to this document; a separate
> generated table is unnecessary.
