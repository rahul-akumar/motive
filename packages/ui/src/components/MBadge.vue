<script setup lang="ts">
import { computed, type Component } from 'vue'

export type MBadgeVariant = 'text' | 'number' | 'score'
export type MBadgeColor = 'default' | 'success' | 'warning' | 'danger' | 'error' | 'info' | 'accent'
export type MBadgeSize = 'sm' | 'md' | 'lg'
export type MBadgeScoreKind = 'safety' | 'speed' | 'health' | 'risk' | 'performance'

export interface MBadgeProps {
  variant?: MBadgeVariant
  color?: MBadgeColor
  size?: MBadgeSize
  label?: string
  icon?: Component
  iconPosition?: 'left' | 'right'
  count?: number
  max?: number
  score?: number
  kind?: MBadgeScoreKind
}

const props = withDefaults(defineProps<MBadgeProps>(), {
  variant: 'text',
  color: 'default',
  size: 'md',
  iconPosition: 'left',
  max: 99,
  score: 0,
  kind: 'safety',
})

const SCORE_PATHS: Record<MBadgeScoreKind, string> = {
  safety: 'M24 4 L40 10 L40 26 C40 35 32 42 24 46 C16 42 8 35 8 26 L8 10 Z',
  speed: 'M28 4 L14 26 L22 26 L20 44 L34 22 L26 22 Z',
  health:
    'M24 42 C24 42 6 30 6 18 C6 12 10 8 15 8 C18.5 8 21.5 10 24 13 C26.5 10 29.5 8 33 8 C38 8 42 12 42 18 C42 30 24 42 24 42 Z',
  risk: 'M24 6 L44 40 H4 Z',
  performance: 'M24 2 A22 22 0 1 0 24.001 2 Z M24 14 A10 10 0 1 1 23.999 14 Z',
}

const SCORE_PATH_ATTRS: Record<MBadgeScoreKind, Record<string, string>> = {
  safety: {},
  speed: {},
  health: {},
  risk: {},
  performance: { 'fill-rule': 'evenodd', 'clip-rule': 'evenodd' },
}

const KIND_LABELS: Record<MBadgeScoreKind, string> = {
  safety: 'Safety',
  speed: 'Speed',
  health: 'Health',
  risk: 'Risk',
  performance: 'Performance',
}

const displayCount = computed(() =>
  props.count !== undefined && props.count > props.max ? `${props.max}+` : String(props.count ?? 0),
)

const resolvedScoreColor = computed((): MBadgeColor => {
  if (props.color !== 'default') return props.color
  if (props.score <= 40) return 'danger'
  if (props.score <= 70) return 'warning'
  return 'success'
})

const rootClasses = computed(() => {
  const base = ['m-badge']
  if (props.variant === 'text') {
    base.push('m-badge--text', `m-badge--${props.size}`, `m-badge--${props.color}`)
  } else if (props.variant === 'number') {
    base.push('m-badge--number', `m-badge--${props.size}`, `m-badge--${props.color}`)
  } else {
    base.push(
      'm-badge--score',
      `m-badge--score--${props.size}`,
      `m-badge--${resolvedScoreColor.value}`,
    )
  }
  return base
})

const rootRole = computed(() => (props.variant === 'score' ? 'img' : 'status'))

const rootAriaLabel = computed(() => {
  if (props.variant === 'number') return `${displayCount.value} notifications`
  if (props.variant === 'score') return `${KIND_LABELS[props.kind]} score: ${props.score}`
  return undefined
})
</script>

<template>
  <span :class="rootClasses" :role="rootRole" :aria-label="rootAriaLabel">
    <!-- text -->
    <template v-if="variant === 'text'">
      <component
        :is="icon"
        v-if="icon && iconPosition !== 'right'"
        class="m-badge__icon"
        aria-hidden="true"
      />
      <slot>{{ label }}</slot>
      <component
        :is="icon"
        v-if="icon && iconPosition === 'right'"
        class="m-badge__icon"
        aria-hidden="true"
      />
    </template>

    <!-- number -->
    <template v-else-if="variant === 'number'">{{ displayCount }}</template>

    <!-- score -->
    <template v-else>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48" fill="currentColor">
        <path :d="SCORE_PATHS[kind]" v-bind="SCORE_PATH_ATTRS[kind]" />
      </svg>
      <span class="m-badge__score-value">{{ score }}</span>
    </template>
  </span>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

/* ── Base ────────────────────────────────────────────────── */
.m-badge {
  @apply inline-flex items-center justify-center font-medium leading-none select-none;
  background-color: var(--_badge-bg);
  color: var(--_badge-text);
  border: 1px solid var(--_badge-border);
}

/* ── Colors ──────────────────────────────────────────────── */
.m-badge--default {
  --_badge-bg: var(--bg-elevated);
  --_badge-text: var(--text-secondary);
  --_badge-border: var(--border);
}

.m-badge--success {
  --_badge-bg: color-mix(in srgb, theme(colors.motive.success.500) 12%, transparent);
  --_badge-text: theme(colors.motive.success.700);
  --_badge-border: color-mix(in srgb, theme(colors.motive.success.500) 35%, transparent);
}

.m-badge--warning {
  --_badge-bg: color-mix(in srgb, theme(colors.motive.warning.900) 20%, transparent);
  --_badge-text: theme(colors.motive.warning.700);
  --_badge-border: color-mix(in srgb, theme(colors.motive.warning.500) 4%, transparent);
}

.m-badge--danger {
  --_badge-bg: color-mix(in srgb, theme(colors.motive.danger.500) 12%, transparent);
  --_badge-text: theme(colors.motive.danger.700);
  --_badge-border: color-mix(in srgb, theme(colors.motive.danger.500) 35%, transparent);
}

.m-badge--error {
  --_badge-bg: color-mix(in srgb, theme(colors.fuchsia.500) 12%, transparent);
  --_badge-text: theme(colors.fuchsia.700);
  --_badge-border: color-mix(in srgb, theme(colors.rose.500) 40%, transparent);
}

.m-badge--info {
  --_badge-bg: color-mix(in srgb, theme(colors.motive.info.900) 30%, transparent);
  --_badge-text: theme(colors.motive.info.600);
  --_badge-border: color-mix(in srgb, theme(colors.motive.info.500) 4%, transparent);
}

.m-badge--accent {
  --_badge-bg: var(--accent-dim);
  --_badge-text: var(--accent);
  --_badge-border: var(--accent-border);
}

/* ── Text variant ─────────────────────────────────────────── */
.m-badge--text {
  @apply gap-1;
  border-radius: 4px;
  font-weight: 400;
}

.m-badge--text.m-badge--sm {
  height: 18px;
  @apply px-2 text-[12px];
}

.m-badge--text.m-badge--md,
.m-badge--text.m-badge--lg {
  height: 22px;
  @apply px-2.5 text-xs;
}

/* ── Number variant ──────────────────────────────────────── */
.m-badge--number {
  border-radius: 9999px;
}

.m-badge--number.m-badge--sm {
  width: 18px;
  height: 18px;
  @apply text-[10px];
}

.m-badge--number.m-badge--md,
.m-badge--number.m-badge--lg {
  width: 22px;
  height: 22px;
  @apply text-[11px];
}

/* ── Score variant ───────────────────────────────────────── */
.m-badge--score {
  background-color: transparent;
  border: none;
  position: relative;
}

.m-badge--score svg {
  width: 100%;
  height: 100%;
  display: block;
}

.m-badge__score-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  @apply font-bold;
  line-height: 1;
  pointer-events: none;
  color: #fff;
}

.m-badge--score.m-badge--score--sm {
  width: 32px;
  height: 32px;
  @apply text-[11px];
}

.m-badge--score.m-badge--score--md {
  width: 44px;
  height: 44px;
  @apply text-sm;
}

.m-badge--score.m-badge--score--lg {
  width: 56px;
  height: 56px;
  @apply text-base;
}

/* ── Icon in text variant ────────────────────────────────── */
.m-badge__icon {
  flex-shrink: 0;
}

.m-badge--sm .m-badge__icon {
  width: 10px;
  height: 10px;
}

.m-badge--md .m-badge__icon,
.m-badge--lg .m-badge__icon {
  width: 12px;
  height: 12px;
}
</style>
