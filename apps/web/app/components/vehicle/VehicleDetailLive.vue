<script setup lang="ts">
import { MPopover, MMapControls } from '@motive/ui'
import type { FleetVehicle, FleetDriver } from '@motive/shared'
import { useVehicleSecurityData } from '~/composables/useVehicleSecurityData'
import { useVehicleLiveMap } from '~/composables/useVehicleLiveMap'
import VehicleLivePanel from '~/components/vehicle/VehicleLivePanel.vue'
import SignalJammedPopover from '~/components/vehicle/SignalJammedPopover.vue'
import MapMarkerPopover from '~/components/vehicle/MapMarkerPopover.vue'

const props = defineProps<{
  vehicle: FleetVehicle
  driver?: FleetDriver
}>()

const vehicleId = computed(() => props.vehicle.id)
const {
  isJammed,
  isImmobilized,
  maxRadiusMeters,
  jammingEvent,
  elapsedSeconds,
  searchRadiusMeters,
  sectorPoints,
} = useVehicleSecurityData(vehicleId)

const isZoneFrozen = computed(
  () => isImmobilized.value && searchRadiusMeters.value >= maxRadiusMeters.value,
)

const {
  mapContainer,
  zoomIn,
  zoomOut,
  incidentLayers,
  activeLayerIds,
  handleToggleLayer,
  INCIDENT_LABELS,
  popoverOpen,
  popoverAnchorEl,
  popoverCompRef,
  incidentPopoverOpen,
  incidentPopoverAnchorEl,
  incidentPopoverRef,
  activeIncident,
  handleMarkIncident,
  handleBroadcastIncident,
  handleNotifyOnline,
  handleRemobilize,
  handleInformAuthorities,
} = useVehicleLiveMap({
  vehicle: computed(() => props.vehicle),
  isJammed,
  jammingEvent,
  isZoneFrozen,
  searchRadiusMeters,
  sectorPoints,
})
</script>

<template>
  <div class="vehicle-live">
    <!-- Status Panel (docked left) -->
    <VehicleLivePanel
      :vehicle="vehicle"
      :driver="driver"
      :is-jammed="isJammed"
      :is-zone-frozen="isZoneFrozen"
      :elapsed-seconds="elapsedSeconds"
    />

    <!-- Map -->
    <div class="vehicle-live__map-wrap">
      <div ref="mapContainer" class="vehicle-live__map" />

      <MMapControls
        :layers="incidentLayers"
        :active-layers="activeLayerIds"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @toggle-layer="handleToggleLayer"
      />

      <!-- Signal Jammed Popover -->
      <MPopover
        ref="popoverCompRef"
        v-model:open="popoverOpen"
        :anchor-el="popoverAnchorEl"
        placement="top"
        :arrow="true"
        aria-label="Signal jammed details"
      >
        <SignalJammedPopover
          v-if="jammingEvent"
          :jamming-event="jammingEvent"
          :elapsed-seconds="elapsedSeconds"
          :is-immobilized="isZoneFrozen"
          @mark-incident="handleMarkIncident"
          @broadcast-incident="handleBroadcastIncident"
          @notify-online="handleNotifyOnline"
          @inform-authorities="handleInformAuthorities"
          @re-mobilize="handleRemobilize"
        />
      </MPopover>

      <!-- Prior Incident Popover -->
      <MPopover
        ref="incidentPopoverRef"
        v-model:open="incidentPopoverOpen"
        :anchor-el="incidentPopoverAnchorEl"
        placement="top"
        :arrow="true"
        aria-label="Prior incident details"
      >
        <MapMarkerPopover
          v-if="activeIncident"
          :title="INCIDENT_LABELS[activeIncident.type] ?? activeIncident.type"
          :timestamp="activeIncident.date"
          badge-label="Prior incident"
          badge-color="warning"
        />
      </MPopover>
    </div>
  </div>
</template>

<style scoped>
.vehicle-live {
  position: absolute;
  inset: 0;
  display: flex;
  overflow: hidden;
}

.vehicle-live__map-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.vehicle-live__map {
  width: 100%;
  height: 100%;
}
</style>

<style>
/* Global styles for jammed marker (not scoped, since it's in Leaflet's DOM) */
.jammed-marker {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jammed-marker__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--fleet-severity-critical);
  animation: jammed-pulse 1.5s ease-out infinite;
}

@keyframes jammed-pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

.jammed-marker__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--fleet-severity-critical);
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
