# @motive/tsconfig

Shared TypeScript base configs for the monorepo. All configs are `strict` with
`noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`
enabled.

## Configs

| File        | Extends     | Use for                               |
| ----------- | ----------- | ------------------------------------- |
| `base.json` | —           | Plain TypeScript packages             |
| `vue.json`  | `base.json` | Vue packages (adds JSX, `vue` source) |
| `nuxt.json` | `vue.json`  | Nuxt apps (`verbatimModuleSyntax`)    |

## Usage

```jsonc
// tsconfig.json
{
  "extends": "@motive/tsconfig/vue.json",
}
```
