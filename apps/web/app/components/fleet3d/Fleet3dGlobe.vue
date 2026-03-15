<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl from 'maplibre-gl'
import type { Driver } from '@motive/shared'

const STATUS_COLORS: Record<string, string> = {
  driving: '#4ade80',
  idle: '#fbbf24',
  alert: '#f87171',
  offline: '#525252',
  sleeper: '#a78bfa',
}

const props = defineProps<{
  drivers: Driver[]
  selectedDriverId: string | null
}>()

const emit = defineEmits<{
  selectDriver: [id: string | null]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let map: maplibregl.Map | null = null
let popup: maplibregl.Popup | null = null

function driversToGeoJSON(drivers: Driver[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: drivers.map((d) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.currentLocation.lng, d.currentLocation.lat] },
      properties: {
        id: d.id,
        name: d.name,
        status: d.status,
        city: d.currentLocation.city,
        state: d.currentLocation.state,
        hosViolation: d.hos.hasViolation,
        hosDrivingRemaining: d.hos.drivingRemaining,
        currentLoad: d.currentLoad ?? null,
        etaNextStop: d.etaNextStop ?? null,
      },
    })),
  }
}

function popupHTML(p: {
  name: string
  status: string
  city: string
  state: string
  hosViolation: boolean
  hosDrivingRemaining: number
  currentLoad: string | null
  etaNextStop: string | null
}): string {
  const statusColor = STATUS_COLORS[p.status] ?? '#525252'
  const hosText = p.hosViolation
    ? `<div class="f3d-popup__hos" style="color:#f87171">HOS Violation</div>`
    : `<div class="f3d-popup__hos" style="color:#4ade80">${p.hosDrivingRemaining.toFixed(1)}h drive left</div>`
  const loadText = p.currentLoad ? `<div class="f3d-popup__meta">${p.currentLoad}</div>` : ''
  const etaText = p.etaNextStop ? `<div class="f3d-popup__meta">ETA ${p.etaNextStop}</div>` : ''
  return `
    <div class="f3d-popup">
      <div class="f3d-popup__name">${p.name}</div>
      <div class="f3d-popup__status" style="color:${statusColor}">${p.status.toUpperCase()}</div>
      <div class="f3d-popup__location">${p.city}, ${p.state}</div>
      ${loadText}
      ${etaText}
      ${hosText}
    </div>
  `
}

function circleRadiusExpression(selectedId: string | null) {
  if (!selectedId) return 7
  return ['case', ['==', ['get', 'id'], selectedId], 11, 7] as maplibregl.ExpressionSpecification
}

onMounted(() => {
  if (!containerRef.value) return

  map = new maplibregl.Map({
    container: containerRef.value,
    style: {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        },
      },
      layers: [{ id: 'satellite', type: 'raster', source: 'esri-satellite' }],
    },
    center: [-98.35, 39.5],
    zoom: 3,
    canvasContextAttributes: { antialias: true },
  })

  popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    className: 'f3d-maplibre-popup',
  })

  map.on('load', () => {
    if (!map) return

    map.setProjection({ type: 'globe' })

    map.addSource('drivers', {
      type: 'geojson',
      data: driversToGeoJSON(props.drivers),
    })

    map.addLayer({
      id: 'drivers',
      type: 'circle',
      source: 'drivers',
      paint: {
        'circle-radius': circleRadiusExpression(props.selectedDriverId),
        'circle-color': [
          'match',
          ['get', 'status'],
          'driving',
          '#4ade80',
          'idle',
          '#fbbf24',
          'alert',
          '#f87171',
          'sleeper',
          '#a78bfa',
          '#525252',
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
      },
    })

    map.on('click', 'drivers', (e) => {
      const feature = e.features?.[0]
      if (!feature) return
      const id = feature.properties?.id as string
      emit('selectDriver', id === props.selectedDriverId ? null : id)
    })

    map.on('mouseenter', 'drivers', (e) => {
      if (!map || !popup) return
      map.getCanvas().style.cursor = 'pointer'
      const feature = e.features?.[0]
      if (!feature || feature.geometry.type !== 'Point') return
      const coords = feature.geometry.coordinates as [number, number]
      const p = feature.properties as {
        name: string
        status: string
        city: string
        state: string
        hosViolation: boolean
        hosDrivingRemaining: number
        currentLoad: string | null
        etaNextStop: string | null
      }
      popup.setLngLat(coords).setHTML(popupHTML(p)).addTo(map)
    })

    map.on('mouseleave', 'drivers', () => {
      if (!map || !popup) return
      map.getCanvas().style.cursor = ''
      popup.remove()
    })
  })
})

onUnmounted(() => {
  popup?.remove()
  map?.remove()
  map = null
  popup = null
})

watch(
  () => props.drivers,
  (next) => {
    const src = map?.getSource('drivers') as maplibregl.GeoJSONSource | undefined
    src?.setData(driversToGeoJSON(next))
  },
  { deep: false },
)

watch(
  () => props.selectedDriverId,
  (id) => {
    if (!map) return

    map.setPaintProperty('drivers', 'circle-radius', circleRadiusExpression(id))

    const driver = props.drivers.find((d) => d.id === id)
    if (driver) {
      map.flyTo({
        center: [driver.currentLocation.lng, driver.currentLocation.lat],
        zoom: 14,
        duration: 800,
      })
    }
  },
)
</script>

<template>
  <div class="f3d-globe">
    <div ref="containerRef" class="f3d-globe__canvas" />
  </div>
</template>

<style scoped>
.f3d-globe {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.f3d-globe__canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}
</style>

<!-- Global: override MapLibre popup chrome and inject popup content styles -->
<style>
.f3d-maplibre-popup .maplibregl-popup-content {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  padding: 0;
}

.f3d-maplibre-popup .maplibregl-popup-tip {
  display: none;
}

.f3d-popup {
  padding: 10px 12px;
  min-width: 150px;
}

.f3d-popup__name {
  font-family: 'Barlow', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #e2e2e2;
  margin-bottom: 2px;
}

.f3d-popup__status {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

.f3d-popup__location {
  font-size: 11px;
  color: #8a8a8a;
  margin-bottom: 2px;
}

.f3d-popup__meta {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
}

.f3d-popup__hos {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  margin-top: 4px;
}
</style>
