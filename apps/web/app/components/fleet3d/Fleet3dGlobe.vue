<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl from 'maplibre-gl'
import type { FleetDriver, FleetVehicle } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { mockDriverOriginsByRegion, mockDriverSpeedsByRegion } from '~/mocks/globe-animation'
import { ARROW_SVG, DOT_SVG } from '~/composables/useFleet3dGeoJSON'

// Resolve design tokens to computed color strings for MapLibre GL shaders.
const { readCSSColor } = useCssColors()

function getStatusColors(): Record<string, string> {
  return {
    driving: readCSSColor('--fleet-status-driving', '#4ade80'),
    idle: readCSSColor('--fleet-status-idle', '#fbbf24'),
    alert: readCSSColor('--fleet-status-alert', '#f87171'),
    offline: readCSSColor('--fleet-status-offline', '#525252'),
    sleeper: readCSSColor('--fleet-status-sleeper', '#a78bfa'),
  }
}

let STATUS_COLORS: Record<string, string> = {
  driving: '#4ade80',
  idle: '#fbbf24',
  alert: '#f87171',
  offline: '#525252',
  sleeper: '#a78bfa',
}

// Module-level cache for HOS state GeoJSON fetch
let cachedStatesGeoJSON: GeoJSON.FeatureCollection | null = null
let hosAbortController: AbortController | null = null

const US_STATES_URL =
  'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'

const MOCK_DRIVER_ORIGINS = computed(() => mockDriverOriginsByRegion[currentRegion.value])

// Mock speeds (mph) for driving drivers
const MOCK_DRIVER_SPEEDS = computed(() => mockDriverSpeedsByRegion[currentRegion.value])

// Cached OSRM route FeatureCollection — reused as the routes source on prop updates
let cachedOSRMRoutes: GeoJSON.FeatureCollection | null = null

// Route fetching + along-route animation (owns live positions / route geometry state)
const {
  livePositions,
  routeGeometries,
  routeProgress,
  startMovement,
  fetchOSRMRoutes,
  abortRoutes,
} = useFleet3dRouteAnimation(MOCK_DRIVER_ORIGINS)

// GeoJSON source builders (read live positions + region origins/speeds)
const { driversToGeoJSON, buildStraightRoutes, computeHosGeoJSON } = useFleet3dGeoJSON({
  origins: MOCK_DRIVER_ORIGINS,
  speeds: MOCK_DRIVER_SPEEDS,
  livePositions,
})

const props = defineProps<{
  drivers: FleetDriver[]
  vehicles: FleetVehicle[]
  selectedDriverId: string | null
  fitAllTrigger: number
}>()

const emit = defineEmits<{
  selectDriver: [id: string | null]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let map: maplibregl.Map | null = null
let popup: maplibregl.Popup | null = null
let animFrame: number | null = null
let animStart: number | null = null

// ── Popup ─────────────────────────────────────────────────────────────────────

function popupHTML(p: {
  name: string
  status: string
  city: string
  state: string
  hosViolation: boolean
  hosDrivingRemaining: number
}): string {
  const statusColor = STATUS_COLORS[p.status] ?? STATUS_COLORS.offline
  const hosText = p.hosViolation
    ? `<div class="f3d-popup__hos" style="color:${STATUS_COLORS.alert}">HOS Violation</div>`
    : `<div class="f3d-popup__hos" style="color:${STATUS_COLORS.driving}">${p.hosDrivingRemaining.toFixed(1)}h drive left</div>`
  return `
    <div class="f3d-popup">
      <div class="f3d-popup__name">${p.name}</div>
      <div class="f3d-popup__status" style="color:${statusColor}">${p.status.toUpperCase()}</div>
      <div class="f3d-popup__location">${p.city}, ${p.state}</div>
      ${hosText}
    </div>
  `
}

// ── Alert pulse animation ─────────────────────────────────────────────────────

function animateAlertPulse(timestamp: number) {
  if (!animStart) animStart = timestamp
  const t = ((timestamp - animStart) % 1200) / 1200
  const eased = Math.sin(t * Math.PI)
  try {
    map?.setPaintProperty('drivers-alert', 'circle-radius', 8 + eased * 10)
    map?.setPaintProperty('drivers-alert', 'circle-opacity', 0.4 - eased * 0.4)
  } catch {
    // paint layer may not be initialised yet on the first frames
  }
  animFrame = requestAnimationFrame(animateAlertPulse)
}

// ── Map layer init ────────────────────────────────────────────────────────────

async function initLayers() {
  if (!map) return

  map.setProjection({ type: 'globe' })

  // Load direction arrow + dot SVG as SDF images
  await Promise.all([
    new Promise<void>((resolve, reject) => {
      const img = new Image(32, 32)
      img.onload = () => {
        map!.addImage('arrow', img, { sdf: true })
        resolve()
      }
      img.onerror = reject
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ARROW_SVG)}`
    }),
    new Promise<void>((resolve, reject) => {
      const img = new Image(32, 32)
      img.onload = () => {
        map!.addImage('dot', img, { sdf: true })
        resolve()
      }
      img.onerror = reject
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DOT_SVG)}`
    }),
  ])

  // Drivers source (with clustering)
  map.addSource('drivers', {
    type: 'geojson',
    data: driversToGeoJSON(props.drivers, props.vehicles),
    cluster: true,
    clusterMaxZoom: 7,
    clusterRadius: 50,
  })

  // Routes source (straight lines initially; replaced by OSRM fetch below)
  map.addSource('routes', {
    type: 'geojson',
    data: buildStraightRoutes(props.drivers),
  })

  // ── Layer stack (bottom → top) ──

  // Route lines (dashed green)
  map.addLayer({
    id: 'routes',
    type: 'line',
    source: 'routes',
    paint: {
      'line-color': '#4ade80',
      'line-width': 3,
      'line-dasharray': [4, 3],
      'line-opacity': 0.65,
    },
  })

  // Fuel ring (stroke-only circle sized by fuel level)
  map.addLayer({
    id: 'drivers-fuel',
    type: 'circle',
    source: 'drivers',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': ['+', 7, ['*', ['/', ['get', 'fuelLevel'], 100], 6]],
      'circle-color': 'rgba(0,0,0,0)',
      'circle-stroke-width': 2,
      'circle-stroke-color': [
        'interpolate',
        ['linear'],
        ['get', 'fuelLevel'],
        0,
        '#ef4444',
        25,
        '#f97316',
        50,
        '#eab308',
        75,
        '#84cc16',
        100,
        '#22c55e',
      ],
      'circle-opacity': 0,
      'circle-stroke-opacity': 0.55,
    },
  })

  // Alert pulse halo
  map.addLayer({
    id: 'drivers-alert',
    type: 'circle',
    source: 'drivers',
    filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'status'], 'alert']],
    paint: {
      'circle-radius': 8,
      'circle-color': '#f87171',
      'circle-opacity': 0.4,
      'circle-stroke-width': 0,
    },
  })

  // Driver direction arrows (SDF symbol, rotated by heading, colored by status)
  map.addLayer({
    id: 'drivers',
    type: 'symbol',
    source: 'drivers',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': [
        'match',
        ['get', 'status'],
        'driving',
        'arrow',
        'dot',
      ] as maplibregl.ExpressionSpecification,
      'icon-size': props.selectedDriverId
        ? ([
            'case',
            ['==', ['get', 'id'], props.selectedDriverId],
            1.5,
            1.0,
          ] as maplibregl.ExpressionSpecification)
        : 1.0,
      'icon-rotate': [
        'case',
        ['==', ['get', 'status'], 'driving'],
        ['get', 'heading'],
        0,
      ] as maplibregl.ExpressionSpecification,
      'icon-rotation-alignment': 'map',
      'icon-pitch-alignment': 'map',
      'icon-allow-overlap': true,
    },
    paint: {
      'icon-color': [
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
      'icon-opacity': 1,
    },
  })

  // Speed label (only for driving drivers with speed > 0)
  map.addLayer({
    id: 'drivers-speed',
    type: 'symbol',
    source: 'drivers',
    filter: ['all', ['!', ['has', 'point_count']], ['>', ['get', 'speed'], 0]],
    layout: {
      'text-field': ['concat', ['to-string', ['get', 'speed']], ' mph'],
      'text-size': 9,
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-offset': [0, 2.2],
      'text-anchor': 'top',
      'text-allow-overlap': false,
    },
    paint: {
      'text-color': '#e2e2e2',
      'text-halo-color': 'rgba(0,0,0,0.7)',
      'text-halo-width': 1,
    },
  })

  // Cluster bubbles
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'drivers',
    filter: ['has', 'point_count'],
    paint: {
      'circle-radius': ['step', ['get', 'point_count'], 18, 5, 24, 20, 30],
      'circle-color': 'rgba(100, 130, 255, 0.7)',
      'circle-stroke-width': 1.5,
      'circle-stroke-color': 'rgba(100, 130, 255, 0.9)',
    },
  })

  // Cluster count labels
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'drivers',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 11,
    },
    paint: {
      'text-color': '#ffffff',
    },
  })

  // ── Event handlers ──

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
    }
    popup.setLngLat(coords).setHTML(popupHTML(p)).addTo(map)
  })

  map.on('mouseleave', 'drivers', () => {
    if (!map || !popup) return
    map.getCanvas().style.cursor = ''
    popup.remove()
  })

  map.on('click', 'clusters', (e) => {
    const feature = e.features?.[0]
    if (!feature || feature.geometry.type !== 'Point') return
    const center = feature.geometry.coordinates as [number, number]
    ;(map!.getSource('drivers') as maplibregl.GeoJSONSource)
      .getClusterExpansionZoom(feature.properties!.cluster_id as number)
      .then((zoom) => map!.flyTo({ center, zoom, duration: 500 }))
  })

  map.on('mouseenter', 'clusters', () => {
    if (map) map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'clusters', () => {
    if (map) map.getCanvas().style.cursor = ''
  })

  // Start alert pulse animation
  animFrame = requestAnimationFrame(animateAlertPulse)

  // Fetch real street routes from OSRM, then start animating trucks along them
  fetchOSRMRoutes(props.drivers).then((geojson) => {
    cachedOSRMRoutes = geojson
    ;(map?.getSource('routes') as maplibregl.GeoJSONSource | undefined)?.setData(geojson)

    // Seed route geometries with staggered starting positions so drivers aren't bunched
    for (const feature of geojson.features) {
      const driverId = feature.properties?.driverId as string
      if (driverId && feature.geometry.type === 'LineString') {
        routeGeometries.set(driverId, feature.geometry.coordinates as [number, number][])
        routeProgress.set(driverId, Math.random() * 0.5)
      }
    }

    startMovement(() => {
      ;(map?.getSource('drivers') as maplibregl.GeoJSONSource | undefined)?.setData(
        driversToGeoJSON(props.drivers, props.vehicles),
      )
    })
  })

  // Fetch HOS state heatmap (async, non-blocking)
  ;(async () => {
    hosAbortController = new AbortController()
    try {
      const res = await fetch(US_STATES_URL, { signal: hosAbortController.signal })
      cachedStatesGeoJSON = await res.json()
      if (!map) return
      map.addSource('hos-states', {
        type: 'geojson',
        data: computeHosGeoJSON(cachedStatesGeoJSON!, props.drivers),
      })
      map.addLayer(
        {
          id: 'hos-heatmap',
          type: 'fill',
          source: 'hos-states',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'hosScore'], null],
              'rgba(0,0,0,0)',
              [
                'interpolate',
                ['linear'],
                ['get', 'hosScore'],
                0,
                '#ef444466',
                0.25,
                '#f9731666',
                0.5,
                '#eab30866',
                0.75,
                '#86efac44',
                1,
                '#22c55e22',
              ],
            ],
            'fill-opacity': 0.7,
          },
        },
        'routes', // insert below routes
      )
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.warn('HOS fetch failed', e)
    }
  })()
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  STATUS_COLORS = getStatusColors()
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
    initLayers()
  })
})

onUnmounted(() => {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
  abortRoutes()
  hosAbortController?.abort()
  popup?.remove()
  map?.remove()
  map = null
  popup = null
})

// ── Watchers ──────────────────────────────────────────────────────────────────

watch(
  [() => props.drivers, () => props.vehicles],
  ([nextDrivers, nextVehicles]) => {
    ;(map?.getSource('drivers') as maplibregl.GeoJSONSource | undefined)?.setData(
      driversToGeoJSON(nextDrivers, nextVehicles),
    )
    ;(map?.getSource('routes') as maplibregl.GeoJSONSource | undefined)?.setData(
      cachedOSRMRoutes ?? buildStraightRoutes(nextDrivers),
    )
    if (cachedStatesGeoJSON && map?.getSource('hos-states')) {
      ;(map.getSource('hos-states') as maplibregl.GeoJSONSource).setData(
        computeHosGeoJSON(cachedStatesGeoJSON, nextDrivers),
      )
    }
  },
  { deep: false },
)

watch(
  () => props.selectedDriverId,
  (id) => {
    if (!map) return

    if (id === null) {
      map.flyTo({ center: [-98.35, 39.5], zoom: 3, duration: 1000 })
      return
    }

    map.setLayoutProperty(
      'drivers',
      'icon-size',
      id
        ? (['case', ['==', ['get', 'id'], id], 1.5, 1.0] as maplibregl.ExpressionSpecification)
        : 1.0,
    )

    const driver = props.drivers.find((d) => d.id === id)
    if (driver) {
      const live = livePositions.get(id)
      const center: [number, number] = live
        ? [live.lng, live.lat]
        : [driver.currentLocation.lng, driver.currentLocation.lat]
      map.flyTo({ center, zoom: 14, duration: 800 })
    }
  },
)

watch(
  () => props.fitAllTrigger,
  (trigger) => {
    if (!map || trigger === 0) return
    const coords = props.drivers.map(
      (d) => [d.currentLocation.lng, d.currentLocation.lat] as [number, number],
    )
    if (coords.length === 0) return
    if (coords.length === 1) {
      map.flyTo({ center: coords[0]!, zoom: 8, duration: 800 })
      return
    }
    const lngs = coords.map((c) => c[0])
    const lats = coords.map((c) => c[1])
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 60, duration: 800 },
    )
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
  background: oklch(0.218 0 0);
  border: 1px solid oklch(1 0 0 / 0.12);
  border-radius: 2px;
  box-shadow: 0 8px 24px oklch(0 0 0 / 0.5);
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
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: oklch(0.913 0 0);
  margin-bottom: 2px;
}

.f3d-popup__status {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-loose);
  margin-bottom: 4px;
}

.f3d-popup__location {
  font-size: var(--font-size-xs);
  color: oklch(0.627 0 0);
  margin-bottom: 2px;
}

.f3d-popup__meta {
  font-size: var(--font-size-2xs);
  color: oklch(0.704 0.022 248.4);
  margin-top: 2px;
}

.f3d-popup__hos {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  margin-top: 4px;
}
</style>
