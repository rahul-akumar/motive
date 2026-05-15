import type {
  FleetAsset,
  FleetAssetType,
  FleetAssetSubtype,
  FleetAssetAvailability,
  FleetAssetSource,
  GeoPoint,
} from '@motive/shared'
import type { RegionCode } from '~/composables/useRegion'

// ── Yard / storage locations ──────────────────────────────────────────────────

const YARDS: Record<RegionCode, GeoPoint[]> = {
  us: [
    { lat: 32.9, lng: -96.72, city: 'Dallas', state: 'TX' },
    { lat: 33.92, lng: -84.34, city: 'Atlanta', state: 'GA' },
    { lat: 41.8, lng: -87.75, city: 'Chicago', state: 'IL' },
    { lat: 33.95, lng: -118.1, city: 'Los Angeles', state: 'CA' },
    { lat: 40.67, lng: -74.1, city: 'Newark', state: 'NJ' },
    { lat: 29.85, lng: -95.42, city: 'Houston', state: 'TX' },
    { lat: 39.78, lng: -104.92, city: 'Denver', state: 'CO' },
    { lat: 36.1, lng: -115.2, city: 'Las Vegas', state: 'NV' },
  ],
  mx: [
    { lat: 19.35, lng: -99.05, city: 'Ciudad de México', state: 'CDMX' },
    { lat: 25.75, lng: -100.25, city: 'Monterrey', state: 'NL' },
    { lat: 20.72, lng: -103.28, city: 'Guadalajara', state: 'JAL' },
    { lat: 19.1, lng: -98.15, city: 'Puebla', state: 'PUE' },
    { lat: 32.55, lng: -117.0, city: 'Tijuana', state: 'BC' },
    { lat: 25.8, lng: -103.38, city: 'Torreón', state: 'COAH' },
  ],
  uk: [
    { lat: 51.48, lng: -0.02, city: 'London', state: 'ENG' },
    { lat: 52.52, lng: -1.85, city: 'Birmingham', state: 'ENG' },
    { lat: 53.42, lng: -2.3, city: 'Manchester', state: 'ENG' },
    { lat: 53.72, lng: -1.6, city: 'Leeds', state: 'ENG' },
    { lat: 51.4, lng: -2.55, city: 'Bristol', state: 'ENG' },
    { lat: 55.88, lng: -4.3, city: 'Glasgow', state: 'SCT' },
  ],
}

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// ── Generator ─────────────────────────────────────────────────────────────────

function generateAssets(region: RegionCode, count: number): FleetAsset[] {
  const rand = seededRandom(region === 'us' ? 777 : region === 'mx' ? 888 : 999)
  const yards = YARDS[region]
  const assets: FleetAsset[] = []

  const types: { type: FleetAssetType; subtypes: FleetAssetSubtype[]; prefix: string }[] = [
    { type: 'trailer', subtypes: ['dry-van', 'flatbed', 'reefer'], prefix: 'TRL' },
    { type: 'container', subtypes: ['20ft', '40ft'], prefix: 'CNT' },
    { type: 'generator', subtypes: ['portable', 'stationary'], prefix: 'GEN' },
  ]

  // Distribution: ~60% trailers, ~25% containers, ~15% generators
  const typeWeights = [0.6, 0.25, 0.15]
  const availabilities: FleetAssetAvailability[] = [
    'in-use',
    'available',
    'maintenance',
    'decommissioned',
  ]
  const availabilityWeights = [0.4, 0.35, 0.15, 0.1]
  const sources: FleetAssetSource[] = ['GPS', 'ELD', 'Manual', 'BLE']
  const sourceWeights = [0.45, 0.3, 0.15, 0.1]

  let trailerCount = 0
  let containerCount = 0
  let generatorCount = 0

  for (let i = 0; i < count; i++) {
    // Pick type
    const r = rand()
    let cumulative = 0
    let typeIdx = 0
    for (let t = 0; t < typeWeights.length; t++) {
      cumulative += typeWeights[t]!
      if (r < cumulative) {
        typeIdx = t
        break
      }
    }
    const typeObj = types[typeIdx]!
    const subtype = typeObj.subtypes[Math.floor(rand() * typeObj.subtypes.length)]!

    // Increment per-type counter for naming
    let num: number
    if (typeIdx === 0) num = ++trailerCount
    else if (typeIdx === 1) num = ++containerCount
    else num = ++generatorCount

    // Pick availability
    const ra = rand()
    let cumulativeA = 0
    let availability: FleetAssetAvailability = 'available'
    for (let a = 0; a < availabilities.length; a++) {
      cumulativeA += availabilityWeights[a]!
      if (ra < cumulativeA) {
        availability = availabilities[a]!
        break
      }
    }

    // Pick source
    const rs = rand()
    let cumulativeS = 0
    let source: FleetAssetSource = 'GPS'
    for (let s = 0; s < sources.length; s++) {
      cumulativeS += sourceWeights[s]!
      if (rs < cumulativeS) {
        source = sources[s]!
        break
      }
    }

    // Location: yard with small jitter
    const yard = yards[Math.floor(rand() * yards.length)]!
    const location: GeoPoint = {
      lat: Math.round((yard.lat + (rand() - 0.5) * 0.15) * 10000) / 10000,
      lng: Math.round((yard.lng + (rand() - 0.5) * 0.15) * 10000) / 10000,
      city: yard.city,
      state: yard.state,
    }

    assets.push({
      id: `AST-${region.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      name: `${typeObj.prefix}-${String(num).padStart(4, '0')}`,
      type: typeObj.type,
      subtype,
      driverId: null, // linked later
      driverName: null,
      vehicleId: null, // linked later
      vehicleUnitNumber: null,
      currentLocation: location,
      source,
      availability,
      cameras:
        typeObj.type === 'trailer'
          ? Math.floor(rand() * 3)
          : typeObj.type === 'container'
            ? rand() < 0.3
              ? 1
              : 0
            : 0,
    })
  }

  return assets
}

// ── Exports ───────────────────────────────────────────────────────────────────

export const mockAssetsUS = generateAssets('us', 50)
export const mockAssetsMX = generateAssets('mx', 50)
export const mockAssetsUK = generateAssets('uk', 50)

export const fleetAssetsByRegion: Record<RegionCode, FleetAsset[]> = {
  us: mockAssetsUS,
  mx: mockAssetsMX,
  uk: mockAssetsUK,
}
