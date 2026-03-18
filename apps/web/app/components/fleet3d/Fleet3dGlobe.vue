<script setup lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl from 'maplibre-gl'
import type { Driver, Vehicle } from '@motive/shared'

const STATUS_COLORS: Record<string, string> = {
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

const STATE_ABBR_TO_NAME: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
}

const MOCK_DRIVER_ORIGINS: Record<string, [number, number]> = {
  'DRV-001': [-94.57, 29.76], // Houston → Dallas
  'DRV-002': [-122.67, 45.52], // Portland → LA
  'DRV-004': [-93.09, 44.97], // Minneapolis → Chicago
  'DRV-007': [-105.07, 40.57], // Denver → Phoenix
  'DRV-009': [-97.74, 30.27], // Austin → Houston
}

// Mock speeds (mph) for driving drivers
const MOCK_DRIVER_SPEEDS: Record<string, number> = {
  'DRV-001': 62,
  'DRV-002': 58,
  'DRV-004': 65,
  'DRV-007': 71,
  'DRV-009': 55,
}

// Navigation arrow pointing north (up). Rotated by icon-rotate per heading.
const ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <polygon points="16,3 27,29 16,23 5,29" fill="white"/>
</svg>`

// Filled circle for stationary drivers (idle/sleeper/offline/alert).
const DOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="9" fill="white"/>
</svg>`

// Compute geodesic bearing (degrees, 0=north, clockwise)
function computeBearing(from: [number, number], to: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const lng1 = toRad(from[0]),
    lat1 = toRad(from[1])
  const lng2 = toRad(to[0]),
    lat2 = toRad(to[1])
  const dLng = lng2 - lng1
  const x = Math.sin(dLng) * Math.cos(lat2)
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360
}

let cachedOSRMRoutes: GeoJSON.FeatureCollection | null = null
let routeAbortController: AbortController | null = null

// ── Route animation state ─────────────────────────────────────────────────────

// Live interpolated positions for driving drivers (overrides mock currentLocation)
const livePositions = new Map<string, { lng: number; lat: number; heading: number }>()
// Route polyline coordinates per driver (from OSRM)
const routeGeometries = new Map<string, [number, number][]>()
// Current progress 0–1 along the route for each driver
const routeProgress = new Map<string, number>()
let moveInterval: ReturnType<typeof setInterval> | null = null

// Each driving driver completes their full route in this many ms (demo speed)
const DEMO_CYCLE_MS = 7_200_000

// Interpolate a position and heading at fraction t (0–1) along a polyline
function interpolateRoute(
  coords: [number, number][],
  t: number,
): { position: [number, number]; heading: number } {
  const ct = Math.max(0, Math.min(1, t))
  const totalSegs = coords.length - 1
  if (totalSegs <= 0) return { position: coords[0]!, heading: 0 }
  const segT = ct * totalSegs
  const segIdx = Math.min(Math.floor(segT), totalSegs - 1)
  const frac = segT - segIdx
  const a = coords[segIdx]!
  const b = coords[segIdx + 1]!
  return {
    position: [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac],
    heading: computeBearing(a, b),
  }
}

function startMovement(onTick: () => void) {
  if (moveInterval !== null) clearInterval(moveInterval)
  let lastTick = Date.now()
  moveInterval = setInterval(() => {
    const now = Date.now()
    const dt = now - lastTick
    lastTick = now
    for (const [driverId, coords] of routeGeometries) {
      const prev = routeProgress.get(driverId) ?? 0
      const next = (prev + dt / DEMO_CYCLE_MS) % 1
      routeProgress.set(driverId, next)
      const { position, heading } = interpolateRoute(coords, next)
      livePositions.set(driverId, { lng: position[0], lat: position[1], heading })
    }
    onTick()
  }, 50)
}

async function fetchOSRMRoutes(drivers: Driver[]): Promise<GeoJSON.FeatureCollection> {
  const features: GeoJSON.Feature[] = []
  await Promise.allSettled(
    drivers
      .filter((d) => d.status === 'driving' && MOCK_DRIVER_ORIGINS[d.id])
      .map(async (d) => {
        const origin = MOCK_DRIVER_ORIGINS[d.id]!
        const dest: [number, number] = [d.currentLocation.lng, d.currentLocation.lat]
        const url = `https://router.project-osrm.org/route/v1/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?overview=full&geometries=geojson`
        try {
          const res = await fetch(url, { signal: routeAbortController?.signal })
          const data = (await res.json()) as { routes?: Array<{ geometry: GeoJSON.LineString }> }
          if (data.routes?.[0]?.geometry) {
            features.push({
              type: 'Feature',
              geometry: data.routes[0].geometry,
              properties: { driverId: d.id },
            })
          }
        } catch (e) {
          if ((e as Error).name === 'AbortError') return
          // Fallback: straight line
          features.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [origin, dest] },
            properties: { driverId: d.id },
          })
        }
      }),
  )
  return { type: 'FeatureCollection', features }
}

const props = defineProps<{
  drivers: Driver[]
  vehicles: Vehicle[]
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

// ── GeoJSON builders ──────────────────────────────────────────────────────────

function driversToGeoJSON(drivers: Driver[], vehicles: Vehicle[]): GeoJSON.FeatureCollection {
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]))
  return {
    type: 'FeatureCollection',
    features: drivers.map((d) => {
      const live = livePositions.get(d.id)
      const lng = live ? live.lng : d.currentLocation.lng
      const lat = live ? live.lat : d.currentLocation.lat
      const origin = MOCK_DRIVER_ORIGINS[d.id]
      const staticHeading =
        origin && d.status === 'driving'
          ? computeBearing(origin, [d.currentLocation.lng, d.currentLocation.lat])
          : 0
      const heading = live ? live.heading : staticHeading
      const speed = MOCK_DRIVER_SPEEDS[d.id] ?? 0
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
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
          fuelLevel: vehicleMap.get(d.vehicleId)?.fuelLevel ?? 50,
          heading,
          speed,
        },
      }
    }),
  }
}

function buildStraightRoutes(drivers: Driver[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: drivers
      .filter((d) => d.status === 'driving' && MOCK_DRIVER_ORIGINS[d.id])
      .map((d) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [MOCK_DRIVER_ORIGINS[d.id]!, [d.currentLocation.lng, d.currentLocation.lat]],
        },
        properties: { driverId: d.id },
      })),
  }
}

function computeHosGeoJSON(
  statesGeoJSON: GeoJSON.FeatureCollection,
  drivers: Driver[],
): GeoJSON.FeatureCollection {
  return {
    ...statesGeoJSON,
    features: statesGeoJSON.features.map((f) => {
      const stateName = f.properties?.name as string
      const stateDrivers = drivers.filter(
        (d) => STATE_ABBR_TO_NAME[d.currentLocation.state] === stateName,
      )
      const hasViolation = stateDrivers.some((d) => d.hos.hasViolation)
      const hosScore = hasViolation
        ? 0
        : stateDrivers.length === 0
          ? null
          : stateDrivers.reduce((sum, d) => sum + d.hos.drivingRemaining / 11, 0) /
            stateDrivers.length
      return { ...f, properties: { ...f.properties, hosScore } }
    }),
  }
}

// ── Popup ─────────────────────────────────────────────────────────────────────

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

// ── Alert pulse animation ─────────────────────────────────────────────────────

function animateAlertPulse(timestamp: number) {
  if (!animStart) animStart = timestamp
  const t = ((timestamp - animStart) % 1200) / 1200
  const eased = Math.sin(t * Math.PI)
  try {
    map?.setPaintProperty('drivers-alert', 'circle-radius', 8 + eased * 10)
    map?.setPaintProperty('drivers-alert', 'circle-opacity', 0.4 - eased * 0.4)
  } catch {}
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
  routeAbortController = new AbortController()
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
  routeAbortController?.abort()
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
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: #e2e2e2;
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
  color: #8a8a8a;
  margin-bottom: 2px;
}

.f3d-popup__meta {
  font-size: var(--font-size-2xs);
  color: #94a3b8;
  margin-top: 2px;
}

.f3d-popup__hos {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  margin-top: 4px;
}
</style>
