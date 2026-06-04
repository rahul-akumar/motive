<script setup lang="ts">
import { AlertTriangle, ShieldAlert } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import { useVehicleDetail } from '~/composables/useVehicleDetail'
import { useVehicleSecurityData } from '~/composables/useVehicleSecurityData'

definePageMeta({
  layout: 'vehicle-detail',
  title: 'Vehicle Details',
  moduleName: 'Fleet',
})

const route = useRoute()
const vehicleId = computed(() => route.params.id as string)
const { vehicle, loading, notFound } = useVehicleDetail(vehicleId)
const { devices, isJammed, jammingEvent } = useVehicleSecurityData(vehicleId)

const { formatTime } = useFormatters()
</script>

<template>
  <div class="assets-page">
    <div v-if="loading" class="assets-page__state">Loading assets…</div>
    <div v-else-if="notFound" class="assets-page__state">Vehicle not found.</div>
    <template v-else>
      <!-- Critical alert banner -->
      <div v-if="isJammed" class="assets-page__alert">
        <MIcon :icon="ShieldAlert" :size="18" />
        <div class="assets-page__alert-content">
          <strong>SIGNAL JAMMING DETECTED</strong>
          <span>
            GPS/Cellular signals lost at {{ formatTime(jammingEvent!.jammedAt) }}. Engine
            immobilizer has been activated.
          </span>
        </div>
      </div>

      <!-- Device grid -->
      <div v-if="devices.length > 0" class="assets-page__grid">
        <VehicleDeviceCard v-for="device in devices" :key="device.id" :device="device" />
      </div>

      <div v-else class="assets-page__empty">
        <MIcon :icon="AlertTriangle" :size="32" class="assets-page__empty-icon" />
        <p>No assets installed on this vehicle.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.assets-page {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
}

.assets-page__state {
  padding: 3rem;
  text-align: center;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
}

.assets-page__alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid var(--mtv-color-status-critical);
  border-radius: 8px;
  color: var(--mtv-color-status-critical);
}

.assets-page__alert-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: var(--font-size-sm);
}

.assets-page__alert-content strong {
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.assets-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.assets-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
}

.assets-page__empty-icon {
  opacity: 0.5;
}
</style>
