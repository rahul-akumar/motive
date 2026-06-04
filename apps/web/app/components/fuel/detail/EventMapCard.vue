<script setup lang="ts">
import { MButton } from '@motive/ui'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null

const LIGHT_THEMES = new Set(['light', 'console-legacy'])
function isDarkTheme(): boolean {
  if (!import.meta.client) return true
  return !LIGHT_THEMES.has(document.documentElement.getAttribute('data-theme') ?? '')
}

const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

async function initMap() {
  if (!import.meta.client || !mapContainer.value) return
  const L = (await import('leaflet')).default

  const lat = props.event.locationLat
  const lng = props.event.locationLng

  map = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: 15,
    zoomControl: true,
    attributionControl: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
  })

  const tileUrl = isDarkTheme() ? TILE_DARK : TILE_LIGHT
  L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map)

  // Marker with dark tooltip
  const marker = L.marker([lat, lng]).addTo(map)
  marker
    .bindPopup(
      `<div style="font-size:12px;line-height:1.4;">
        <strong>${props.event.location}</strong>
        <br/><span style="opacity:0.7">DRIVER</span><br/>${props.event.driverName ?? '—'}
        <br/><span style="opacity:0.7">TOTAL IDLING</span><br/>${formatDuration(props.event.durationMins ?? 0)}
      </div>`,
      { className: 'event-map-popup' },
    )
    .openPopup()
}

function formatDuration(mins: number): string {
  const m = Math.floor(mins)
  const s = Math.round((mins - m) * 60)
  return `${m}m ${s}s`
}

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
    <div ref="mapContainer" class="event-map-card__map" />
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

.event-map-card__map {
  width: 100%;
  height: 100%;
  min-height: 600px;
  flex: 1;
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
</style>

<style>
/* Global popup style — always dark regardless of theme (Leaflet HTML injection) */
.event-map-popup .leaflet-popup-content-wrapper {
  background: oklch(0.2 0 0);
  color: oklch(0.95 0 0);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  box-shadow: 0 2px 8px oklch(0 0 0 / 0.4);
}

.event-map-popup .leaflet-popup-tip {
  background: oklch(0.2 0 0);
}
</style>
