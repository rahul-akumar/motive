<script setup lang="ts">
import {
  MapPin,
  Clock,
  Navigation,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Thermometer,
  Fuel,
  Gauge,
  CircleAlert,
  AlertTriangle,
} from 'lucide-vue-next'
import { MBadge, MButton, MIcon, MPopover, MMapControls } from '@motive/ui'
import type { MMapControlsLayer } from '@motive/ui'
import type { FleetVehicle, FleetDriver, FleetVehicleStatus } from '@motive/shared'
import { useVehicleSecurityData } from '~/composables/useVehicleSecurityData'
import { destinationPoint } from '~/composables/useSearchZoneGeometry'
import SignalJammedPopover from '~/components/vehicle/SignalJammedPopover.vue'
import MapMarkerPopover from '~/components/vehicle/MapMarkerPopover.vue'

const props = defineProps<{
  vehicle: FleetVehicle
  driver?: FleetDriver
}>()

const vehicleId = computed(() => props.vehicle.id)
const { isJammed, jammingEvent, elapsedSeconds, searchRadiusMeters, searchRadiusKm, sectorPoints } =
  useVehicleSecurityData(vehicleId)

const immobilizerExpanded = ref(true)
const telematicsExpanded = ref(false)
const tpmsExpanded = ref(false)

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null
let searchCircle: L.Circle | null = null
let sectorPolygon: L.Polygon | null = null
let headingLine: L.Polyline | null = null
let headingArrow: L.Marker | null = null
let incidentMarkers: Array<{ marker: L.Marker; type: string }> = []

const popoverOpen = ref(false)
const popoverAnchorEl = ref<HTMLElement | null>(null)
const popoverCompRef = ref<InstanceType<typeof MPopover> | null>(null)

const incidentPopoverOpen = ref(false)
const incidentPopoverAnchorEl = ref<HTMLElement | null>(null)
const incidentPopoverRef = ref<InstanceType<typeof MPopover> | null>(null)
const activeIncident = ref<{ type: string; date: Date } | null>(null)

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

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

function createVirtualAnchor(): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;'
  mapContainer.value!.appendChild(el)
  return el
}

function syncAnchorToMarker() {
  if (!map || !marker || !popoverAnchorEl.value) return
  const point = map.latLngToContainerPoint(marker.getLatLng())
  popoverAnchorEl.value.style.left = `${point.x}px`
  popoverAnchorEl.value.style.top = `${point.y}px`
}

function handleMarkIncident() {
  popoverOpen.value = false
}

function handleBroadcastIncident() {
  popoverOpen.value = false
}

function handleNotifyOnline() {
  popoverOpen.value = false
}

const INCIDENT_LABELS: Record<string, string> = {
  jamming: 'Jamming',
  'theft-attempt': 'Theft attempt',
  'unauthorized-movement': 'Unauthorized movement',
}

const INCIDENT_COLORS: Record<string, string> = {
  jamming: 'var(--mtv-color-status-warning)',
  'theft-attempt': '#f26040',
  'unauthorized-movement': 'var(--mtv-color-status-critical)',
}

const INCIDENT_HEX: Record<string, string> = {
  jamming: '#d97706',
  'theft-attempt': '#f26040',
  'unauthorized-movement': '#e52222',
}

const incidentLayers: MMapControlsLayer[] = [
  {
    id: 'incidents',
    label: 'Incidents',
    icon: AlertTriangle,
    children: [
      {
        id: 'incidents:jamming',
        label: 'Jamming',
        icon: AlertTriangle,
        color: 'var(--mtv-color-status-warning)',
      },
      { id: 'incidents:theft', label: 'Theft', icon: AlertTriangle, color: '#f26040' },
      {
        id: 'incidents:unauthorized',
        label: 'Unauthorized',
        icon: AlertTriangle,
        color: 'var(--mtv-color-status-critical)',
      },
    ],
  },
]

const LAYER_TO_TYPE: Record<string, string> = {
  'incidents:jamming': 'jamming',
  'incidents:theft': 'theft-attempt',
  'incidents:unauthorized': 'unauthorized-movement',
}

const activeLayerIds = ref<Set<string>>(
  new Set(['incidents:jamming', 'incidents:theft', 'incidents:unauthorized']),
)

function handleToggleLayer(id: string) {
  const next = new Set(activeLayerIds.value)
  if (id === 'incidents') {
    const childIds = incidentLayers[0].children!.map((c) => c.id)
    const allActive = childIds.every((cid) => next.has(cid))
    if (allActive) {
      childIds.forEach((cid) => next.delete(cid))
    } else {
      childIds.forEach((cid) => next.add(cid))
    }
  } else if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  activeLayerIds.value = next
  syncIncidentVisibility()
}

function isIncidentVisible(type: string): boolean {
  for (const [layerId, incType] of Object.entries(LAYER_TO_TYPE)) {
    if (incType === type) return activeLayerIds.value.has(layerId)
  }
  return true
}

function syncIncidentVisibility() {
  if (!map) return
  incidentMarkers.forEach(({ marker: m, type }) => {
    const el = m.getElement()
    if (el) el.style.display = isIncidentVisible(type) ? '' : 'none'
  })
}

function openIncidentPopover(markerEl: L.Marker, inc: { type: string; date: Date }) {
  if (!map) return
  if (!incidentPopoverAnchorEl.value) {
    incidentPopoverAnchorEl.value = createVirtualAnchor()
  }
  const point = map.latLngToContainerPoint(markerEl.getLatLng())
  incidentPopoverAnchorEl.value!.style.left = `${point.x}px`
  incidentPopoverAnchorEl.value!.style.top = `${point.y}px`
  activeIncident.value = inc
  incidentPopoverOpen.value = true
}

async function initMap() {
  if (!mapContainer.value) return

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  const center = isJammed.value
    ? jammingEvent.value!.lastKnownLocation
    : props.vehicle.currentLocation
  const { lat, lng } = center

  map = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: isJammed.value ? 12 : 13,
    zoomControl: false,
    attributionControl: false,
  })

  L.tileLayer(getTileUrl(), {
    maxZoom: 18,
    subdomains: 'abcd',
  }).addTo(map)

  if (isJammed.value) {
    initJammingLayers(L)
  } else {
    initNormalMarker(L)
  }

  map.on('move', () => {
    if (popoverOpen.value) {
      syncAnchorToMarker()
      popoverCompRef.value?.reposition()
    }
    if (incidentPopoverOpen.value && incidentPopoverAnchorEl.value) {
      incidentPopoverRef.value?.reposition()
    }
  })

  map.on('zoomstart', () => {
    popoverOpen.value = false
    incidentPopoverOpen.value = false
  })

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

function initNormalMarker(L: typeof import('leaflet')) {
  const { lat, lng } = props.vehicle.currentLocation
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
  marker = L.marker([lat, lng], { icon }).addTo(map!)
}

function initJammingLayers(L: typeof import('leaflet')) {
  const event = jammingEvent.value!
  const { lat, lng } = event.lastKnownLocation

  // Outer probability circle (dashed)
  searchCircle = L.circle([lat, lng], {
    radius: searchRadiusMeters.value,
    color: 'rgba(248, 113, 113, 0.3)',
    fillColor: 'rgba(248, 113, 113, 0.04)',
    fillOpacity: 1,
    weight: 1.5,
    dashArray: '8, 6',
  }).addTo(map!)

  // Directional sector polygon
  sectorPolygon = L.polygon(sectorPoints.value as L.LatLngExpression[], {
    color: 'rgba(248, 113, 113, 0.6)',
    fillColor: 'rgba(248, 113, 113, 0.12)',
    fillOpacity: 1,
    weight: 1,
  }).addTo(map!)

  // Heading arrow line
  const arrowEnd = destinationPoint(lat, lng, event.lastKnownHeading, 400)
  headingLine = L.polyline(
    [
      [lat, lng],
      [arrowEnd.lat, arrowEnd.lng],
    ],
    {
      color: '#fbbf24',
      weight: 3,
      opacity: 0.8,
    },
  ).addTo(map!)

  // Arrow tip marker
  const arrowIcon = L.divIcon({
    className: '',
    html: `<div style="
      width: 0; height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 12px solid #fbbf24;
      transform: rotate(${event.lastKnownHeading}deg);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
  headingArrow = L.marker([arrowEnd.lat, arrowEnd.lng], { icon: arrowIcon }).addTo(map!)

  // Last known location marker (red pulsing)
  const jammedIcon = L.divIcon({
    className: '',
    html: `<div class="jammed-marker">
      <div class="jammed-marker__ring"></div>
      <div class="jammed-marker__dot">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M2 12 L22 12 M12 2 L12 22" transform="rotate(45 12 12)"/>
          <circle cx="12" cy="12" r="8"/>
        </svg>
      </div>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
  marker = L.marker([lat, lng], { icon: jammedIcon }).addTo(map!)
  marker.on('click', () => {
    if (!popoverAnchorEl.value) {
      popoverAnchorEl.value = createVirtualAnchor()
    }
    syncAnchorToMarker()
    popoverOpen.value = true
  })

  // Prior incident markers
  event.priorIncidents.forEach((inc) => {
    const hex = INCIDENT_HEX[inc.type] ?? '#fbbf24'
    const incIcon = L.divIcon({
      className: '',
      html: `<div style="
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        background: ${hex}33;
        border: 1.5px solid ${hex};
        border-radius: 4px;
      "><svg width="12" height="12" viewBox="0 0 24 24" fill="${hex}" stroke="none">
        <path d="M12 2L2 22h20L12 2zm0 6v6m0 2v2"/>
      </svg></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
    const m = L.marker([inc.location.lat, inc.location.lng], { icon: incIcon }).addTo(map!)
    m.on('mouseover', () => openIncidentPopover(m, inc))
    m.on('mouseout', () => {
      incidentPopoverOpen.value = false
    })
    incidentMarkers.push({ marker: m, type: inc.type })
  })
}

// Update layers each second as radius grows
watch(searchRadiusMeters, (radius) => {
  if (!isJammed.value || !map) return
  const event = jammingEvent.value!
  if (searchCircle) searchCircle.setRadius(radius)
  if (sectorPolygon) sectorPolygon.setLatLngs(sectorPoints.value as L.LatLngExpression[])

  // Update heading arrow to grow slightly with radius
  const arrowDist = Math.min(radius * 0.15, 800)
  const arrowEnd = destinationPoint(
    event.lastKnownLocation.lat,
    event.lastKnownLocation.lng,
    event.lastKnownHeading,
    arrowDist,
  )
  if (headingLine) {
    headingLine.setLatLngs([
      [event.lastKnownLocation.lat, event.lastKnownLocation.lng],
      [arrowEnd.lat, arrowEnd.lng],
    ])
  }
  if (headingArrow) headingArrow.setLatLng([arrowEnd.lat, arrowEnd.lng])
})

onMounted(initMap)

onUnmounted(() => {
  if (popoverAnchorEl.value) {
    popoverAnchorEl.value.remove()
    popoverAnchorEl.value = null
  }
  if (incidentPopoverAnchorEl.value) {
    incidentPopoverAnchorEl.value.remove()
    incidentPopoverAnchorEl.value = null
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="vehicle-live">
    <!-- Status Panel (docked left) -->
    <aside class="vehicle-live__panel">
      <!-- Status -->
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

      <!-- Telematics -->
      <div class="vehicle-live__card">
        <div class="vehicle-live__card-header">
          <div class="vehicle-live__card-header-left">
            <span class="vehicle-live__card-title">Telematics</span>
            <span class="vehicle-live__card-meta">23d ago</span>
          </div>
          <div class="vehicle-live__card-header-right">
            <MIcon :icon="Thermometer" :size="16" class="vehicle-live__card-icon--danger" />
          </div>
        </div>

        <div class="vehicle-live__card-body">
          <div class="vehicle-live__metrics">
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">FUEL</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">DEF</span>
              <span class="vehicle-live__metric-value">9%</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">ENGINE LOAD</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
          </div>

          <div v-if="telematicsExpanded" class="vehicle-live__metrics">
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">COOLANT</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">OIL PRESS</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">12V BATTERY</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
          </div>
          <div v-if="telematicsExpanded" class="vehicle-live__metrics">
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">AIR TEMP</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">BAROMETRIC</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">INTAKE TEMP</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
          </div>

          <button class="vehicle-live__show-more" @click="telematicsExpanded = !telematicsExpanded">
            {{ telematicsExpanded ? 'SHOW LESS' : 'SHOW MORE' }}
            <MIcon :icon="telematicsExpanded ? ChevronDown : ChevronDown" :size="12" />
          </button>
        </div>
      </div>

      <!-- Engine Immobilizer (collapsible) -->
      <div v-if="isJammed" class="vehicle-live__card">
        <button
          class="vehicle-live__card-header"
          @click="immobilizerExpanded = !immobilizerExpanded"
        >
          <div class="vehicle-live__card-header-left">
            <span class="vehicle-live__card-title">Engine Immobilizer</span>
            <span class="vehicle-live__card-meta">{{ formatElapsed(elapsedSeconds) }}</span>
          </div>
          <div class="vehicle-live__card-header-right">
            <MBadge label="Activated" color="danger" size="sm" />
            <MIcon
              :icon="immobilizerExpanded ? ChevronDown : ChevronRight"
              :size="14"
              class="vehicle-live__card-chevron"
            />
          </div>
        </button>

        <div v-if="immobilizerExpanded" class="vehicle-live__card-body">
          <div class="vehicle-live__metrics">
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">GPS</span>
              <span class="vehicle-live__metric-value vehicle-live__danger">Jammed</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">CELLULAR</span>
              <span class="vehicle-live__metric-value vehicle-live__danger">Jammed</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">JAMMING</span>
              <span class="vehicle-live__metric-value vehicle-live__danger">Detected</span>
            </div>
          </div>
          <div class="vehicle-live__metrics">
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">BATTERY</span>
              <span class="vehicle-live__metric-value">94%</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">RELAY</span>
              <span class="vehicle-live__metric-value vehicle-live__danger">Engaged</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">TAMPER</span>
              <span class="vehicle-live__metric-value">Clear</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TPMS (collapsible) -->
      <div class="vehicle-live__card">
        <button class="vehicle-live__card-header" @click="tpmsExpanded = !tpmsExpanded">
          <div class="vehicle-live__card-header-left">
            <span class="vehicle-live__card-title">TPMS</span>
            <span class="vehicle-live__card-meta">0/10 tires</span>
          </div>
          <div class="vehicle-live__card-header-right">
            <MBadge label="Critical" color="danger" size="sm" />
            <MIcon
              :icon="tpmsExpanded ? ChevronDown : ChevronRight"
              :size="14"
              class="vehicle-live__card-chevron"
            />
          </div>
        </button>

        <div v-if="tpmsExpanded" class="vehicle-live__card-body">
          <div class="vehicle-live__metrics">
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">FRONT L</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">FRONT R</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
            <div class="vehicle-live__metric">
              <span class="vehicle-live__metric-label">REAR L</span>
              <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Location -->
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

      <!-- Vehicle Info -->
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
        </dl>
      </div>

      <!-- Assigned Driver -->
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

      <!-- Attached Asset -->
      <div v-if="vehicle.assetName" class="vehicle-live__section">
        <h3 class="vehicle-live__section-title">Attached Asset</h3>
        <dl class="vehicle-live__dl">
          <dt>Asset</dt>
          <dd>{{ vehicle.assetName }}</dd>
        </dl>
      </div>

      <!-- Equipment -->
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

    <!-- Map -->
    <div class="vehicle-live__map-wrap">
      <div ref="mapContainer" class="vehicle-live__map" />

      <MMapControls
        :layers="incidentLayers"
        :active-layers="activeLayerIds"
        @zoom-in="map?.zoomIn()"
        @zoom-out="map?.zoomOut()"
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
          @mark-incident="handleMarkIncident"
          @broadcast-incident="handleBroadcastIncident"
          @notify-online="handleNotifyOnline"
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

.vehicle-live__panel {
  width: 400px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background-color: var(--mtv-color-surface-base);
  border-right: 1px solid var(--mtv-color-border-default);
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

/* Collapsible card sections */
.vehicle-live__card {
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 8px;
  overflow: hidden;
}

.vehicle-live__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  gap: 0.5rem;
}

.vehicle-live__card-header:hover {
  background: var(--mtv-color-surface-hover);
}

.vehicle-live__card-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.vehicle-live__card-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.vehicle-live__card-icon {
  color: var(--mtv-color-foreground-muted);
  flex-shrink: 0;
}

.vehicle-live__card-icon--danger {
  color: var(--mtv-color-status-critical);
  flex-shrink: 0;
}

.vehicle-live__card-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
  white-space: nowrap;
}

.vehicle-live__card-meta {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  white-space: nowrap;
}

.vehicle-live__card-chevron {
  color: var(--mtv-color-foreground-muted);
}

.vehicle-live__card-body {
  padding: 0 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.vehicle-live__show-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  border-top: 1px solid var(--mtv-color-border-default);
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--mtv-color-foreground-muted);
  transition: color 150ms ease;
}

.vehicle-live__show-more:hover {
  color: var(--mtv-color-foreground-default);
}

.vehicle-live__card-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-top: 1px solid var(--mtv-color-border-default);
}

.vehicle-live__card-row-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.vehicle-live__card-row-value {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  flex: 1;
}

/* Metrics grid (like the FUEL / DEF / ENGINE LOAD row) */
.vehicle-live__metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  padding: 0.5rem 0;
  border-top: 1px solid var(--mtv-color-border-default);
}

.vehicle-live__metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.vehicle-live__metric-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
}

.vehicle-live__metric-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

/* Standard sections */
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
  display: flex;
  align-items: center;
  gap: 0.375rem;
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

.vehicle-live__muted {
  color: var(--mtv-color-foreground-muted);
}

.vehicle-live__mono {
  font-family: var(--font-family-mono);
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
  border: 2px solid #f87171;
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
  background: #f87171;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
