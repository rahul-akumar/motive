# Architecture

Motive is a **Turborepo monorepo** managed with **Bun**. It hosts a mock-only Nuxt 4 fleet
dashboard, a Storybook component gallery, and the shared packages that back both. There is
no backend — the web app is a client-rendered design prototype fed by region-indexed
fixtures.

## Topology

```
apps/
  web/              → Fleet dashboard. Nuxt 4 / Vue 3 SPA (ssr: false), port 3000.
                      All data comes from app/mocks/; no network backend.
  storybook/        → Storybook gallery for @motive/ui, port 6006.
packages/
  ui/               → @motive/ui — the Vue 3 + Tailwind design-system components (M-prefixed).
  shared/           → @motive/shared — framework-agnostic TS types & utilities (FleetVehicle, …).
  tailwind-config/  → @motive/tailwind-config — the Tailwind v4 preset + design tokens + theme.css.
  eslint-config/    → @motive/eslint-config — shared flat ESLint config.
  tsconfig/         → shared TypeScript base configs.
```

Turborepo (`turbo.json`) orchestrates `build`, `lint`, `test`, and `typecheck` across the
graph; Bun workspaces wire the `@motive/*` packages together.

## Package boundaries

The dependency direction is strictly one-way — lower layers never import upward:

```
tailwind-config ──┐
shared ───────────┼──▶ ui ──▶ web
                  └──────────▶ web
                              storybook ──▶ ui
```

- **`@motive/shared`** is the bottom layer: pure types and helpers, no Vue, no DOM. Both
  `ui` and `web` depend on it. Domain types like `FleetVehicle`, `FleetDriver`,
  `JammingEvent` live here.
- **`@motive/tailwind-config`** owns the visual language: the design tokens
  (`src/tokens/index.ts`), the Tailwind preset, and the runtime CSS (`src/theme.css` plus
  the per-theme files under `src/themes/`). Consumed by `ui`, `web`, and `storybook`.
- **`@motive/ui`** is the presentational component library. It depends on `shared` and
  `tailwind-config` only — it knows nothing about the web app, its routes, mocks, or
  composables. Components are pure: props in, events out.
- **`apps/web`** is the only place that composes UI, mock data, routing, and app state
  (Nuxt composables under `app/composables/`). It depends on everything below it.
- **`apps/storybook`** depends on `ui` (and the tokens) to render the gallery; it must not
  depend on `web`.

When adding code, respect the arrow: if `ui` seems to need something from `web`, the type
or helper belongs in `shared` instead, and app-specific behavior stays in `web`.

## Token flow

Design decisions flow from a single source of truth out to every rendered pixel:

```
tokens/index.ts            Layer 1 — primitive palettes & scales (canonical hex/values)
        │                  (also consumed by the Tailwind preset for utility generation)
        ▼
tailwind-config/theme.css  @theme block: primitives as --mtv-color-* CSS vars (oklch),
        │                  font/size/radius scales, static chart series.
        ▼
themes/{arc,console,legacy}.css   Layer 2 — semantic tokens per theme, selected by
        │                  html[data-theme="…"]. Arc adds the parametric --mtv-tint/--mtv-hue math.
        ▼
apps/web/app/assets/css/main.css  Layer 3 — fleet-domain tokens (--fleet-status-*,
        │                  --fleet-severity-*, …) mapped onto the semantic/primitive layers.
        ▼
@motive/ui components & web views   consume --mtv-color-* / --fleet-* via @apply and var().
```

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the full three-layer token model and the
parametric Arc tint/hue math.

## Theming pipeline

Themes are applied at runtime by `useTheme()` (`apps/web/app/composables/useTheme.ts`),
which is the reference implementation:

1. `useTheme().applyTheme(id)` sets `data-theme` on `<html>` (`arc` | `console` | `legacy`)
   and persists it to `localStorage`.
2. For **Arc**, `setHue(deg)` / `setNeutral()` write `--mtv-hue` and `--mtv-tint` on the
   document root. Every chromatic Arc token is authored so `--mtv-tint:0` is pure neutral
   and `--mtv-tint:1` is fully tinted at the chosen hue — no theme reload needed.
3. Components consume the resolved `--mtv-color-*` variables through Tailwind utilities and
   scoped CSS; they never hardcode hex.
4. Canvas/WebGL layers (Leaflet, MapLibre, D3) cannot read CSS variables directly, so they
   resolve concrete colors via `useCssColors()` and re-resolve on theme change via
   `useThemeObserver()` / `isDarkTheme()`.

## Conventions

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit/PR rules and the Bun-only workflow, and
[packages/ui/AUTHORING.md](./packages/ui/AUTHORING.md) for component-authoring conventions.
