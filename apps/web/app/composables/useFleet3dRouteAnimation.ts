import type { Ref } from 'vue'
import type { FleetDriver } from '@motive/shared'
import { computeBearing, type LivePosition } from '~/composables/useFleet3dGeoJSON'

// Each driving driver completes their full route in this many ms (demo speed)
const DEMO_CYCLE_MS = 7_200_000

/**
 * Route fetching and along-route animation for the Fleet 3D globe. Owns the
 * live position / route geometry / progress maps and the movement interval;
 * fetches street routes from OSRM (falling back to straight lines). The host
 * drives MapLibre source updates via the `onTick` callback passed to
 * {@link startMovement}.
 *
 * @param origins per-driver route origin coords for the active region
 */
export function useFleet3dRouteAnimation(origins: Ref<Record<string, [number, number]>>) {
  // Live interpolated positions for driving drivers (overrides mock currentLocation)
  const livePositions = new Map<string, LivePosition>()
  // Route polyline coordinates per driver (from OSRM)
  const routeGeometries = new Map<string, [number, number][]>()
  // Current progress 0–1 along the route for each driver
  const routeProgress = new Map<string, number>()
  let moveInterval: ReturnType<typeof setInterval> | null = null
  let routeAbortController: AbortController | null = null

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

  function stopMovement() {
    if (moveInterval !== null) {
      clearInterval(moveInterval)
      moveInterval = null
    }
  }

  async function fetchOSRMRoutes(drivers: FleetDriver[]): Promise<GeoJSON.FeatureCollection> {
    routeAbortController = new AbortController()
    const features: GeoJSON.Feature[] = []
    await Promise.allSettled(
      drivers
        .filter((d) => d.status === 'driving' && origins.value[d.id])
        .map(async (d) => {
          const origin = origins.value[d.id]!
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

  /** Abort any in-flight OSRM fetch (call from the host's onUnmounted). */
  function abortRoutes() {
    routeAbortController?.abort()
  }

  return {
    livePositions,
    routeGeometries,
    routeProgress,
    interpolateRoute,
    startMovement,
    stopMovement,
    fetchOSRMRoutes,
    abortRoutes,
  }
}
