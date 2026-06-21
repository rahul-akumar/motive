# @motive/tailwind-config

Shared Tailwind CSS v4 configuration and design tokens for the monorepo. This
is the source of truth for the `--mtv-color-*` / `--fleet-*` design tokens
referenced throughout the UI and enforced by `@motive/stylelint-config`.

## Usage

```ts
import config from '@motive/tailwind-config'
```

The generated theme is also available as CSS:

```css
@import '@motive/tailwind-config/theme.css';
```

Tokens are derived in `src/` (using `culori` for color math). See
`DESIGN_SYSTEM.md` at the repo root for how tokens flow into components.
