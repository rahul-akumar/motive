<script setup lang="ts">
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

const COST_PER_GAL = 3.8

interface Metric {
  label: string
  value: string
}

const metrics = computed<Metric[]>(() => {
  const e = props.event
  if (e.type === 'idling') {
    const durationMins = e.durationMins ?? 0
    const fuelWasted = e.fuelWasted ?? 0
    const cost = fuelWasted * COST_PER_GAL
    return [
      { label: 'Total Idling', value: formatDuration(durationMins) },
      { label: 'Total W/O PTO', value: formatDuration(durationMins) },
      { label: 'Total W/ PTO', value: '—' },
      { label: 'Fuel Vol. (gal)', value: fuelWasted.toFixed(2) },
      { label: 'Cost', value: `$${cost.toFixed(2)}` },
      { label: 'Ambient Temperature', value: generateTemp(e.id) },
    ]
  }
  // fuel-loss
  const fuelDrop = e.fuelDrop ?? 0
  const dropPercent = e.fuelStart && e.fuelEnd ? e.fuelStart - e.fuelEnd : fuelDrop
  const costPerGal = 3.52 // US avg $/gal
  const cost = fuelDrop * costPerGal
  return [
    { label: 'Fuel Drop', value: fuelDrop ? `${fuelDrop} gal` : '—' },
    { label: 'Drop %', value: dropPercent ? `${dropPercent}%` : '—' },
    { label: 'Cost', value: `$${cost.toFixed(2)}` },
    { label: 'Fuel Price ($/gal)', value: `$${costPerGal.toFixed(2)}` },
  ]
})

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const s = Math.round((mins - Math.floor(mins)) * 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

function generateTemp(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const temp = 80 + (hash % 40) // 80–120°F
  return `${temp.toFixed(1)}°F`
}
</script>

<template>
  <div class="event-metrics">
    <div v-for="m in metrics" :key="m.label" class="event-metrics__item">
      <span class="event-metrics__label">{{ m.label }}</span>
      <span class="event-metrics__value">{{ m.value }}</span>
    </div>
  </div>
</template>

<style scoped>
.event-metrics {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  padding: 0.75rem 0;
  flex-wrap: wrap;
}

.event-metrics__item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.event-metrics__label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.event-metrics__value {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--mtv-color-foreground-default);
}
</style>
