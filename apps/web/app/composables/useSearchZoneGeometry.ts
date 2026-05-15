/**
 * Haversine-based geometry utilities for computing search zone
 * polygons (sectors, circles) on a Leaflet map.
 */

const EARTH_RADIUS_M = 6_371_000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

export function destinationPoint(
  lat: number,
  lng: number,
  bearingDeg: number,
  distanceM: number,
): { lat: number; lng: number } {
  const φ1 = toRad(lat)
  const λ1 = toRad(lng)
  const θ = toRad(bearingDeg)
  const δ = distanceM / EARTH_RADIUS_M

  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ))
  const λ2 =
    λ1 +
    Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2))

  return { lat: toDeg(φ2), lng: toDeg(λ2) }
}

export function computeSectorPolygon(
  center: { lat: number; lng: number },
  radiusM: number,
  headingDeg: number,
  arcDeg: number = 60,
  steps: number = 30,
): [number, number][] {
  const points: [number, number][] = []
  const startAngle = headingDeg - arcDeg / 2
  const stepSize = arcDeg / steps

  points.push([center.lat, center.lng])

  for (let i = 0; i <= steps; i++) {
    const bearing = startAngle + stepSize * i
    const pt = destinationPoint(center.lat, center.lng, bearing, radiusM)
    points.push([pt.lat, pt.lng])
  }

  points.push([center.lat, center.lng])
  return points
}

export function useSearchZoneGeometry() {
  return { destinationPoint, computeSectorPolygon }
}
