<script setup lang="ts">
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

defineProps<{
  event: FuelEventRow | null
}>()
</script>

<template>
  <div v-if="event" class="fuel-event-drawer">
    <FuelDrawerAiInsightsCard v-if="event.type === 'fuel-loss'" :event="event" />
    <FuelDrawerKpiCard :event="event" />
    <FuelDrawerDriverCard :event="event" />
    <FuelDrawerVehicleCard :event="event" />
    <FuelDrawerMapCard :event="event" />
    <FuelDrawerNotesCard :event="event" />
  </div>
</template>

<style scoped>
.fuel-event-drawer {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
