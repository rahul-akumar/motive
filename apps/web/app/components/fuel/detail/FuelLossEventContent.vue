<script setup lang="ts">
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

defineProps<{
  event: FuelEventRow
}>()
</script>

<template>
  <div class="fuel-loss-content">
    <!-- Left: Metrics + Map + Dashcam -->
    <div class="fuel-loss-content__main">
      <FuelDetailEventMetricsBar :event="event" />
      <FuelDetailEventMapCard :event="event" />
      <FuelDetailEventDashcam :event="event" />
    </div>

    <!-- Right: Info cards -->
    <div class="fuel-loss-content__cards">
      <FuelDrawerDriverCard :event="event" />
      <FuelDrawerGeofenceCard :event="event" />
      <FuelDrawerVehicleCard :event="event" />
      <FuelDrawerNotesCard :event="event" />
    </div>
  </div>
</template>

<style scoped>
.fuel-loss-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  height: 100%;
  min-height: 0;
}

.fuel-loss-content__main {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 0;
  overflow: auto;
}

.fuel-loss-content__cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: auto;
}
</style>
