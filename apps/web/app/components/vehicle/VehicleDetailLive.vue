<script setup lang="ts">
import { MapPin, Clock, Navigation } from 'lucide-vue-next'
import { MBadge, MIcon } from '@motive/ui'
import type { FleetVehicle, FleetDriver, FleetVehicleStatus } from '@motive/shared'

const props = defineProps<{
  vehicle: FleetVehicle
  driver?: FleetDriver
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

const STATUS_BADGE: Record<
  FleetVehicleStatus,
  { color: 'success' | 'warning' | 'danger' | 'default'; label: string }
> = {
  active: { color: 'success', label: 'Active' },
  idle: { color: 'warning', label: 'Idle' },
  'out-of-service': { color: 'danger', label: 'Out of Service' },
  maintenance: { color: 'default', label: 'Maintenance' },
}

const STATUS_COLORS: Record<FleetVehicleStatus, string> = {
  active: '#4ade80',
  idle: '#fbbf24',
  'out-of-service': '#f87171',
  maintenance: '#94a3b8',
}

const LIGHT_THEMES = new Set(['light', 'console-legacy'])

function isDark(): boolean {
  const theme = document.documentElement.getAttribute('data-theme') ?? 'dark'
  return !LIGHT_THEMES.has(theme)
}

function getTileUrl(): string {
  return isDark()
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
}

async function initMap() {
  if (!mapContainer.value) return

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  const { lat, lng } = props.vehicle.currentLocation

  map = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: 13,
    zoomControl: false,
    attributionControl: false,
  })

  L.tileLayer(getTileUrl(), {
    maxZoom: 18,
    subdomains: 'abcd',
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  const color = STATUS_COLORS[props.vehicle.status]
  const icon = L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  marker = L.marker([lat, lng], { icon }).addTo(map)

  const observer = new MutationObserver(() => {
    if (!map) return
    map.eachLayer((layer) => {
      if ((layer as L.TileLayer).setUrl) {
        ;(layer as L.TileLayer).setUrl(getTileUrl())
      }
    })
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
}

onMounted(initMap)

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="vehicle-live">
    <!-- Map (edge-to-edge background) -->
    <div ref="mapContainer" class="vehicle-live__map" />

    <!-- Status Panel (floating overlay) -->
    <aside class="vehicle-live__panel">
      <div class="vehicle-live__section">
        <h3 class="vehicle-live__section-title">Status</h3>
        <div class="vehicle-live__status-row">
          <MBadge
            :label="STATUS_BADGE[vehicle.status].label"
            :color="STATUS_BADGE[vehicle.status].color"
            size="sm"
          />
        </div>
      </div>

      <div class="vehicle-live__section">
        <h3 class="vehicle-live__section-title">Location</h3>
        <div class="vehicle-live__info-row">
          <MIcon :icon="MapPin" :size="14" class="vehicle-live__info-icon" />
          <span>{{ vehicle.currentLocation.city }}, {{ vehicle.currentLocation.state }}</span>
        </div>
        <div class="vehicle-live__info-row">
          <MIcon :icon="Navigation" :size="14" class="vehicle-live__info-icon" />
          <span class="vehicle-live__coords">
            {{ vehicle.currentLocation.lat.toFixed(4) }},
            {{ vehicle.currentLocation.lng.toFixed(4) }}
          </span>
        </div>
      </div>

      <div class="vehicle-live__section">
        <h3 class="vehicle-live__section-title">Vehicle Info</h3>
        <dl class="vehicle-live__dl">
          <dt>Unit</dt>
          <dd>{{ vehicle.unitNumber }}</dd>
          <dt>Make / Model</dt>
          <dd>{{ vehicle.make }} {{ vehicle.model }}</dd>
          <dt>Year</dt>
          <dd>{{ vehicle.year }}</dd>
          <dt>Mileage</dt>
          <dd>{{ vehicle.mileage.toLocaleString() }} mi</dd>
          <dt>Fuel</dt>
          <dd>{{ vehicle.fuelLevel }}%</dd>
        </dl>
      </div>

      <div v-if="driver" class="vehicle-live__section">
        <h3 class="vehicle-live__section-title">Assigned Driver</h3>
        <dl class="vehicle-live__dl">
          <dt>Name</dt>
          <dd>{{ driver.name }}</dd>
          <dt>ID</dt>
          <dd>{{ driver.id }}</dd>
          <dt>Status</dt>
          <dd>{{ driver.status }}</dd>
          <dt>Phone</dt>
          <dd>{{ driver.phone }}</dd>
        </dl>
      </div>

      <div v-if="vehicle.assetName" class="vehicle-live__section">
        <h3 class="vehicle-live__section-title">Attached Asset</h3>
        <dl class="vehicle-live__dl">
          <dt>Asset</dt>
          <dd>{{ vehicle.assetName }}</dd>
        </dl>
      </div>

      <div class="vehicle-live__section">
        <h3 class="vehicle-live__section-title">Equipment</h3>
        <dl class="vehicle-live__dl">
          <dt>Cameras</dt>
          <dd>{{ vehicle.cameras }}</dd>
          <dt>Defects</dt>
          <dd :class="{ 'vehicle-live__danger': vehicle.defects > 0 }">{{ vehicle.defects }}</dd>
        </dl>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.vehicle-live {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.vehicle-live__map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.vehicle-live__panel {
  position: absolute;
  top: 1rem;
  left: 1rem;
  bottom: 1rem;
  width: 280px;
  z-index: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background-color: var(--mtv-color-surface-base);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--card-radius, 8px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.vehicle-live__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vehicle-live__section-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.vehicle-live__status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vehicle-live__info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}

.vehicle-live__info-icon {
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
}

.vehicle-live__coords {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.vehicle-live__dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.75rem;
  font-size: var(--font-size-sm);
}

.vehicle-live__dl dt {
  color: var(--mtv-color-foreground-muted);
}

.vehicle-live__dl dd {
  color: var(--mtv-color-foreground-default);
  margin: 0;
}

.vehicle-live__danger {
  color: var(--mtv-color-status-danger);
  font-weight: 600;
}

@media (max-width: 768px) {
  .vehicle-live__panel {
    top: auto;
    left: 0.5rem;
    right: 0.5rem;
    bottom: 0.5rem;
    width: auto;
    max-height: 50%;
  }
}
</style>
