/**
 * Motive Stylelint config — enforces the design system's "semantic tokens only"
 * rule mechanically.
 *
 * Scope is deliberately narrow: it bans raw color literals (hex / rgb / rgba /
 * hsl / hsla) in `<style>` blocks and `.css` files, steering every color through
 * the `--mtv-color-*` / `--fleet-*` tokens (or `oklch(from var(--token) …)` for
 * alpha variants). It does NOT pull in stylelint-config-standard, so it won't
 * flood the codebase with unrelated stylistic findings — it enforces the one
 * thing that protects theming.
 *
 * Color authoring in oklch is allowed (the token files and a few hand-tuned /
 * color-picker surfaces use it); prefer `oklch(from var(--token) …)` in
 * components. Radius / z-index / motion tokens are conventions enforced in
 * review (see packages/ui/AUTHORING.md), not hard-linted, because delays,
 * keyframe percentages, and `0` values make a blanket ban brittle.
 *
 * Usage (app/package stylelint.config.mjs):
 *   import motive from '@motive/stylelint-config'
 *   export default motive
 */
const TOKEN_HINT =
  'use a design token — var(--mtv-color-*) / var(--fleet-*), or oklch(from var(--token) l c h / a) for alpha. See DESIGN_SYSTEM.md.'

export default {
  rules: {
    'color-no-hex': [true, { message: `Raw hex color is not allowed — ${TOKEN_HINT}` }],
    'function-disallowed-list': [
      ['rgb', 'rgba', 'hsl', 'hsla'],
      { message: `Raw rgb()/hsl() color is not allowed — ${TOKEN_HINT}` },
    ],
  },
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
  ],
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/storybook-static/**',
  ],
}
