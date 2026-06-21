# @motive/stylelint-config

Shared Stylelint config for the monorepo. Deliberately narrow: rather than
pulling in `stylelint-config-standard` (and its noise), it enforces a single
rule that matters for the design system — **no raw colors**.

Raw `hex` / `rgb()` / `hsl()` / `hsla()` values are banned in `.css` and `.vue`
files. Use design tokens instead (`--mtv-color-*`, `--fleet-*`) or the
`oklch(from var(--token) …)` form. `.vue` SFCs are parsed via `postcss-html`.

## Usage

```js
// stylelint.config.mjs
export { default } from '@motive/stylelint-config'
```

Runs in pre-commit via lint-staged and through `bun run lint:css`.
