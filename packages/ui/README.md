# @motive/ui

Shared Vue 3 component library for the Motive monorepo. All components are
`M`-prefixed (e.g. `MButton`, `MCard`, `MTable`) and authored with
`<script setup lang="ts">`.

## Usage

```ts
import { MButton } from '@motive/ui'
import type { MButtonProps } from '@motive/ui'
```

Styles are exported separately:

```ts
import '@motive/ui/styles'
```

## Scripts

| Command             | Description                 |
| ------------------- | --------------------------- |
| `bun run lint`      | ESLint (Vue + TS config)    |
| `bun run test`      | Vitest unit/component tests |
| `bun run typecheck` | `vue-tsc --noEmit`          |

## Authoring components

See [`AUTHORING.md`](./AUTHORING.md) for the component conventions
(naming, props/emits patterns, BEM, design-token usage). Components are
showcased in Storybook — see `apps/storybook`.

Every component is exported as a named default plus its prop/variant types
from [`src/index.ts`](./src/index.ts).
