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
    return props.metric.deltaType === 'decrease' ? '#dc2626' : '#888888'
  }
  return props.metric.deltaType === 'increase' ? '#888888' : '#dc2626'
})
</script>

<template>
  <article class="kpi-card fleet-card">
    <!-- Header row -->
    <div class="kpi-card__header">
      <span class="kpi-card__title font-mono-data">{{ metric.title }}</span>
      <div class="kpi-card__icon-wrap" aria-hidden="true">
        <MIcon :icon="iconMap[metric.icon] || Truck" :size="20" />
      </div>
    </div>

    <!-- Value -->
    <div class="kpi-card__value-row">
      <div class="kpi-card__value font-condensed">
        {{ metric.displayValue }}
        <span v-if="metric.unit" class="kpi-card__unit">{{ metric.unit }}</span>
      </div>
    </div>

    <!-- Subtitle -->
    <div v-if="metric.subtitle" class="kpi-card__subtitle font-mono-data">
      {{ metric.subtitle }}
    </div>

    <!-- Delta -->
    <div class="kpi-card__delta" :style="{ color: deltaColor }">
      <MIcon
        v-if="metric.deltaType === 'increase'"
        :icon="TrendingUp"
        :size="16"
        :color="deltaColor"
        :stroke-width="2"
      />
      <MIcon
        v-else-if="metric.deltaType === 'decrease'"
        :icon="TrendingDown"
        :size="16"
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
  padding: 1.25rem;
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
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.kpi-card__icon-wrap {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.kpi-card__value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kpi-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.01em;
}

.kpi-card__unit {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin-left: 0.25rem;
  font-family: 'IBM Plex Mono', monospace;
}

.kpi-card__subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
}

.kpi-card__delta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.125rem;
}

.kpi-card__delta-label {
  font-size: 0.75rem;
  font-weight: 500;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.03em;
}
</style>
