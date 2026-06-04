<script setup lang="ts">
import { MButton } from '@motive/ui'
import { getDriverFuelHistory } from '~/mocks/driver-insights'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

const { allRows, filterDriver } = useFuelEventsData()

const driverHistory = computed(() => getDriverFuelHistory(props.event.driverId, allRows.value))

function viewAllForDriver() {
  filterDriver.value = props.event.driverId ?? null
}
</script>

<template>
  <div class="drawer-driver">
    <span class="drawer-driver__section-label">DRIVER</span>

    <template v-if="event.driverName">
      <NuxtLinkLocale class="drawer-driver__name" :to="`/fleet/drivers`">
        {{ event.driverName }}
      </NuxtLinkLocale>
      <span class="drawer-driver__meta">ID: {{ event.driverId }}</span>
      <span v-if="driverHistory" class="drawer-driver__meta">
        {{ driverHistory.groups }} Groups
      </span>

      <!-- Fuel loss history -->
      <div v-if="driverHistory && event.type === 'fuel-loss'" class="drawer-driver__history">
        <span class="drawer-driver__history-title">Fuel loss history</span>
        <span class="drawer-driver__history-subtitle">LAST 30 DAYS</span>
        <div class="drawer-driver__history-rows">
          <div class="drawer-driver__history-row">
            <span>Total events</span>
            <span class="drawer-driver__history-value">{{ driverHistory.totalEvents }}</span>
          </div>
          <div class="drawer-driver__history-row">
            <span>Total fuel lost</span>
            <span class="drawer-driver__history-value">{{ driverHistory.totalFuelLost }} gal</span>
          </div>
          <div class="drawer-driver__history-row">
            <span>Cost</span>
            <span class="drawer-driver__history-value">${{ driverHistory.cost }}</span>
          </div>
        </div>
        <MButton variant="link" size="xs" class="drawer-driver__view-all" @click="viewAllForDriver">
          VIEW ALL
        </MButton>
      </div>
    </template>
    <span v-else class="drawer-driver__unassigned">Unassigned</span>
  </div>
</template>

<style scoped>
.drawer-driver {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.75rem;
  background: var(--mtv-color-surface-sunken);
  border-radius: var(--radius);
}

.drawer-driver__section-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
}

.drawer-driver__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-brand-default);
  text-decoration: none;
}

.drawer-driver__name:hover {
  text-decoration: underline;
}

.drawer-driver__meta {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.drawer-driver__unassigned {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}

.drawer-driver__history {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.drawer-driver__history-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.drawer-driver__history-subtitle {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.drawer-driver__history-rows {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.drawer-driver__history-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}

.drawer-driver__history-value {
  font-weight: 500;
}

.drawer-driver__view-all {
  margin-top: 0.375rem;
  align-self: flex-start;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
</style>
