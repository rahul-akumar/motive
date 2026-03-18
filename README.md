# Motive

Freight/fleet management platform built as a Turborepo monorepo.

## Structure

```
apps/
  web/              → Main freight dashboard (Nuxt 4, port 3000)
  storybook/        → Storybook component previews (port 6006)
packages/
  ui/               → Design system (Vue 3 + Tailwind CSS)
  shared/           → Shared utilities and TypeScript types
  tailwind-config/  → Shared Tailwind preset with design tokens
  eslint-config/    → Shared ESLint configuration
  tsconfig/         → Shared TypeScript configs
```

## Getting Started

```bash
# Install dependencies
bun install

# Start all apps in development
bun run dev

# Build all apps
bun run build

# Run tests
bun run test

# Lint
bun run lint

# Format
bun run format
```

## Tech Stack

- **Runtime:** Bun
- **Monorepo:** Turborepo
- **Framework:** Nuxt 4 (Vue 3)
- **Styling:** Tailwind CSS
- **Testing:** Vitest + Playwright
- **Component Previews:** Storybook + Histoire
- **DX:** ESLint, Prettier, Husky, lint-staged, commitlint

## Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env` and fill in the values:

```bash
cp apps/web/.env.example apps/web/.env
```

| Variable                     | Description                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_TOMTOM_API_KEY` | TomTom API key for map rendering ([get one here](https://developer.tomtom.com)) |

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

```
feat(web): add fleet tracking dashboard
fix(ui): correct button hover state
docs(shared): update type documentation
```
