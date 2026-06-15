<script setup lang="ts">
export interface DashboardCardProps {
  title: string
  subtitle?: string
}

defineProps<DashboardCardProps>()
</script>

<template>
  <div class="dashboard-card fleet-card">
    <div class="dashboard-card__header">
      <div class="dashboard-card__heading">
        <h2 class="dashboard-card__title">{{ title }}</h2>
        <p v-if="subtitle" class="dashboard-card__subtitle">{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.dashboard-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-card__title {
  font-family: var(--font-family-condensed);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  letter-spacing: var(--tracking-tight);
  margin: 0;
}

.dashboard-card__subtitle {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  margin: 2px 0 0;
  letter-spacing: var(--tracking-wide);
}
</style>
