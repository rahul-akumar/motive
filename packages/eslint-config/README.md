# @motive/eslint-config

Shared ESLint flat configs for the monorepo. Built on `@eslint/js`,
`typescript-eslint`, and `eslint-plugin-vue`, with `eslint-config-prettier`
applied last so formatting is left entirely to Prettier.

## Exports

| Entry  | Use for                                   |
| ------ | ----------------------------------------- |
| `base` | Plain TypeScript packages (e.g. `shared`) |
| `vue`  | Vue 3 + TypeScript packages (e.g. `ui`)   |

## Usage

```js
// eslint.config.mjs
import vue from '@motive/eslint-config/vue'

export default [...vue]
```

`apps/web` extends these via Nuxt's generated config.
