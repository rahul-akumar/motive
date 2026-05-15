import type { FleetVehicle, FleetVehicleStatus, GeoPoint } from '@motive/shared'
import type { RegionCode } from '~/composables/useRegion'

// ── Highway corridor waypoints ────────────────────────────────────────────────

const US_CORRIDORS: GeoPoint[] = [
  // I-10 corridor (LA to Jacksonville)
  { lat: 34.05, lng: -118.24, city: 'Los Angeles', state: 'CA' },
  { lat: 33.45, lng: -112.07, city: 'Phoenix', state: 'AZ' },
  { lat: 32.22, lng: -110.97, city: 'Tucson', state: 'AZ' },
  { lat: 31.76, lng: -106.49, city: 'El Paso', state: 'TX' },
  { lat: 29.76, lng: -95.37, city: 'Houston', state: 'TX' },
  { lat: 29.42, lng: -98.49, city: 'San Antonio', state: 'TX' },
  { lat: 30.27, lng: -97.74, city: 'Austin', state: 'TX' },
  { lat: 30.33, lng: -81.66, city: 'Jacksonville', state: 'FL' },
  // I-40 corridor (Barstow to Nashville)
  { lat: 34.9, lng: -117.02, city: 'Barstow', state: 'CA' },
  { lat: 35.2, lng: -111.65, city: 'Flagstaff', state: 'AZ' },
  { lat: 35.08, lng: -106.65, city: 'Albuquerque', state: 'NM' },
  { lat: 35.47, lng: -97.52, city: 'Oklahoma City', state: 'OK' },
  { lat: 35.15, lng: -90.05, city: 'Memphis', state: 'TN' },
  { lat: 36.16, lng: -86.78, city: 'Nashville', state: 'TN' },
  // I-80 corridor (SF to NYC)
  { lat: 37.77, lng: -122.42, city: 'San Francisco', state: 'CA' },
  { lat: 39.53, lng: -119.81, city: 'Reno', state: 'NV' },
  { lat: 40.76, lng: -111.89, city: 'Salt Lake City', state: 'UT' },
  { lat: 41.26, lng: -95.94, city: 'Omaha', state: 'NE' },
  { lat: 41.88, lng: -87.63, city: 'Chicago', state: 'IL' },
  { lat: 40.44, lng: -79.99, city: 'Pittsburgh', state: 'PA' },
  { lat: 40.71, lng: -74.01, city: 'New York', state: 'NY' },
  // I-95 corridor (Miami to Boston)
  { lat: 25.76, lng: -80.19, city: 'Miami', state: 'FL' },
  { lat: 28.54, lng: -81.38, city: 'Orlando', state: 'FL' },
  { lat: 32.08, lng: -81.09, city: 'Savannah', state: 'GA' },
  { lat: 35.78, lng: -78.64, city: 'Raleigh', state: 'NC' },
  { lat: 38.91, lng: -77.04, city: 'Washington', state: 'DC' },
  { lat: 39.95, lng: -75.17, city: 'Philadelphia', state: 'PA' },
  { lat: 42.36, lng: -71.06, city: 'Boston', state: 'MA' },
  // I-35 corridor
  { lat: 32.78, lng: -96.8, city: 'Dallas', state: 'TX' },
  { lat: 35.47, lng: -97.52, city: 'Oklahoma City', state: 'OK' },
  { lat: 39.1, lng: -94.58, city: 'Kansas City', state: 'MO' },
  { lat: 44.98, lng: -93.27, city: 'Minneapolis', state: 'MN' },
  // Extra hubs
  { lat: 33.75, lng: -84.39, city: 'Atlanta', state: 'GA' },
  { lat: 39.74, lng: -104.99, city: 'Denver', state: 'CO' },
  { lat: 47.61, lng: -122.33, city: 'Seattle', state: 'WA' },
  { lat: 45.52, lng: -122.68, city: 'Portland', state: 'OR' },
  { lat: 42.33, lng: -83.05, city: 'Detroit', state: 'MI' },
  { lat: 38.25, lng: -85.76, city: 'Louisville', state: 'KY' },
  { lat: 36.17, lng: -115.14, city: 'Las Vegas', state: 'NV' },
  { lat: 27.95, lng: -82.46, city: 'Tampa', state: 'FL' },
  { lat: 26.12, lng: -80.14, city: 'Fort Lauderdale', state: 'FL' },
  { lat: 41.5, lng: -81.69, city: 'Cleveland', state: 'OH' },
  { lat: 39.96, lng: -82.99, city: 'Columbus', state: 'OH' },
  { lat: 43.04, lng: -87.91, city: 'Milwaukee', state: 'WI' },
  { lat: 30.46, lng: -91.19, city: 'Baton Rouge', state: 'LA' },
  { lat: 29.95, lng: -90.07, city: 'New Orleans', state: 'LA' },
  { lat: 35.23, lng: -80.84, city: 'Charlotte', state: 'NC' },
  { lat: 37.54, lng: -77.44, city: 'Richmond', state: 'VA' },
  { lat: 36.85, lng: -75.98, city: 'Norfolk', state: 'VA' },
  { lat: 33.52, lng: -86.8, city: 'Birmingham', state: 'AL' },
  { lat: 34.74, lng: -92.29, city: 'Little Rock', state: 'AR' },
  { lat: 32.3, lng: -90.18, city: 'Jackson', state: 'MS' },
  { lat: 41.76, lng: -72.69, city: 'Hartford', state: 'CT' },
  { lat: 40.74, lng: -74.17, city: 'Newark', state: 'NJ' },
]

const MX_CORRIDORS: GeoPoint[] = [
  // MX-85D (Mexico City to Monterrey)
  { lat: 19.43, lng: -99.13, city: 'Ciudad de México', state: 'CDMX' },
  { lat: 20.59, lng: -100.39, city: 'Querétaro', state: 'QRO' },
  { lat: 21.88, lng: -102.29, city: 'Aguascalientes', state: 'AGS' },
  { lat: 22.77, lng: -102.58, city: 'Zacatecas', state: 'ZAC' },
  { lat: 24.03, lng: -104.65, city: 'Durango', state: 'DGO' },
  { lat: 23.63, lng: -102.55, city: 'Fresnillo', state: 'ZAC' },
  { lat: 25.67, lng: -100.31, city: 'Monterrey', state: 'NL' },
  { lat: 25.43, lng: -100.99, city: 'Saltillo', state: 'COAH' },
  // MX-57D / Pacific coast
  { lat: 20.67, lng: -103.35, city: 'Guadalajara', state: 'JAL' },
  { lat: 21.16, lng: -101.68, city: 'León', state: 'GTO' },
  { lat: 20.98, lng: -101.26, city: 'Celaya', state: 'GTO' },
  { lat: 19.18, lng: -96.14, city: 'Veracruz', state: 'VER' },
  { lat: 18.85, lng: -99.22, city: 'Cuernavaca', state: 'MOR' },
  { lat: 19.04, lng: -98.21, city: 'Puebla', state: 'PUE' },
  // Border / Northern routes
  { lat: 32.62, lng: -115.45, city: 'Mexicali', state: 'BC' },
  { lat: 32.53, lng: -117.02, city: 'Tijuana', state: 'BC' },
  { lat: 31.69, lng: -106.42, city: 'Ciudad Juárez', state: 'CHIH' },
  { lat: 28.63, lng: -106.09, city: 'Chihuahua', state: 'CHIH' },
  { lat: 27.49, lng: -109.93, city: 'Los Mochis', state: 'SIN' },
  { lat: 24.81, lng: -107.39, city: 'Culiacán', state: 'SIN' },
  { lat: 23.24, lng: -106.42, city: 'Mazatlán', state: 'SIN' },
  { lat: 20.63, lng: -105.23, city: 'Puerto Vallarta', state: 'JAL' },
  // South / Yucatán
  { lat: 17.06, lng: -96.73, city: 'Oaxaca', state: 'OAX' },
  { lat: 16.75, lng: -93.12, city: 'Tuxtla Gutiérrez', state: 'CHIS' },
  { lat: 20.97, lng: -89.59, city: 'Mérida', state: 'YUC' },
  { lat: 21.17, lng: -86.85, city: 'Cancún', state: 'QROO' },
  { lat: 19.84, lng: -90.54, city: 'Campeche', state: 'CAMP' },
  { lat: 18.5, lng: -88.3, city: 'Chetumal', state: 'QROO' },
  { lat: 17.99, lng: -92.93, city: 'Villahermosa', state: 'TAB' },
  { lat: 22.15, lng: -100.98, city: 'San Luis Potosí', state: 'SLP' },
  { lat: 24.14, lng: -110.31, city: 'La Paz', state: 'BCS' },
  { lat: 26.91, lng: -101.42, city: 'Monclova', state: 'COAH' },
  { lat: 25.75, lng: -103.44, city: 'Torreón', state: 'COAH' },
  { lat: 27.48, lng: -99.51, city: 'Nuevo Laredo', state: 'TAMPS' },
  { lat: 25.87, lng: -97.5, city: 'Matamoros', state: 'TAMPS' },
  { lat: 23.73, lng: -99.14, city: 'Ciudad Victoria', state: 'TAMPS' },
  { lat: 22.23, lng: -97.86, city: 'Tampico', state: 'TAMPS' },
]

const UK_CORRIDORS: GeoPoint[] = [
  // M1 corridor (London to Leeds)
  { lat: 51.51, lng: -0.13, city: 'London', state: 'ENG' },
  { lat: 51.75, lng: -0.47, city: 'Watford', state: 'ENG' },
  { lat: 51.88, lng: -0.42, city: 'Luton', state: 'ENG' },
  { lat: 52.24, lng: -0.9, city: 'Northampton', state: 'ENG' },
  { lat: 52.63, lng: -1.13, city: 'Leicester', state: 'ENG' },
  { lat: 52.95, lng: -1.15, city: 'Nottingham', state: 'ENG' },
  { lat: 53.38, lng: -1.47, city: 'Sheffield', state: 'ENG' },
  { lat: 53.8, lng: -1.55, city: 'Leeds', state: 'ENG' },
  // M6 corridor (Birmingham to Carlisle)
  { lat: 52.48, lng: -1.9, city: 'Birmingham', state: 'ENG' },
  { lat: 52.69, lng: -2.45, city: 'Wolverhampton', state: 'ENG' },
  { lat: 52.83, lng: -2.12, city: 'Stafford', state: 'ENG' },
  { lat: 53.0, lng: -2.18, city: 'Stoke-on-Trent', state: 'ENG' },
  { lat: 53.24, lng: -2.61, city: 'Crewe', state: 'ENG' },
  { lat: 53.41, lng: -2.74, city: 'Warrington', state: 'ENG' },
  { lat: 54.0, lng: -2.8, city: 'Lancaster', state: 'ENG' },
  { lat: 54.89, lng: -2.94, city: 'Carlisle', state: 'ENG' },
  // M25 / South East
  { lat: 51.27, lng: 0.52, city: 'Maidstone', state: 'ENG' },
  { lat: 51.38, lng: -0.3, city: 'Croydon', state: 'ENG' },
  { lat: 51.44, lng: -0.97, city: 'Reading', state: 'ENG' },
  { lat: 51.75, lng: -1.26, city: 'Oxford', state: 'ENG' },
  // M62 corridor (Liverpool to Hull)
  { lat: 53.41, lng: -2.98, city: 'Liverpool', state: 'ENG' },
  { lat: 53.48, lng: -2.24, city: 'Manchester', state: 'ENG' },
  { lat: 53.65, lng: -1.78, city: 'Huddersfield', state: 'ENG' },
  { lat: 53.74, lng: -0.35, city: 'Hull', state: 'ENG' },
  // M5 corridor (Bristol to Exeter)
  { lat: 51.45, lng: -2.59, city: 'Bristol', state: 'ENG' },
  { lat: 51.01, lng: -3.1, city: 'Taunton', state: 'ENG' },
  { lat: 50.72, lng: -3.53, city: 'Exeter', state: 'ENG' },
  // Scotland
  { lat: 55.95, lng: -3.19, city: 'Edinburgh', state: 'SCT' },
  { lat: 55.86, lng: -4.25, city: 'Glasgow', state: 'SCT' },
  { lat: 56.46, lng: -2.97, city: 'Dundee', state: 'SCT' },
  { lat: 57.15, lng: -2.09, city: 'Aberdeen', state: 'SCT' },
  // Wales
  { lat: 51.48, lng: -3.18, city: 'Cardiff', state: 'WAL' },
  { lat: 51.62, lng: -3.94, city: 'Swansea', state: 'WAL' },
  // Extra hubs
  { lat: 54.6, lng: -1.57, city: 'Middlesbrough', state: 'ENG' },
  { lat: 54.97, lng: -1.61, city: 'Newcastle', state: 'ENG' },
  { lat: 53.96, lng: -1.08, city: 'York', state: 'ENG' },
  { lat: 50.38, lng: -4.14, city: 'Plymouth', state: 'ENG' },
  { lat: 50.9, lng: -1.4, city: 'Southampton', state: 'ENG' },
  { lat: 50.82, lng: -0.14, city: 'Brighton', state: 'ENG' },
  { lat: 52.2, lng: 0.12, city: 'Cambridge', state: 'ENG' },
  { lat: 51.38, lng: 1.44, city: 'Canterbury', state: 'ENG' },
  { lat: 53.23, lng: -0.54, city: 'Lincoln', state: 'ENG' },
  { lat: 52.41, lng: -1.51, city: 'Coventry', state: 'ENG' },
]

const CORRIDORS: Record<RegionCode, GeoPoint[]> = {
  us: US_CORRIDORS,
  mx: MX_CORRIDORS,
  uk: UK_CORRIDORS,
}

// ── Vehicle data pools ────────────────────────────────────────────────────────

const US_MAKES: { make: string; models: string[] }[] = [
  { make: 'Freightliner', models: ['Cascadia', 'Columbia', 'Century'] },
  { make: 'Peterbilt', models: ['579', '389', '567'] },
  { make: 'Kenworth', models: ['T680', 'T880', 'W990'] },
  { make: 'Volvo', models: ['VNL 860', 'VNL 760', 'VNR 640'] },
  { make: 'International', models: ['LT', 'RH', 'HX'] },
  { make: 'Mack', models: ['Anthem', 'Pinnacle', 'Granite'] },
  { make: 'Western Star', models: ['5700XE', '4900', '49X'] },
]

const MX_MAKES: { make: string; models: string[] }[] = [
  { make: 'Kenworth', models: ['T680', 'T880', 'T600'] },
  { make: 'Freightliner', models: ['Cascadia', 'Columbia', 'Century'] },
  { make: 'International', models: ['LT', 'ProStar', 'LoneStar'] },
  { make: 'Volvo', models: ['VNL 860', 'FH', 'FM'] },
  { make: 'Scania', models: ['R 500', 'S 730', 'G 450'] },
  { make: 'MAN', models: ['TGX', 'TGS', 'TGM'] },
]

const UK_MAKES: { make: string; models: string[] }[] = [
  { make: 'DAF', models: ['XF', 'CF', 'LF'] },
  { make: 'Scania', models: ['R 500', 'S 730', 'G 450'] },
  { make: 'Volvo', models: ['FH', 'FM', 'FE'] },
  { make: 'MAN', models: ['TGX', 'TGS', 'TGM'] },
  { make: 'Mercedes-Benz', models: ['Actros', 'Arocs', 'Atego'] },
  { make: 'Iveco', models: ['S-Way', 'Eurocargo', 'Daily'] },
  { make: 'Renault', models: ['T High', 'T', 'D Wide'] },
]

const MAKES: Record<RegionCode, { make: string; models: string[] }[]> = {
  us: US_MAKES,
  mx: MX_MAKES,
  uk: UK_MAKES,
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

function generateVehicles(region: RegionCode, count: number): FleetVehicle[] {
  const rand = seededRandom(region === 'us' ? 42 : region === 'mx' ? 137 : 256)
  const corridors = CORRIDORS[region]
  const makes = MAKES[region]
  const vehicles: FleetVehicle[] = []

  const statuses: FleetVehicleStatus[] = ['active', 'idle', 'out-of-service', 'maintenance']
  const statusWeights = [0.55, 0.25, 0.12, 0.08] // realistic distribution

  for (let i = 0; i < count; i++) {
    const pick = (arr: unknown[]) => arr[Math.floor(rand() * arr.length)]
    const makeObj = pick(makes) as { make: string; models: string[] }
    const model = pick(makeObj.models) as string
    const waypoint = corridors[i % corridors.length]!

    // Add small random offset to simulate being along the road (±0.3 degrees)
    const lat = waypoint.lat + (rand() - 0.5) * 0.6
    const lng = waypoint.lng + (rand() - 0.5) * 0.6

    // Pick status based on weighted distribution
    const r = rand()
    let cumulative = 0
    let status: FleetVehicleStatus = 'active'
    for (let s = 0; s < statuses.length; s++) {
      cumulative += statusWeights[s]!
      if (r < cumulative) {
        status = statuses[s]!
        break
      }
    }

    const unitPrefix = region === 'us' ? 'V' : region === 'mx' ? 'MX' : 'UK'
    const unitNum = String(1001 + i)

    vehicles.push({
      id: `VEH-${region.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      unitNumber: `${unitPrefix}-${unitNum}`,
      make: makeObj.make,
      model,
      year: 2019 + Math.floor(rand() * 6), // 2019-2024
      vin: generateVIN(rand),
      licensePlate: generatePlate(region, i, rand),
      status,
      driverId: null, // linked later
      driverName: null,
      assetId: null, // linked later
      assetName: null,
      currentLocation: {
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        city: waypoint.city,
        state: waypoint.state,
      },
      defects: rand() < 0.2 ? Math.floor(rand() * 4) + 1 : 0,
      cameras: Math.floor(rand() * 5), // 0-4
      mileage: Math.floor(rand() * 400000) + 50000,
      fuelLevel: Math.floor(rand() * 80) + 20, // 20-100
    })
  }

  return vehicles
}

function generateVIN(rand: () => number): string {
  const chars = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ'
  let vin = ''
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(rand() * chars.length)]
  }
  return vin
}

function generatePlate(region: RegionCode, index: number, rand: () => number): string {
  if (region === 'us') {
    const states = ['TX', 'CA', 'FL', 'OH', 'PA', 'IL', 'GA', 'NC', 'MI', 'TN']
    const state = states[index % states.length]
    const num = String(Math.floor(rand() * 9000) + 1000)
    const letters =
      String.fromCharCode(65 + Math.floor(rand() * 26)) +
      String.fromCharCode(65 + Math.floor(rand() * 26))
    return `${state} ${letters}${num}`
  }
  if (region === 'mx') {
    const states = ['NL', 'JAL', 'CDMX', 'PUE', 'BC', 'CHIH', 'GTO', 'QRO', 'SIN', 'COAH']
    const num = String(Math.floor(rand() * 900) + 100)
    const letters =
      String.fromCharCode(65 + Math.floor(rand() * 26)) +
      String.fromCharCode(65 + Math.floor(rand() * 26)) +
      String.fromCharCode(65 + Math.floor(rand() * 26))
    return `${states[index % states.length]}-${letters}-${num}`
  }
  // UK
  const areas = ['AB', 'BD', 'BF', 'BG', 'CA', 'DA', 'EA', 'FA', 'GA', 'HA']
  const num = String(Math.floor(rand() * 90) + 10)
  const suffix =
    String.fromCharCode(65 + Math.floor(rand() * 26)) +
    String.fromCharCode(65 + Math.floor(rand() * 26)) +
    String.fromCharCode(65 + Math.floor(rand() * 26))
  return `${areas[index % areas.length]}${num} ${suffix}`
}

// ── Exports ───────────────────────────────────────────────────────────────────

export const mockVehiclesUS = generateVehicles('us', 55)
export const mockVehiclesMX = generateVehicles('mx', 55)
export const mockVehiclesUK = generateVehicles('uk', 55)

export const fleetVehiclesByRegion: Record<RegionCode, FleetVehicle[]> = {
  us: mockVehiclesUS,
  mx: mockVehiclesMX,
  uk: mockVehiclesUK,
}
