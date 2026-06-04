<script setup lang="ts">
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

defineProps<{
  event: FuelEventRow
}>()
</script>

<template>
  <div class="idling-content">
    <!-- Left: KPI + Map -->
    <div class="idling-content__main">
      <FuelDetailEventMetricsBar :event="event" />
      <FuelDetailEventMapCard :event="event" />
    </div>

    <!-- Right: Info cards -->
    <div class="idling-content__cards">
      <FuelDrawerDriverCard :event="event" />
      <FuelDrawerGeofenceCard :event="event" />
      <FuelDrawerVehicleCard :event="event" />
      <FuelDrawerNotesCard :event="event" />
    </div>
  </div>
</template>

<style scoped>
.idling-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  height: 100%;
  min-height: 0;
}

.idling-content__main {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 0;
}

.idling-content__cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: auto;
}
</style>
