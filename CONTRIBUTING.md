# Contributing

Thanks for working on Motive. This repo is a Bun + Turborepo monorepo; the rules below are
**enforced by tooling**, so following them keeps commits and CI green.

## Prerequisites — Bun only

This repo uses **Bun** (`bun@1.3.7`, pinned via `packageManager`) exclusively. Do **not**
use npm, pnpm, or yarn — they will produce a foreign lockfile and break the workspace.

```bash
bun install        # install all workspace dependencies
bun run dev        # start all apps (web on :3000, storybook on :6006)
bun run dev:web    # web app only
bun run lint       # eslint across the graph
bun run typecheck  # type-check across the graph
bun run test       # vitest
bun run format     # prettier --write
```

Tasks are orchestrated by Turborepo (`turbo.json`) and run per-package.

## Branch naming

Include the Jira key when you create the branch:

```
DEVPRD-123-short-description
```

## Commit messages — Conventional Commits

Commits are validated by **commitlint** on the `commit-msg` git hook
(`commitlint.config.js`, extending `@commitlint/config-conventional`). The format is:

```
<type>(<scope>): <subject>
```

- **type** (required, lowercase) — one of:
  `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
  `revert`.
- **scope** (encouraged) — use the **uppercase Jira ID** for app changes
  (e.g. `DEVPRD-123`). The repo's `scope-enum` also recognizes the package scopes
  `web`, `ui`, `shared`, `tailwind-config`, `storybook`, `histoire`, `docs`, `deps`,
  `config` for repo-maintenance commits.
- **subject** — imperative mood, no trailing period, ≤ 100 chars.

Examples:

```
feat(DEVPRD-123): add fleet tracking dashboard
fix(ui): correct button hover state
refactor(web): extract useSearchPanelTransition composable
docs(docs): add ARCHITECTURE and CONTRIBUTING guides
```

**Never add AI/assistant co-authorship or attribution to commits.** Do not include
`Co-Authored-By:` trailers for any AI tool, "Generated with …" footers, or similar
attribution lines. Commits are attributed to the human author only.

## Pre-commit hooks

[Husky](https://typicode.github.io/husky/) installs two hooks (via `bun run prepare`):

- **`pre-commit`** → `bunx lint-staged` — runs `prettier --write` on staged
  `*.{ts,tsx,vue,js,mjs,cjs,json,md,css}` files (`.lintstagedrc.js`).
- **`commit-msg`** → `commitlint --edit` — rejects non-conforming commit messages.

If a hook blocks you, fix the reported issue rather than bypassing with `--no-verify`.

## Pull requests

- PR titles follow the same Conventional Commits format and include the Jira ID.
- New application behavior must ship with **unit-test coverage in the same PR**.
- Keep tests fast and isolated — no real network calls; use the fixtures under
  `apps/web/app/mocks/` and existing composable specs as the pattern.
- Run `bun run lint && bun run typecheck && bun run test` before pushing.

## Multi-region awareness

The app targets multiple regions (currently **US** and **EU**, plus MX/UK mock data). Avoid
hardcoding region- or deployment-specific values that should be configurable — prefer the
existing region plumbing (`useRegion`, region-indexed mock maps) and config-driven values.

## Where things go

See [ARCHITECTURE.md](./ARCHITECTURE.md) for package boundaries and
[packages/ui/AUTHORING.md](./packages/ui/AUTHORING.md) for component conventions.
