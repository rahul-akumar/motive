<script setup lang="ts">
import { computed } from 'vue'

export interface MSkeletonProps {
  /** Shape of the placeholder. @default 'line' */
  variant?: 'line' | 'block' | 'circle'
  /** Explicit width (any CSS length). Defaults to 100% for line/block, size for circle. */
  width?: string
  /** Explicit height (any CSS length). Defaults per variant. */
  height?: string
  /** Number of stacked bars to render for the `line` variant. @default 1 */
  lines?: number
  /** Border radius override (any CSS length). */
  radius?: string
}

const props = withDefaults(defineProps<MSkeletonProps>(), {
  variant: 'line',
  width: undefined,
  height: undefined,
  lines: 1,
  radius: undefined,
})

/** Resolve per-variant default geometry, overridable via props. */
function barStyle(index: number, total: number): Record<string, string> {
  const style: Record<string, string> = {}
  if (props.variant === 'circle') {
    const size = props.width ?? props.height ?? '2.5rem'
    style.width = props.width ?? size
    style.height = props.height ?? size
    style.borderRadius = props.radius ?? '50%'
    return style
  }
  // line + block
  style.width =
    // Last line in a multi-line block reads more naturally when shorter.
    props.variant === 'line' && total > 1 && index === total - 1 ? '70%' : (props.width ?? '100%')
  style.height = props.height ?? (props.variant === 'block' ? '8rem' : '0.85rem')
  if (props.radius) style.borderRadius = props.radius
  return style
}

const count = computed(() => (props.variant === 'line' ? Math.max(1, props.lines) : 1))
</script>

<template>
  <div
    class="m-skeleton"
    :class="{ 'm-skeleton--stack': count > 1 }"
    role="status"
    aria-busy="true"
    aria-live="polite"
    aria-label="Loading"
  >
    <span
      v-for="i in count"
      :key="i"
      class="m-skeleton__bar"
      :class="`m-skeleton__bar--${variant}`"
      :style="barStyle(i - 1, count)"
    />
  </div>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.m-skeleton {
  display: block;
  width: 100%;
}

.m-skeleton--stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.m-skeleton__bar {
  display: block;
  border-radius: var(--radius-sm);
  background-color: var(--mtv-color-surface-accent);
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in oklch, var(--mtv-color-foreground-subtle) 12%, transparent) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: m-skeleton-shimmer 1.4s var(--mtv-ease-linear, linear) infinite;
}

.m-skeleton__bar--block {
  border-radius: var(--radius);
}

@keyframes m-skeleton-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

/* Reduced motion: drop the sweep, fall back to a gentle opacity pulse. */
@media (prefers-reduced-motion: reduce) {
  .m-skeleton__bar {
    background-image: none;
    animation: m-skeleton-pulse 1.6s ease-in-out infinite;
  }

  @keyframes m-skeleton-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }
}
</style>
