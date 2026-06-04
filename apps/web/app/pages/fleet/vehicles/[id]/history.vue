<script setup lang="ts">
import { useVehicleDetail } from '~/composables/useVehicleDetail'

definePageMeta({
  layout: 'vehicle-detail',
  title: 'Vehicle Details',
  moduleName: 'Fleet',
})

const route = useRoute()
const vehicleId = computed(() => route.params.id as string)
const { vehicle, driver, loading, notFound } = useVehicleDetail(vehicleId)
</script>

<template>
  <div class="vehicle-history-page">
    <div v-if="loading" class="vehicle-history-page__state">Loading vehicle…</div>
    <div v-else-if="notFound" class="vehicle-history-page__state">
      <p class="vehicle-history-page__not-found">Vehicle "{{ vehicleId }}" not found.</p>
      <NuxtLinkLocale to="/fleet/vehicles" class="vehicle-history-page__back">
        ← Back to Vehicles
      </NuxtLinkLocale>
    </div>
    <VehicleDetailHistory v-else-if="vehicle" :vehicle="vehicle" :driver="driver" />
  </div>
</template>

<style scoped>
.vehicle-history-page {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.vehicle-history-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.75rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}

.vehicle-history-page__not-found {
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.vehicle-history-page__back {
  color: var(--mtv-color-brand-default);
  text-decoration: none;
  font-size: var(--font-size-sm);
}

.vehicle-history-page__back:hover {
  text-decoration: underline;
}
</style>
