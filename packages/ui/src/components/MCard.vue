<script setup lang="ts">
import { computed, useSlots } from 'vue'

export interface MCardProps {
  /** Inner padding applied to the card. @default 'none' */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Optional header heading. When set (or with a subtitle / #action slot), a header row is rendered. */
  title?: string
  /** Optional header sub-text shown beneath the title. */
  subtitle?: string
}

withDefaults(defineProps<MCardProps>(), {
  padding: 'none',
  title: undefined,
  subtitle: undefined,
})

const slots = useSlots()

/** Render the header row only when there's something to put in it (keeps plain cards untouched). */
const hasHeader = computed(() => Boolean(slots.title || slots.action))
</script>

<template>
  <div
    :class="[
      'm-card',
      `m-card--pad-${padding}`,
      { 'm-card--sectioned': hasHeader || title || subtitle },
    ]"
  >
    <div v-if="hasHeader || title || subtitle" class="m-card__header">
      <div v-if="title || subtitle || slots.title" class="m-card__heading">
        <slot name="title">
          <h2 v-if="title" class="m-card__title">{{ title }}</h2>
          <p v-if="subtitle" class="m-card__subtitle">{{ subtitle }}</p>
        </slot>
      </div>
      <slot name="action" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.m-card {
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--card-radius);
  box-shadow: var(--mtv-shadow-md);
}

/* Header + content stack only when the card has a header. */
.m-card--sectioned {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.m-card--pad-none {
  padding: 0;
}

.m-card--pad-sm {
  padding: 0.5rem;
}

.m-card--pad-md {
  padding: 1rem;
}

.m-card--pad-lg {
  padding: 1.25rem;
}

.m-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.m-card__title {
  font-family: var(--font-family-condensed);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  letter-spacing: var(--tracking-tight);
  margin: 0;
}

.m-card__subtitle {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  margin: 2px 0 0;
  letter-spacing: var(--tracking-wide);
}
</style>
