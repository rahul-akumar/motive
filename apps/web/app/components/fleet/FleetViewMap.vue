<script setup lang="ts">
import L from 'leaflet'
import type { Driver, DriverStatus, FuelLossEvent } from '@motive/shared'

const props = defineProps<{
  drivers: Driver[]
  selectedDriverId: string | null
  fitAllTrigger: number
  overlays: Array<{ id: string; tileUrl: string; opacity: number; zIndex: number }>
  fuelLossEvents?: FuelLossEvent[]
}>()

const emit = defineEmits<{
  selectDriver: [id: string | null]
  hoverDriver: [id: string | null]
}>()

// ── Theme detection ───────────────────────────────────────────
const LIGHT_THEMES = new Set(['light', 'console-legacy'])

function isDarkTheme(): boolean {
  if (!import.meta.client) return true
  return !LIGHT_THEMES.has(document.documentElement.getAttribute('data-theme') ?? '')
}

const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

// ── Status colors ─────────────────────────────────────────────
// CANVAS-COLORS: Keep as hex. Leaflet DivIcon HTML strings and paint expressions; oklch is not supported.
const STATUS_COLORS: Record<DriverStatus, string> = {
  driving: '#4ade80',
  idle: '#fbbf24',
  alert: '#f87171',
  offline: '#525252',
  sleeper: '#a78bfa',
}

// ── Map instance ──────────────────────────────────────────────
const mapRef = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let tileLayer: L.TileLayer | null = null
const markers = new Map<string, L.Marker>()
const overlayLayers = new Map<string, L.TileLayer>()

function getTileUrl(): string {
  return isDarkTheme() ? TILE_DARK : TILE_LIGHT
}

function createMarkerIcon(driver: Driver, isSelected: boolean, hasFuelLoss: boolean): L.DivIcon {
  const color = hasFuelLoss ? STATUS_COLORS.alert : STATUS_COLORS[driver.status]
  const size = isSelected ? 36 : 28
  const borderWidth = isSelected ? 3 : 2
  const borderColor = isSelected ? '#ffffff' : 'rgba(0,0,0,0.5)'
  const pulseRing =
    hasFuelLoss || driver.status === 'alert'
      ? `<div class="fv-marker-ring" style="border-color:${color}"></div>`
      : ''

  return L.divIcon({
    className: '',
    html: `
      <div class="fv-marker-wrap" style="width:${size}px;height:${size}px">
        ${pulseRing}
        <div class="fv-marker-dot" style="
          width:${size}px;
          height:${size}px;
          background:${color};
          border:${borderWidth}px solid ${borderColor};
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>
        <div class="fv-marker-initials" style="font-size:${isSelected ? 10 : 8}px">${driver.initials}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

function createPopupContent(driver: Driver, fuelLoss?: FuelLossEvent): string {
  const color = fuelLoss ? STATUS_COLORS.alert : STATUS_COLORS[driver.status]
  const statusLabel = fuelLoss ? 'FUEL LOSS' : driver.status.toUpperCase()
  const hosText = driver.hos.hasViolation
    ? '<span style="color:#f87171">HOS Violation</span>'
    : `<span style="color:#4ade80">${driver.hos.drivingRemaining.toFixed(1)}h drive left</span>`
  const loadText = driver.currentLoad
    ? `<div style="color:#94a3b8;font-size:10px;margin-top:2px">${driver.currentLoad}</div>`
    : ''
  const etaText = driver.etaNextStop
    ? `<div style="color:#94a3b8;font-size:10px">ETA ${driver.etaNextStop}</div>`
    : ''
  const fuelLossText = fuelLoss
    ? `<div style="color:${STATUS_COLORS.alert};font-size:10px;margin-top:4px">&minus;${fuelLoss.fuelDrop}% fuel &middot; ${timeAgo(fuelLoss.startTime)}</div>`
    : ''

  return `
    <div class="fv-popup">
      <div class="fv-popup__name">${driver.name}</div>
      <div class="fv-popup__status" style="color:${color}">${statusLabel}</div>
      <div class="fv-popup__location">${driver.currentLocation.city}, ${driver.currentLocation.state}</div>
      ${loadText}
      ${etaText}
      <div class="fv-popup__hos">${hosText}</div>
      ${fuelLossText}
    </div>
  `
}

function addOrUpdateMarker(driver: Driver, fuelLoss?: FuelLossEvent) {
  if (!map) return
  const isSelected = driver.id === props.selectedDriverId
  const icon = createMarkerIcon(driver, isSelected, !!fuelLoss)
  const latlng: L.LatLngExpression = [driver.currentLocation.lat, driver.currentLocation.lng]

  if (markers.has(driver.id)) {
    const marker = markers.get(driver.id)!
    marker.setLatLng(latlng)
    marker.setIcon(icon)
    marker.getPopup()?.setContent(createPopupContent(driver, fuelLoss))
  } else {
    const marker = L.marker(latlng, { icon })
    marker.bindPopup(createPopupContent(driver, fuelLoss), {
      closeButton: false,
      className: 'fv-leaflet-popup',
      offset: [0, -4],
    })
    marker.on('mouseover', () => {
      marker.openPopup()
      emit('hoverDriver', driver.id)
    })
    marker.on('mouseout', () => {
      marker.closePopup()
      emit('hoverDriver', null)
    })
    marker.on('click', () => {
      emit('selectDriver', driver.id === props.selectedDriverId ? null : driver.id)
    })
    marker.addTo(map)
    markers.set(driver.id, marker)
  }
}

function removeStaleMarkers(currentIds: Set<string>) {
  for (const [id, marker] of markers) {
    if (!currentIds.has(id)) {
      marker.remove()
      markers.delete(id)
    }
  }
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function syncMarkers() {
  const fuelByVehicle = new Map<string, FuelLossEvent>(
    (props.fuelLossEvents ?? []).map((e) => [e.vehicleId, e]),
  )
  const currentIds = new Set(props.drivers.map((d) => d.id))
  removeStaleMarkers(currentIds)
  for (const driver of props.drivers) {
    addOrUpdateMarker(driver, fuelByVehicle.get(driver.vehicleId))
  }
}

function fitAllBounds() {
  if (!map || props.drivers.length === 0) return
  const bounds = L.latLngBounds(
    props.drivers.map((d) => [d.currentLocation.lat, d.currentLocation.lng] as L.LatLngExpression),
  )
  map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 })
}

function updateTileLayer() {
  if (!map) return
  if (tileLayer) {
    tileLayer.setUrl(getTileUrl())
  }
  // Re-apply incident overlay URLs when theme changes (s1 vs s2 style)
  syncOverlays(props.overlays)
}

function syncOverlays(overlays: typeof props.overlays) {
  if (!map) return
  const incomingIds = new Set(overlays.map((o) => o.id))

  // Remove layers no longer active
  for (const [id, layer] of overlayLayers) {
    if (!incomingIds.has(id)) {
      layer.remove()
      overlayLayers.delete(id)
    }
  }

  // Add or update layers
  for (const overlay of overlays) {
    if (overlayLayers.has(overlay.id)) {
      overlayLayers.get(overlay.id)!.setUrl(overlay.tileUrl)
    } else {
      const layer = L.tileLayer(overlay.tileUrl, {
        opacity: overlay.opacity,
        zIndex: overlay.zIndex,
        maxZoom: 19,
      }).addTo(map)
      overlayLayers.set(overlay.id, layer)
    }
  }
}

onMounted(() => {
  if (!mapRef.value) return

  map = L.map(mapRef.value, {
    center: [39.5, -98.35],
    zoom: 4,
    zoomControl: false, // we use custom controls
    attributionControl: true,
  })

  tileLayer = L.tileLayer(getTileUrl(), {
    attribution: TILE_ATTRIBUTION,
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map)

  syncMarkers()
  fitAllBounds()

  // Watch theme changes
  const themeObserver = new MutationObserver(updateTileLayer)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  onUnmounted(() => themeObserver.disconnect())

  // Notify Leaflet when the container resizes (e.g. window resize or panel open/close)
  const resizeObserver = new ResizeObserver(() => {
    map?.invalidateSize()
  })
  resizeObserver.observe(mapRef.value)
  onUnmounted(() => resizeObserver.disconnect())
})

onUnmounted(() => {
  overlayLayers.clear()
  map?.remove()
  map = null
})

// Reactive watchers
watch(() => props.overlays, syncOverlays, { deep: true })
watch(() => props.drivers, syncMarkers, { deep: true })
watch(() => props.fuelLossEvents, syncMarkers, { deep: true })

watch(
  () => props.selectedDriverId,
  () => syncMarkers(),
)

watch(
  () => props.fitAllTrigger,
  (val, old) => {
    if (val !== old) fitAllBounds()
  },
)

// Expose map zoom methods for controls
function zoomIn() {
  map?.zoomIn()
}
function zoomOut() {
  map?.zoomOut()
}

defineExpose({ zoomIn, zoomOut, fitAllBounds })
</script>

<template>
  <div
    ref="mapRef"
    class="fv-map"
    aria-label="Live fleet map showing truck positions and fuel theft events"
    role="img"
  />
</template>

<style>
/* Global styles needed for Leaflet DivIcon and popup — cannot be scoped */

.fv-map {
  width: 100%;
  height: 100%;
  background: var(--mtv-color-surface-base);
}

/* Marker wrapper */
.fv-marker-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fv-marker-dot {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  transition: transform 150ms ease;
}

.fv-marker-initials {
  position: absolute;
  color: oklch(0 0 0 / 0.75);
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
  pointer-events: none;
  z-index: 1;
  line-height: var(--leading-none);
}

/* Alert pulse ring */
.fv-marker-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid;
  animation: fv-ring-pulse 1.6s ease-out infinite;
  pointer-events: none;
}

@keyframes fv-ring-pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Leaflet popup override */
.fv-leaflet-popup .leaflet-popup-content-wrapper {
  background: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-strong);
  border-radius: 2px;
  box-shadow: 0 8px 24px oklch(0 0 0 / 0.5);
  padding: 0;
}

.fv-leaflet-popup .leaflet-popup-content {
  margin: 0;
  padding: 0;
}

.fv-leaflet-popup .leaflet-popup-tip-container {
  display: none;
}

.fv-popup {
  padding: 10px 12px;
  min-width: 150px;
}

.fv-popup__name {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  margin-bottom: 2px;
}

.fv-popup__status {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-loose);
  margin-bottom: 4px;
}

.fv-popup__location {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  margin-bottom: 2px;
}

.fv-popup__hos {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  margin-top: 4px;
}

/* Override Leaflet attribution */
.leaflet-control-attribution {
  font-size: 9px !important;
  background: oklch(0 0 0 / 0.5) !important;
  color: oklch(1 0 0 / 0.4) !important;
  border-radius: 2px 0 0 0 !important;
}

.leaflet-control-attribution a {
  color: oklch(1 0 0 / 0.5) !important;
}
</style>
