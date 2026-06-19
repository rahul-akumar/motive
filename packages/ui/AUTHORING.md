# Authoring `@motive/ui` components

`@motive/ui` is the presentational design-system library: pure Vue 3 + Tailwind components,
no app state, no data fetching, no routing. Props in, events out. The conventions below are
followed by every existing component — `src/components/MButton.vue` is the canonical
reference; copy its shape when adding a new one.

## 1. Naming — `M` prefix + BEM

- Component files and exported names are **`M`-prefixed PascalCase**: `MButton`, `MBadge`,
  `MTableCell`. One component per file under `src/components/`.
- Scoped CSS classes use **BEM** keyed on the lowercased component name:
  - Block: `.m-button`
  - Modifier: `.m-button--primary`, `.m-button--md`, `.m-button--loading`
  - Element: `.m-button__spinner`
- The template's root element carries the block class plus an array of modifier classes
  bound from props.

## 2. Props — `export interface MFooProps` + `withDefaults`

Declare a named, exported props interface and pass it through `withDefaults`:

```ts
export interface MButtonProps {
  /** Visual style of the button. @default 'primary' */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
  /** Height/padding scale. @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<MButtonProps>(), {
  variant: 'primary',
  size: 'md',
})
```

- The interface is **exported** so it can be re-exported from `src/index.ts` and consumed by
  the web app and Storybook `argTypes`.
- Prefer string-literal unions over loose `string` for variants/sizes.

## 3. Prop & emit JSDoc

Every prop gets a one-line JSDoc description, with `@default` where the prop is optional.
Emits are documented the same way. This feeds editor IntelliSense and Storybook autodocs —
keep it accurate.

```ts
defineEmits<{
  /** Fired on click; suppressed while disabled or loading. */
  click: [event: MouseEvent]
}>()
```

## 4. Styling — scoped CSS with `@reference`, semantic tokens only

- Use `<style scoped>` and start it with the Tailwind reference so `@apply` resolves the
  preset:

  ```css
  @reference "@motive/tailwind-config/theme.css";
  ```

- **Semantic tokens only.** Reference `var(--mtv-color-*)` semantic tokens
  (`--mtv-color-brand-default`, `--mtv-color-foreground-on-accent`,
  `--mtv-color-surface-raised`, …) — never a raw primitive (`--mtv-color-blue-500`) and
  never a hardcoded hex/rgb/oklch literal. This is what makes components theme-aware across
  Arc/Console/Legacy and the Arc tint slider. See
  [../../DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md). For an alpha variant of a token, use
  `oklch(from var(--mtv-color-…) l c h / 0.12)` rather than a literal.
- **No raw values for the other scales either.** Shadows → `var(--mtv-shadow-*)`; transitions
  /animations → `var(--mtv-duration-*)` + `var(--mtv-ease-*)`; stacking → `var(--mtv-z-*)`;
  corners → `var(--radius-*)` / `var(--card-radius)`. These keep timing, elevation, and layering
  consistent across the app.
- Use `@apply` for layout/spacing/typography utilities; use `var()` for themeable colors.
- **Enforcement:** `bun run lint:css` (stylelint, also on the pre-commit hook) fails on raw
  hex/rgb/hsl color literals. Run it before pushing.

## 5. Export from the barrel

Add both the component and its type(s) to `src/index.ts`:

```ts
export { default as MFoo } from './components/MFoo.vue'
export type { MFooProps } from './components/MFoo.vue'
```

## 6. Every new component ships a story + autodocs

Add a story to `apps/storybook/stories/MFoo.stories.ts`:

- `title: 'Components/MFoo'`, `component: MFoo`, and **`tags: ['autodocs']`** so the props
  table is generated from the JSDoc'd interface.
- Define `argTypes` for the variant/size unions (`control: 'select'`).
- Cover the meaningful states (variants, sizes, disabled/loading, icon-only, …). Existing
  stories use `@storybook/test` play functions for interaction coverage — follow that
  pattern for interactive components.

## Checklist for a new component

- [ ] `M`-prefixed file in `src/components/`, BEM scoped classes
- [ ] Exported `MFooProps` interface + `withDefaults`
- [ ] JSDoc on every prop (with `@default`) and emit
- [ ] `<style scoped>` with `@reference`, semantic `--mtv-color-*` tokens only — and
      `--mtv-shadow-*` / `--mtv-duration-*` / `--mtv-ease-*` / `--mtv-z-*` / `--radius-*` for
      elevation, motion, stacking, and corners (no raw values)
- [ ] Component + types exported from `src/index.ts`
- [ ] `MFoo.stories.ts` with `tags: ['autodocs']` covering the key states
- [ ] `bun run lint && bun run typecheck && bun run lint:css` clean
