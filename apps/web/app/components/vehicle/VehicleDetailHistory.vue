<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { MIcon, MPopover } from '@motive/ui'
import type { FleetVehicle, FleetDriver, SignalEventPhase } from '@motive/shared'
import { useVehicleSecurityData } from '~/composables/useVehicleSecurityData'
import MapMarkerPopover from '~/components/vehicle/MapMarkerPopover.vue'

const props = defineProps<{
  vehicle: FleetVehicle
  driver?: FleetDriver
}>()

const vehicleId = computed(() => props.vehicle.id)
const { jammingEvent, timeline } = useVehicleSecurityData(vehicleId)

const searchQuery = ref('')

interface TimelineDisplayEntry {
  id: string
  phase: SignalEventPhase
  timestamp: Date
  description: string
  signalStrength?: number
  location?: { lat: number; lng: number }
}

const allEntries = computed<TimelineDisplayEntry[]>(() => {
  return timeline.value.map((entry) => ({
    id: `tl-${entry.phase}-${entry.timestamp.getTime()}`,
    phase: entry.phase,
    timestamp: entry.timestamp,
    description: entry.description,
    signalStrength: entry.signalStrength,
    location: entry.location ?? jammingEvent.value?.lastKnownLocation,
  }))
})

const filteredEntries = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return allEntries.value
  return allEntries.value.filter(
    (e) => e.description.toLowerCase().includes(q) || e.phase.toLowerCase().includes(q),
  )
})

const PHASE_COLORS: Record<string, string> = {
  normal: 'var(--mtv-color-status-success)',
  degraded: 'var(--mtv-color-status-warning)',
  jammed: 'var(--mtv-color-status-critical)',
  'immobilizer-armed': 'var(--mtv-color-status-warning)',
  'immobilizer-activated': 'var(--mtv-color-status-critical)',
  recovered: 'var(--mtv-color-status-success)',
}

const PHASE_LABELS: Record<string, string> = {
  normal: 'Normal',
  degraded: 'Degraded',
  jammed: 'Jammed',
  'immobilizer-armed': 'Immobilizer Armed',
  'immobilizer-activated': 'Immobilizer Activated',
  recovered: 'Recovered',
}

const { formatTime, formatDate } = useFormatters()

// ── Map ─────────────────────────────────────────────────────────────────────

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
const markers: L.Marker[] = []

const timelinePopoverOpen = ref(false)
const timelinePopoverAnchorEl = ref<HTMLElement | null>(null)
const timelinePopoverRef = ref<InstanceType<typeof MPopover> | null>(null)
const activeTimelineEntry = ref<TimelineDisplayEntry | null>(null)

const PHASE_BADGE_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  normal: 'success',
  degraded: 'warning',
  jammed: 'danger',
  'immobilizer-armed': 'warning',
  'immobilizer-activated': 'danger',
  recovered: 'success',
}

function createVirtualAnchor(): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;'
  mapContainer.value!.appendChild(el)
  return el
}

function openTimelinePopover(markerEl: L.Marker, entry: TimelineDisplayEntry) {
  if (!map) return
  if (!timelinePopoverAnchorEl.value) {
    timelinePopoverAnchorEl.value = createVirtualAnchor()
  }
  const point = map.latLngToContainerPoint(markerEl.getLatLng())
  timelinePopoverAnchorEl.value!.style.left = `${point.x}px`
  timelinePopoverAnchorEl.value!.style.top = `${point.y}px`
  activeTimelineEntry.value = entry
  timelinePopoverOpen.value = true
}

function getTileUrl(): string {
  return isDarkTheme()
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
}

// Re-skin map tiles when the theme changes
useThemeObserver(() => {
  if (!map) return
  map.eachLayer((layer) => {
    if ((layer as L.TileLayer).setUrl) {
      ;(layer as L.TileLayer).setUrl(getTileUrl())
    }
  })
})

async function initMap() {
  if (!mapContainer.value) return

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  const { lat, lng } = props.vehicle.currentLocation

  map = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: 12,
    zoomControl: false,
    attributionControl: false,
  })

  L.tileLayer(getTileUrl(), {
    maxZoom: 18,
    subdomains: 'abcd',
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  addMarkers(L)

  map.on('move', () => {
    if (timelinePopoverOpen.value) {
      timelinePopoverRef.value?.reposition()
    }
  })

  map.on('zoomstart', () => {
    timelinePopoverOpen.value = false
  })
}

function addMarkers(L: typeof import('leaflet')) {
  const entries = allEntries.value
  if (entries.length === 0) return

  const { readCSSColor } = useCssColors()
  const markerBorder = readCSSColor('--mtv-color-foreground-default', '#ffffff')

  // Draw route polyline connecting all timeline points
  const routeCoords = entries
    .filter((e) => e.location)
    .map((e) => [e.location!.lat, e.location!.lng] as [number, number])

  if (routeCoords.length > 1) {
    L.polyline(routeCoords, {
      color: 'rgba(148, 163, 184, 0.6)',
      weight: 2,
      dashArray: '6, 4',
    }).addTo(map!)
  }

  // Add a marker for each timeline entry
  entries.forEach((entry) => {
    if (!entry.location) return
    const color = PHASE_COLORS[entry.phase] ?? 'var(--mtv-color-neutral-400)'
    const cssColor = color.startsWith('var(')
      ? getComputedStyle(document.documentElement).getPropertyValue(color.slice(4, -1)).trim() ||
        'rgb(148, 163, 184)'
      : color
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width: 14px; height: 14px;
        border-radius: 50%;
        background: ${cssColor};
        border: 2px solid ${markerBorder};
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })
    const m = L.marker([entry.location.lat, entry.location.lng], { icon }).addTo(map!)
    m.on('mouseover', () => openTimelinePopover(m, entry))
    m.on('mouseout', () => {
      timelinePopoverOpen.value = false
    })
    markers.push(m)
  })

  // Fit map to show all markers
  if (routeCoords.length > 1) {
    map!.fitBounds(L.latLngBounds(routeCoords.map(([lat, lng]) => [lat, lng])), {
      padding: [40, 40],
    })
  }
}

function panTo(entry: TimelineDisplayEntry) {
  if (!map || !entry.location) return
  map.panTo([entry.location.lat, entry.location.lng], { animate: true })
}

onMounted(initMap)

onUnmounted(() => {
  if (timelinePopoverAnchorEl.value) {
    timelinePopoverAnchorEl.value.remove()
    timelinePopoverAnchorEl.value = null
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="vehicle-history">
    <!-- Sidebar -->
    <aside class="vehicle-history__panel">
      <!-- Search -->
      <div class="vehicle-history__search">
        <MIcon :icon="Search" :size="14" class="vehicle-history__search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search events…"
          class="vehicle-history__search-input"
        />
      </div>

      <!-- Timeline -->
      <div v-if="filteredEntries.length > 0" class="vehicle-history__timeline">
        <button
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="vehicle-history__entry"
          @click="panTo(entry)"
        >
          <div
            class="vehicle-history__entry-dot"
            :style="{ backgroundColor: PHASE_COLORS[entry.phase] }"
          />
          <div class="vehicle-history__entry-content">
            <div class="vehicle-history__entry-header">
              <span class="vehicle-history__entry-phase">{{ PHASE_LABELS[entry.phase] }}</span>
              <span class="vehicle-history__entry-time">{{ formatTime(entry.timestamp) }}</span>
            </div>
            <p class="vehicle-history__entry-desc">{{ entry.description }}</p>
            <div class="vehicle-history__entry-meta">
              <span class="vehicle-history__entry-date">{{ formatDate(entry.timestamp) }}</span>
              <span v-if="entry.signalStrength != null" class="vehicle-history__entry-signal">
                Signal: {{ entry.signalStrength }}%
              </span>
            </div>
          </div>
        </button>
      </div>

      <!-- Empty -->
      <div v-else class="vehicle-history__empty">
        <p v-if="searchQuery">No events matching "{{ searchQuery }}"</p>
        <p v-else>No incident history for this vehicle.</p>
      </div>
    </aside>

    <!-- Map -->
    <div ref="mapContainer" class="vehicle-history__map" />

    <!-- Timeline Event Popover -->
    <MPopover
      ref="timelinePopoverRef"
      v-model:open="timelinePopoverOpen"
      :anchor-el="timelinePopoverAnchorEl"
      placement="top"
      :arrow="true"
      aria-label="Timeline event details"
    >
      <MapMarkerPopover
        v-if="activeTimelineEntry"
        :title="PHASE_LABELS[activeTimelineEntry.phase] ?? activeTimelineEntry.phase"
        :description="activeTimelineEntry.description"
        :timestamp="activeTimelineEntry.timestamp"
        :signal-strength="activeTimelineEntry.signalStrength"
        :badge-label="PHASE_LABELS[activeTimelineEntry.phase]"
        :badge-color="PHASE_BADGE_COLORS[activeTimelineEntry.phase] ?? 'default'"
      />
    </MPopover>
  </div>
</template>

<style scoped>
.vehicle-history {
  position: absolute;
  inset: 0;
  display: flex;
  overflow: hidden;
}

.vehicle-history__panel {
  width: 400px;
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: var(--mtv-color-surface-base);
  border-right: 1px solid var(--mtv-color-border-default);
}

.vehicle-history__map {
  flex: 1;
  min-width: 0;
  height: 100%;
}

/* Search */
.vehicle-history__search {
  position: sticky;
  top: 0;
  z-index: var(--mtv-z-sticky);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background-color: var(--mtv-color-surface-base);
  border-bottom: 1px solid var(--mtv-color-border-default);
}

.vehicle-history__search-icon {
  color: var(--mtv-color-foreground-muted);
  flex-shrink: 0;
}

.vehicle-history__search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
  outline: none;
}

.vehicle-history__search-input::placeholder {
  color: var(--mtv-color-foreground-subtle);
}

/* Timeline */
.vehicle-history__timeline {
  display: flex;
  flex-direction: column;
}

.vehicle-history__entry {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid var(--mtv-color-border-default);
  transition: background-color var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.vehicle-history__entry:hover {
  background-color: var(--mtv-color-surface-hover);
}

.vehicle-history__entry-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.vehicle-history__entry-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vehicle-history__entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.vehicle-history__entry-phase {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.vehicle-history__entry-time {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  white-space: nowrap;
}

.vehicle-history__entry-desc {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  line-height: 1.4;
  margin: 0;
}

.vehicle-history__entry-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.125rem;
}

.vehicle-history__entry-date {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
}

.vehicle-history__entry-signal {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
}

/* Empty */
.vehicle-history__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 3rem;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}
</style>
