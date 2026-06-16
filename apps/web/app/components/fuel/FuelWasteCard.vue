<script setup lang="ts">
import { MCard, MStackedBarChart } from '@motive/ui'
import type { MStackedBarSeries } from '@motive/ui'

const { dailyWaste, unit, totalWaste } = useFuelWasteData()

const series: MStackedBarSeries[] = [
  { key: 'idling', label: 'Idling', color: 'var(--mtv-color-coral-400)' },
  { key: 'fuelLoss', label: 'Fuel Loss', color: 'var(--mtv-color-red-600)' },
]

const chartData = computed(() =>
  dailyWaste.value.map((d) => ({ label: d.label, idling: d.idling, fuelLoss: d.fuelLoss })),
)

function formatValue(value: number): string {
  return `${value.toFixed(1)} ${unit.value}`
}
</script>

<template>
  <MCard padding="lg" title="Fuel waste" class="fuel-waste-card">
    <template #action>
      <div class="fuel-waste-card__total">
        <span class="fuel-waste-card__total-value">{{ formatValue(totalWaste) }}</span>
        <span class="fuel-waste-card__total-label">total</span>
      </div>
    </template>

    <ClientOnly>
      <MStackedBarChart
        :data="chartData"
        :series="series"
        :height="220"
        :value-formatter="formatValue"
        aria-label="7-day fuel waste from idling and fuel loss"
      />
      <template #fallback>
        <div class="fuel-waste-card__skeleton" aria-hidden="true" />
      </template>
    </ClientOnly>
  </MCard>
</template>

<style scoped>
.fuel-waste-card__total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.fuel-waste-card__total-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
}

.fuel-waste-card__total-label {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.fuel-waste-card__skeleton {
  height: 220px;
  width: 100%;
  border-radius: var(--card-radius);
  background: var(--mtv-color-surface-accent-subtle);
}
</style>
