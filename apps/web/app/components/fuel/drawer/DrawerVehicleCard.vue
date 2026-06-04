<script setup lang="ts">
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

// Mock tank capacity (deterministic from vehicleId)
const tankGal = computed(() => {
  const hash = props.event.vehicleId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 100 + (hash % 100) // 100–200 gal
})

const groups = computed(() => {
  const hash = props.event.vehicleId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 1 + (hash % 4)
})
</script>

<template>
  <div class="drawer-vehicle">
    <span class="drawer-vehicle__label">VEHICLE</span>
    <NuxtLinkLocale class="drawer-vehicle__name" :to="`/fleet/vehicles/${event.vehicleId}/live`">
      {{ event.vehicleName }}
    </NuxtLinkLocale>
    <span class="drawer-vehicle__meta"> {{ event.vehicleMMY }} · {{ tankGal }} gal tank </span>
    <span class="drawer-vehicle__meta">{{ groups }} Groups</span>
  </div>
</template>

<style scoped>
.drawer-vehicle {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.75rem;
  background: var(--mtv-color-surface-sunken);
  border-radius: var(--radius);
}

.drawer-vehicle__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
}

.drawer-vehicle__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-brand-default);
  text-decoration: none;
}

.drawer-vehicle__name:hover {
  text-decoration: underline;
}

.drawer-vehicle__meta {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}
</style>
