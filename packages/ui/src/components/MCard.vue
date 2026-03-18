<script setup lang="ts">
export interface MCardProps {
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
  border-radius: 8px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.25),
    0 1px 4px rgba(0, 0, 0, 0.15);
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
