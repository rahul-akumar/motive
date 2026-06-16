# @motive/web

The Motive fleet dashboard — a **mock-only Nuxt 4 / Vue 3 design prototype**. There is no
backend: all data comes from the region-indexed fixtures under `app/mocks/`, and the app runs
as a client-rendered SPA (`ssr: false`).

This package is part of the Bun + Turbo monorepo. It uses **Bun** exclusively — do not use
npm, pnpm, or yarn.

## Commands

Run from the repo root:

```bash
bun install        # install all workspace dependencies
bun run dev:web    # start this app on http://localhost:3000
```

Or from `apps/web/`:

```bash
bun run dev        # dev server on :3000 (bun run dev:host to expose on the network)
bun run build      # production build
bun run preview    # preview the production build locally
bun run typecheck  # nuxt typecheck (strict TS)
bun run lint       # eslint
bun run test       # vitest unit/composable tests
```

## Environment

Copy any required values into `apps/web/.env`:

| Variable                     | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `NUXT_PUBLIC_TOMTOM_API_KEY` | TomTom tiles for the live fleet map. Maps degrade without it. |

## Theming

Theming is driven by the design tokens in `@motive/tailwind-config` (`theme.css`) and the
`useTheme()` composable (`app/composables/useTheme.ts`):

- Themes (`arc`, `console`, `legacy`) are applied by setting `data-theme` on `<html>`; the Arc
  theme additionally supports a parametric hue/tint via the `--mtv-tint` / `--mtv-hue` vars.
- Fleet-specific semantic tokens live in `app/assets/css/main.css`.
- Components needing concrete colors (D3/Leaflet/MapLibre) resolve tokens through
  `useCssColors()` and react to theme changes via `useThemeObserver()`.

See the root `README` / design-system docs for the full token model.
