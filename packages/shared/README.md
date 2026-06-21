# @motive/shared

Framework-agnostic shared types and utilities consumed across the monorepo
(notably fleet/driver domain types such as `FleetDriver` and
`FleetDriverStatus`).

## Usage

```ts
import type { FleetDriver, FleetDriverStatus } from '@motive/shared'
```

## Scripts

| Command             | Description        |
| ------------------- | ------------------ |
| `bun run lint`      | ESLint (TS config) |
| `bun run typecheck` | `tsc --noEmit`     |

All public exports flow through [`src/index.ts`](./src/index.ts).
