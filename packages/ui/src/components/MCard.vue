<script setup lang="ts">
export interface MCardProps {
  /** Inner padding applied to the card content. @default 'none' */
  padding?: 'none' | 'sm' | 'md'
}

withDefaults(defineProps<MCardProps>(), {
  padding: 'none',
})
</script>

<template>
  <div :class="['m-card', `m-card--pad-${padding}`]">
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

.m-card--pad-none {
  padding: 0;
}

.m-card--pad-sm {
  padding: 0.5rem;
}

.m-card--pad-md {
  padding: 1rem;
}
</style>
