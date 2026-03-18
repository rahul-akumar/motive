<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
}>()
</script>

<template>
  <div class="panel-kpi-row">
    <span class="panel-kpi-row__label">{{ label }}</span>
    <span class="panel-kpi-row__value">
      {{ value }}<span v-if="unit" class="panel-kpi-row__unit">{{ unit }}</span>
    </span>
  </div>
</template>

<style scoped>
.panel-kpi-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
}

.panel-kpi-row__label {
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-muted);
}

.panel-kpi-row__value {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  flex-shrink: 0;
}

.panel-kpi-row__unit {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  color: var(--mtv-color-foreground-subtle);
  margin-left: 0.2rem;
}
</style>
