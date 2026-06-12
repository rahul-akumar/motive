<script setup lang="ts">
import type { Component } from 'vue'

export type MTableCellVariant = 'primary' | 'secondary' | 'muted' | 'link' | 'mono' | 'danger'

export interface MTableCellProps {
  variant?: MTableCellVariant
  /** Element or component to render as (e.g. 'a', NuxtLink) — useful for link cells. */
  tag?: string | Component
}

withDefaults(defineProps<MTableCellProps>(), {
  variant: 'primary',
  tag: 'span',
})
</script>

<template>
  <component :is="tag" :class="['m-table-cell', `m-table-cell--${variant}`]">
    <slot />
  </component>
</template>

<style scoped>
.m-table-cell--primary {
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-default);
}

.m-table-cell--secondary {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  white-space: nowrap;
}

.m-table-cell--muted {
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-muted);
}

/* Block + fit-content keeps the click target constrained to the text. */
.m-table-cell--link {
  display: block;
  width: fit-content;
  font-size: var(--font-size-base);
  color: var(--mtv-color-brand-default);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}

.m-table-cell--link:hover {
  text-decoration: underline;
}

.m-table-cell--mono {
  font-size: var(--font-size-base);
  font-family: var(--font-family-mono);
}

.m-table-cell--danger {
  font-size: var(--font-size-base);
  color: var(--mtv-color-status-critical);
  font-weight: var(--font-weight-semibold);
}
</style>
