<script setup lang="ts">
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null

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
    zoom: 14,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    boxZoom: false,
    keyboard: false,
  })

  const tileUrl = isDarkTheme() ? TILE_DARK : TILE_LIGHT
  L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map)

  L.circleMarker([lat, lng], {
    radius: 7,
    fillColor: '#ef4444',
    fillOpacity: 0.9,
    color: '#fff',
    weight: 2,
  }).addTo(map)
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// Re-init if event location changes
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
  <div class="drawer-map">
    <div ref="mapContainer" class="drawer-map__leaflet" />
    <div class="drawer-map__address">
      {{ event.location }}
    </div>
  </div>
</template>

<style scoped>
.drawer-map {
  padding: 0.75rem;
  background: var(--mtv-color-surface-sunken);
  border-radius: var(--radius);
}

.drawer-map__leaflet {
  width: 100%;
  height: 180px;
  border-radius: var(--radius);
  overflow: hidden;
}

.drawer-map__address {
  margin-top: 0.5rem;
  padding: 0.5rem 0.625rem;
  background: var(--mtv-color-surface-raised);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}
</style>
