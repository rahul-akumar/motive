<script setup lang="ts">
import { useVehicleDetail } from '~/composables/useVehicleDetail'

definePageMeta({
  title: 'Vehicle Details',
  moduleName: 'Fleet',
  mainVariant: 'default',
})

const route = useRoute()
const vehicleId = computed(() => route.params.id as string)
const { vehicle, driver, loading, notFound } = useVehicleDetail(vehicleId)
</script>

<template>
  <div class="vehicle-live-page">
    <div v-if="loading" class="vehicle-live-page__state">Loading vehicle…</div>
    <div v-else-if="notFound" class="vehicle-live-page__state">
      <p class="vehicle-live-page__not-found">Vehicle "{{ vehicleId }}" not found.</p>
      <NuxtLinkLocale to="/fleet/vehicles" class="vehicle-live-page__back">
        ← Back to Vehicles
      </NuxtLinkLocale>
    </div>
    <VehicleDetailLive v-else-if="vehicle" :vehicle="vehicle" :driver="driver" />
  </div>
</template>

<style scoped>
.vehicle-live-page {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.vehicle-live-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.75rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}

.vehicle-live-page__not-found {
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.vehicle-live-page__back {
  color: var(--mtv-color-brand-default);
  text-decoration: none;
  font-size: var(--font-size-sm);
}

.vehicle-live-page__back:hover {
  text-decoration: underline;
}
</style>
