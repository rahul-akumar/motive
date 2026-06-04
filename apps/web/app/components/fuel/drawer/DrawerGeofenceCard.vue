<script setup lang="ts">
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

// Mock geofence count (deterministic from event id)
const geofenceCount = computed(() => {
  const hash = props.event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 3 + (hash % 12)
})
</script>

<template>
  <div class="drawer-geofence">
    <span class="drawer-geofence__label">GEOFENCES</span>
    <NuxtLinkLocale class="drawer-geofence__value" to="/fleet/live">
      {{ geofenceCount }} geofences
    </NuxtLinkLocale>
  </div>
</template>

<style scoped>
.drawer-geofence {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--mtv-color-surface-sunken);
  border-radius: var(--radius);
}

.drawer-geofence__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.drawer-geofence__value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 2px;
}

.drawer-geofence__value:hover {
  color: var(--mtv-color-brand-default);
}
</style>
