<script setup lang="ts">
import {
  Users,
  Truck,
  CheckCircle2,
  TriangleAlert,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-vue-next'
import type { KpiMetric } from '@motive/shared'
import { MIcon } from '@motive/ui'

const props = defineProps<{
  metric: KpiMetric
  index?: number
}>()

const iconMap: Record<string, Component> = {
  drivers: Users,
  miles: Truck,
  ontime: CheckCircle2,
  alerts: TriangleAlert,
}

const deltaColor = computed(() => {
  if (props.metric.id === 'active-alerts') {
    return props.metric.deltaType === 'decrease'
      ? 'oklch(0.577 0.215 27.3)'
      : 'oklch(0.627 0.000 0)'
  }
  return props.metric.deltaType === 'increase' ? 'oklch(0.627 0.000 0)' : 'oklch(0.577 0.215 27.3)'
})
</script>

<template>
  <article class="kpi-card fleet-card">
    <!-- Header row -->
    <div class="kpi-card__header">
      <span class="kpi-card__title">{{ metric.title }}</span>
      <div class="kpi-card__icon-wrap" aria-hidden="true">
        <MIcon :icon="iconMap[metric.icon] || Truck" :size="20" />
      </div>
    </div>

    <!-- Value -->
    <div class="kpi-card__value-row">
      <div class="kpi-card__value">
        {{ metric.displayValue }}
        <span v-if="metric.unit" class="kpi-card__unit">{{ metric.unit }}</span>
      </div>
    </div>

    <!-- Subtitle -->
    <div v-if="metric.subtitle" class="kpi-card__subtitle">
      {{ metric.subtitle }}
    </div>

    <!-- Delta -->
    <div class="kpi-card__delta" :style="{ color: deltaColor }">
      <MIcon
        v-if="metric.deltaType === 'increase'"
        :icon="TrendingUp"
        :color="deltaColor"
        :stroke-width="2"
      />
      <MIcon
        v-else-if="metric.deltaType === 'decrease'"
        :icon="TrendingDown"
        :color="deltaColor"
        :stroke-width="2"
      />
      <MIcon v-else :icon="Minus" :size="16" :color="deltaColor" :stroke-width="2" />
      <span class="kpi-card__delta-label">{{ metric.deltaLabel }}</span>
    </div>
  </article>
</template>

<style scoped>
.kpi-card {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: default;
}

.kpi-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-card__title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--mtv-color-foreground-subtle);
}

.kpi-card__icon-wrap {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--mtv-color-foreground-muted);
}

.kpi-card__value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kpi-card__value {
  font-size: var(--font-size-2xl);
  color: var(--mtv-color-foreground-default);
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-tighter);
}

.kpi-card__unit {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-normal);
  color: var(--mtv-color-foreground-muted);
  margin-left: 0.25rem;
  font-family: var(--font-family-mono);
}

.kpi-card__subtitle {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-normal);
}

.kpi-card__delta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

.kpi-card__delta-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-normal);
}
</style>
