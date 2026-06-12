<script setup lang="ts">
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

// Compute duration in seconds between start and end
const durationSec = computed(() => {
  const ms = new Date(props.event.endTime).getTime() - new Date(props.event.startTime).getTime()
  return Math.round(ms / 1000)
})

const durationLabel = computed(() => {
  const s = durationSec.value
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.round(s / 60)}m`
  return `${(s / 3600).toFixed(1)}h`
})

// Mock KPI data derived from event fields
const fuelLossCost = computed(() => {
  if (props.event.type === 'fuel-loss') {
    // ~$3.80/gal avg, fuelDrop% of ~150gal tank
    const gallons = ((props.event.fuelDrop ?? 0) / 100) * 150
    return `$${(gallons * 3.8).toFixed(0)}`
  }
  // Idling cost
  return `$${((props.event.fuelWasted ?? 0) * 3.8).toFixed(0)}`
})

const fuelVolume = computed(() => {
  if (props.event.type === 'fuel-loss') {
    const gallons = ((props.event.fuelDrop ?? 0) / 100) * 150
    return `${gallons.toFixed(2)} / $${(gallons * 3.8).toFixed(2)}`
  }
  return `${(props.event.fuelWasted ?? 0).toFixed(2)} / $${((props.event.fuelWasted ?? 0) * 3.8).toFixed(2)}`
})

// Simulated ambient temperature based on event id hash
const ambientTemp = computed(() => {
  const hash = props.event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return (40 + (hash % 35)).toFixed(1)
})
</script>

<template>
  <div class="drawer-kpi">
    <div class="drawer-kpi__grid">
      <div class="drawer-kpi__item">
        <span class="drawer-kpi__label">
          {{ event.type === 'fuel-loss' ? 'FUEL LOSS' : 'FUEL WASTED' }}
        </span>
        <span class="drawer-kpi__value">
          {{ event.type === 'fuel-loss' ? `${event.fuelDrop}%` : `${event.fuelWasted} gal` }}
        </span>
      </div>
      <div class="drawer-kpi__item">
        <span class="drawer-kpi__label">DURATION</span>
        <span class="drawer-kpi__value">{{ durationLabel }}</span>
      </div>
      <div class="drawer-kpi__item">
        <span class="drawer-kpi__label">FUEL LOSS COST</span>
        <span class="drawer-kpi__value">{{ fuelLossCost }}</span>
      </div>
      <div class="drawer-kpi__item">
        <span class="drawer-kpi__label">FUEL VOL. (GAL) / COST</span>
        <span class="drawer-kpi__value">{{ fuelVolume }}</span>
      </div>
      <div class="drawer-kpi__item">
        <span class="drawer-kpi__label">AMBIENT TEMPERATURE</span>
        <span class="drawer-kpi__value">{{ ambientTemp }} °F</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-kpi {
  padding: 0.75rem;
  background: var(--mtv-color-surface-sunken);
  border-radius: var(--radius);
}

.drawer-kpi__grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem 1rem;
}

.drawer-kpi__item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.drawer-kpi__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.drawer-kpi__value {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}
</style>
