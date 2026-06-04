<script setup lang="ts">
import { MMapControls, MPopover } from '@motive/ui'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

const mapContainer = ref<HTMLElement | null>(null)
const markerEl = ref<HTMLElement | null>(null)
const popoverRef = ref<InstanceType<typeof MPopover> | null>(null)
const popoverOpen = ref(false)
let map: any = null

const LIGHT_THEMES = new Set(['light', 'console-legacy'])
function isDarkTheme(): boolean {
  if (!import.meta.client) return true
  return !LIGHT_THEMES.has(document.documentElement.getAttribute('data-theme') ?? '')
}

const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

function handleZoomIn() {
  map?.zoomIn()
}

function handleZoomOut() {
  map?.zoomOut()
}

function handleRecenter() {
  if (!map) return
  const lat = props.event.locationLat
  const lng = props.event.locationLng
  map.setView([lat, lng], 15)
}

function updateMarkerPosition() {
  if (!map || !markerEl.value) return
  const lat = props.event.locationLat
  const lng = props.event.locationLng
  const point = map.latLngToContainerPoint([lat, lng])
  markerEl.value.style.left = `${point.x}px`
  markerEl.value.style.top = `${point.y}px`
  // Reposition the popover after marker moves
  nextTick(() => popoverRef.value?.reposition())
}

async function initMap() {
  if (!import.meta.client || !mapContainer.value) return
  const L = (await import('leaflet')).default

  const lat = props.event.locationLat
  const lng = props.event.locationLng

  map = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: 15,
    zoomControl: false,
    attributionControl: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
  })

  const tileUrl = isDarkTheme() ? TILE_DARK : TILE_LIGHT
  L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map)

  // Use a custom div marker so we can anchor the popover to it
  const icon = L.divIcon({
    className: 'event-map-marker',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
  L.marker([lat, lng], { icon }).addTo(map)

  // Track marker screen position for popover anchor
  map.on('move zoom moveend zoomend', updateMarkerPosition)
  nextTick(() => {
    updateMarkerPosition()
    // Open popover after marker is positioned
    popoverOpen.value = true
  })
}

function formatDuration(mins: number): string {
  const m = Math.floor(mins)
  const s = Math.round((mins - m) * 60)
  return `${m}m ${s}s`
}

const eventLabel = computed(() => {
  if (props.event.type === 'idling') {
    return formatDuration(props.event.durationMins ?? 0)
  }
  return props.event.fuelDrop ? `${props.event.fuelDrop} gal drop` : '—'
})

onMounted(() => initMap())

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(
  () => `${props.event.locationLat},${props.event.locationLng}`,
  () => {
    if (map) {
      map.remove()
      map = null
    }
    nextTick(() => initMap())
  },
)
</script>

<template>
  <div class="event-map-card">
    <div class="event-map-card__map-wrap">
      <div ref="mapContainer" class="event-map-card__map" />

      <!-- Invisible anchor element tracking marker screen position -->
      <div ref="markerEl" class="event-map-card__marker-anchor" />

      <!-- MPopover pinned to marker -->
      <MPopover
        ref="popoverRef"
        :open="popoverOpen"
        :anchor-el="markerEl"
        placement="top"
        :arrow="true"
        :offset="10"
        :persistent="true"
        max-width="220px"
        @update:open="popoverOpen = $event"
      >
        <div class="event-map-card__popover">
          <strong class="event-map-card__popover-location">{{ event.location }}</strong>
          <div class="event-map-card__popover-row">
            <span class="event-map-card__popover-label">DRIVER</span>
            <span>{{ event.driverName ?? '—' }}</span>
          </div>
          <div class="event-map-card__popover-row">
            <span class="event-map-card__popover-label">{{
              event.type === 'idling' ? 'TOTAL IDLING' : 'FUEL DROP'
            }}</span>
            <span>{{ eventLabel }}</span>
          </div>
        </div>
      </MPopover>

      <!-- MMapControls for zoom + recenter -->
      <MMapControls
        :show-fit-all="true"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @fit-all="handleRecenter"
      />
    </div>
    <div class="event-map-card__footer">
      <NuxtLinkLocale
        :to="`/fleet/vehicles/${event.vehicleId}/history`"
        class="event-map-card__link"
      >
        View vehicle history
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<style scoped>
.event-map-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--mtv-color-surface-base);
  flex: 1;
  min-height: 0;
}

.event-map-card__map-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}

.event-map-card__map {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.event-map-card__marker-anchor {
  position: absolute;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 500;
}

.event-map-card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--mtv-color-border-default);
}

.event-map-card__link {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-brand-default);
  text-decoration: none;
  font-weight: 500;
}

.event-map-card__link:hover {
  text-decoration: underline;
}

/* Popover content */
.event-map-card__popover {
  padding: 0.625rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: var(--font-size-xs);
  line-height: 1.4;
}

.event-map-card__popover-location {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.event-map-card__popover-row {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.event-map-card__popover-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--mtv-color-foreground-muted);
}
</style>

<style>
/* Custom marker dot */
.event-map-marker {
  background: var(--mtv-color-brand-default, #1b4dff);
  border: 2px solid oklch(0.95 0 0);
  border-radius: 50%;
  box-shadow: 0 2px 6px oklch(0 0 0 / 0.3);
}
</style>
