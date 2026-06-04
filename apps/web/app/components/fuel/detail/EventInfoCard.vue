<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="event-info-card">
    <span class="event-info-card__label">{{ label }}</span>
    <div class="event-info-card__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.event-info-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
}

.event-info-card:last-child {
  border-bottom: none;
}

.event-info-card__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.event-info-card__body {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}
</style>
