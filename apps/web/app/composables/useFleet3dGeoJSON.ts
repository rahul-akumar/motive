import type { Ref } from 'vue'
import type { FleetDriver, FleetVehicle } from '@motive/shared'

/** Navigation arrow pointing north (up). Rotated by icon-rotate per heading. */
export const ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <polygon points="16,3 27,29 16,23 5,29" fill="white"/>
</svg>`

/** Filled circle for stationary drivers (idle/sleeper/offline/alert). */
export const DOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="9" fill="white"/>
</svg>`

export const STATE_ABBR_TO_NAME: Record<string, string> = {
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

/** Compute geodesic bearing (degrees, 0=north, clockwise). */
export function computeBearing(from: [number, number], to: [number, number]): number {
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

export interface LivePosition {
  lng: number
  lat: number
  heading: number
}

export interface Fleet3dGeoJSONDeps {
  /** Per-driver route origin coords for the active region (driverId → [lng, lat]). */
  origins: Ref<Record<string, [number, number]>>
  /** Per-driver mock speed (mph) for the active region. */
  speeds: Ref<Record<string, number>>
  /** Live interpolated positions for driving drivers (owned by the route animation). */
  livePositions: Map<string, LivePosition>
}

/**
 * GeoJSON source builders for the Fleet 3D globe. Pure given the injected
 * region origins/speeds and the live position map — no MapLibre or DOM access.
 */
export function useFleet3dGeoJSON({ origins, speeds, livePositions }: Fleet3dGeoJSONDeps) {
  function driversToGeoJSON(
    drivers: FleetDriver[],
    vehicles: FleetVehicle[],
  ): GeoJSON.FeatureCollection {
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]))
    return {
      type: 'FeatureCollection',
      features: drivers.map((d) => {
        const live = livePositions.get(d.id)
        const lng = live ? live.lng : d.currentLocation.lng
        const lat = live ? live.lat : d.currentLocation.lat
        const origin = origins.value[d.id]
        const staticHeading =
          origin && d.status === 'driving'
            ? computeBearing(origin, [d.currentLocation.lng, d.currentLocation.lat])
            : 0
        const heading = live ? live.heading : staticHeading
        const speed = speeds.value[d.id] ?? 0
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
            hosDrivingRemaining: d.hos.driveRemaining,
            fuelLevel: vehicleMap.get(d.vehicleId ?? '')?.fuelLevel ?? 50,
            heading,
            speed,
          },
        }
      }),
    }
  }

  function buildStraightRoutes(drivers: FleetDriver[]): GeoJSON.FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: drivers
        .filter((d) => d.status === 'driving' && origins.value[d.id])
        .map((d) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: [origins.value[d.id]!, [d.currentLocation.lng, d.currentLocation.lat]],
          },
          properties: { driverId: d.id },
        })),
    }
  }

  function computeHosGeoJSON(
    statesGeoJSON: GeoJSON.FeatureCollection,
    drivers: FleetDriver[],
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
            : stateDrivers.reduce((sum, d) => sum + d.hos.driveRemaining / 11, 0) /
              stateDrivers.length
        return { ...f, properties: { ...f.properties, hosScore } }
      }),
    }
  }

  return { driversToGeoJSON, buildStraightRoutes, computeHosGeoJSON }
}
