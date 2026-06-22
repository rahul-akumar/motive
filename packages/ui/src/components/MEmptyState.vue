<script setup lang="ts">
import type { Component } from 'vue'
import { useSlots } from 'vue'
import MIcon from './MIcon.vue'

export interface MEmptyStateProps {
  /** Heading describing the empty/error condition. */
  title: string
  /** Optional supporting line beneath the title. */
  description?: string
  /** Optional leading icon (a lucide-vue-next icon), rendered via MIcon. */
  icon?: Component
  /** Tone of the state — `error` tints the icon with the critical color. @default 'empty' */
  variant?: 'empty' | 'error'
  /** Vertical padding scale. @default 'md' */
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<MEmptyStateProps>(), {
  description: undefined,
  icon: undefined,
  variant: 'empty',
  size: 'md',
})

const slots = useSlots()
</script>

<template>
  <div
    :class="['m-empty-state', `m-empty-state--${variant}`, `m-empty-state--${size}`]"
    :role="variant === 'error' ? 'alert' : undefined"
  >
    <div v-if="icon" class="m-empty-state__icon">
      <MIcon :icon="icon" :size="28" :stroke-width="1.5" />
    </div>
    <p class="m-empty-state__title">{{ title }}</p>
    <p v-if="description" class="m-empty-state__description">{{ description }}</p>
    <div v-if="slots.action" class="m-empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.m-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.375rem;
}

.m-empty-state--sm {
  padding: 1.5rem 1rem;
}

.m-empty-state--md {
  padding: 3rem 1.5rem;
}

.m-empty-state--lg {
  padding: 4.5rem 1.5rem;
}

.m-empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  color: var(--mtv-color-foreground-subtle);
}

.m-empty-state--error .m-empty-state__icon {
  color: var(--mtv-color-status-critical);
}

.m-empty-state__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  margin: 0;
}

.m-empty-state__description {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  max-width: 36ch;
  line-height: var(--leading-normal);
  margin: 0;
}

.m-empty-state__action {
  margin-top: 0.75rem;
}
</style>
