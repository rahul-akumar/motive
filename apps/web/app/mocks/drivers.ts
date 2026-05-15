import type { FleetDriver, FleetDriverStatus, FleetDriverHos, GeoPoint } from '@motive/shared'
import type { RegionCode } from '~/composables/useRegion'

// ── Name pools ────────────────────────────────────────────────────────────────

const US_NAMES = [
  'Marcus Johnson',
  'Sarah Chen',
  'Robert Williams',
  'Emily Martinez',
  'James Thompson',
  'Linda Garcia',
  'Michael Brown',
  'Jessica Davis',
  'David Wilson',
  'Ashley Anderson',
  'Christopher Lee',
  'Amanda Taylor',
  'Daniel Thomas',
  'Stephanie Moore',
  'Andrew Jackson',
  'Nicole White',
  'Joshua Harris',
  'Megan Clark',
  'Matthew Lewis',
  'Rachel Robinson',
  'Brandon Walker',
  'Amber Hall',
  'Justin Young',
  'Heather King',
  'Ryan Wright',
  'Kayla Scott',
  'Tyler Green',
  'Brittany Adams',
  'Kevin Nelson',
  'Samantha Hill',
  'Joseph Baker',
  'Lauren Mitchell',
  'Brian Campbell',
  'Michelle Carter',
  'Jason Roberts',
  'Christina Turner',
  'Eric Phillips',
  'Jennifer Evans',
  'Aaron Collins',
  'Tiffany Edwards',
  'Adam Stewart',
  'Danielle Sanchez',
  'Nathan Morris',
  'Courtney Rogers',
  'Patrick Reed',
  'Melissa Cook',
  'Sean Morgan',
  'Angela Bell',
  'Travis Murphy',
  'Kimberly Bailey',
]

const MX_NAMES = [
  'Carlos Hernández',
  'María García',
  'Jorge López',
  'Ana Martínez',
  'Miguel Rodríguez',
  'Laura Pérez',
  'Juan Sánchez',
  'Patricia Ramírez',
  'Francisco Torres',
  'Rosa Flores',
  'Alejandro Díaz',
  'Claudia Morales',
  'Roberto Reyes',
  'Adriana Cruz',
  'Fernando Ortiz',
  'Gabriela Gutiérrez',
  'Ricardo Ramos',
  'Verónica Vargas',
  'Eduardo Castillo',
  'Leticia Jiménez',
  'Javier Moreno',
  'Isabel Romero',
  'Sergio Álvarez',
  'Diana Ruiz',
  'Raúl Mendoza',
  'Mónica Aguilar',
  'Pedro Medina',
  'Carmen Herrera',
  'Enrique Castro',
  'Teresa Vega',
  'Arturo Guerrero',
  'Silvia Campos',
  'Alberto Delgado',
  'Mariana Ríos',
  'Hugo Contreras',
  'Brenda Fuentes',
  'Oscar Acosta',
  'Araceli Soto',
  'Luis Domínguez',
  'Fabiola Navarro',
  'Víctor Palacios',
  'Elizabeth Cervantes',
  'Mario Pacheco',
  'Sandra Ibarra',
  'Manuel Salinas',
  'Yolanda Zamora',
  'Gustavo Espinoza',
  'Rocío Villanueva',
  'Iván Trejo',
  'Martha Figueroa',
]

const UK_NAMES = [
  'James Smith',
  'Emma Jones',
  'Oliver Williams',
  'Sophie Taylor',
  'William Brown',
  'Charlotte Davies',
  'Harry Wilson',
  'Amelia Evans',
  'George Thomas',
  'Olivia Roberts',
  'Jack Walker',
  'Isla Robinson',
  'Charlie Wright',
  'Mia Thompson',
  'Thomas Green',
  'Emily Hall',
  'Jacob White',
  'Grace Martin',
  'Alfie Clark',
  'Chloe Lewis',
  'Oscar Young',
  'Lily Allen',
  'Henry King',
  'Jessica Baker',
  'Leo Wright',
  'Ruby Adams',
  'Arthur Nelson',
  'Ella Hill',
  'Noah Campbell',
  'Freya Mitchell',
  'Ethan Carter',
  'Poppy Phillips',
  'Freddie Parker',
  'Daisy Turner',
  'Samuel Edwards',
  'Florence Collins',
  'Max Hughes',
  'Willow Wood',
  'Joseph Barnes',
  'Rosie Price',
  'Daniel Bennett',
  'Evie Kelly',
  'Alexander Gray',
  'Sienna Cook',
  'Sebastian Bailey',
  'Millie Morgan',
  'Isaac Griffiths',
  'Phoebe Shaw',
  'Edward Russell',
  'Harper Watson',
]

const NAMES: Record<RegionCode, string[]> = { us: US_NAMES, mx: MX_NAMES, uk: UK_NAMES }

// ── Depot locations (for off-duty/unassigned drivers) ─────────────────────────

const DEPOTS: Record<RegionCode, GeoPoint[]> = {
  us: [
    { lat: 32.78, lng: -96.8, city: 'Dallas', state: 'TX' },
    { lat: 33.75, lng: -84.39, city: 'Atlanta', state: 'GA' },
    { lat: 41.88, lng: -87.63, city: 'Chicago', state: 'IL' },
    { lat: 34.05, lng: -118.24, city: 'Los Angeles', state: 'CA' },
    { lat: 40.71, lng: -74.01, city: 'New York', state: 'NY' },
  ],
  mx: [
    { lat: 19.43, lng: -99.13, city: 'Ciudad de México', state: 'CDMX' },
    { lat: 25.67, lng: -100.31, city: 'Monterrey', state: 'NL' },
    { lat: 20.67, lng: -103.35, city: 'Guadalajara', state: 'JAL' },
    { lat: 19.04, lng: -98.21, city: 'Puebla', state: 'PUE' },
  ],
  uk: [
    { lat: 51.51, lng: -0.13, city: 'London', state: 'ENG' },
    { lat: 52.48, lng: -1.9, city: 'Birmingham', state: 'ENG' },
    { lat: 53.48, lng: -2.24, city: 'Manchester', state: 'ENG' },
    { lat: 53.8, lng: -1.55, city: 'Leeds', state: 'ENG' },
  ],
}

// ── Phone patterns ────────────────────────────────────────────────────────────

function generatePhone(region: RegionCode, rand: () => number): string {
  if (region === 'us') {
    const area = String(Math.floor(rand() * 800) + 200)
    const a = String(Math.floor(rand() * 900) + 100)
    const b = String(Math.floor(rand() * 9000) + 1000)
    return `+1 (${area}) ${a}-${b}`
  }
  if (region === 'mx') {
    const area = String(Math.floor(rand() * 90) + 10)
    const num = String(Math.floor(rand() * 90000000) + 10000000)
    return `+52 ${area} ${num.slice(0, 4)} ${num.slice(4)}`
  }
  const num = String(Math.floor(rand() * 9000000000) + 1000000000)
  return `+44 ${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`
}

function generateLicense(region: RegionCode, index: number, rand: () => number): string {
  if (region === 'us') {
    const states = ['TX', 'CA', 'FL', 'OH', 'PA', 'IL', 'GA', 'NC', 'MI', 'TN', 'AZ', 'NV']
    return `CDL-${states[index % states.length]}-${String(Math.floor(rand() * 9000000) + 1000000)}`
  }
  if (region === 'mx') {
    return `LF-${String(Math.floor(rand() * 90000000) + 10000000)}`
  }
  // UK — format: JONES 801106 AB1CD
  const suffix =
    String.fromCharCode(65 + Math.floor(rand() * 26)) +
    String(Math.floor(rand() * 9)) +
    String.fromCharCode(65 + Math.floor(rand() * 26)) +
    String.fromCharCode(65 + Math.floor(rand() * 26))
  return `DL-UK-${String(Math.floor(rand() * 900000) + 100000)}-${suffix}`
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

function generateHos(status: FleetDriverStatus, rand: () => number): FleetDriverHos {
  if (status === 'offline' || status === 'sleeper') {
    return {
      breakRemaining: 8,
      driveRemaining: 11,
      shiftRemaining: 14,
      cycleRemaining: 34 + Math.floor(rand() * 36),
      hoursToday: Math.round(rand() * 4 * 10) / 10,
      hoursThisWeek: Math.round((rand() * 30 + 10) * 10) / 10,
      hasViolation: false,
    }
  }

  if (status === 'driving') {
    const driveRemaining = Math.round((rand() * 8 + 1) * 10) / 10 // 1-9h remaining
    const shiftRemaining = Math.round((driveRemaining + rand() * 3) * 10) / 10
    return {
      breakRemaining: Math.round((rand() * 7 + 0.5) * 10) / 10,
      driveRemaining,
      shiftRemaining: Math.min(14, shiftRemaining),
      cycleRemaining: Math.round((rand() * 40 + 10) * 10) / 10,
      hoursToday: Math.round((11 - driveRemaining + rand() * 2) * 10) / 10,
      hoursThisWeek: Math.round((rand() * 35 + 20) * 10) / 10,
      hasViolation: rand() < 0.08,
    }
  }

  if (status === 'alert') {
    return {
      breakRemaining: Math.round(rand() * 1 * 10) / 10, // low
      driveRemaining: Math.round(rand() * 1.5 * 10) / 10,
      shiftRemaining: Math.round(rand() * 2 * 10) / 10,
      cycleRemaining: Math.round(rand() * 10 * 10) / 10,
      hoursToday: Math.round((rand() * 3 + 8) * 10) / 10,
      hoursThisWeek: Math.round((rand() * 10 + 55) * 10) / 10,
      hasViolation: true,
    }
  }

  // idle
  return {
    breakRemaining: Math.round((rand() * 6 + 2) * 10) / 10,
    driveRemaining: Math.round((rand() * 9 + 2) * 10) / 10,
    shiftRemaining: Math.round((rand() * 10 + 4) * 10) / 10,
    cycleRemaining: Math.round((rand() * 45 + 15) * 10) / 10,
    hoursToday: Math.round((rand() * 6 + 1) * 10) / 10,
    hoursThisWeek: Math.round((rand() * 30 + 15) * 10) / 10,
    hasViolation: rand() < 0.03,
  }
}

function generateDrivers(region: RegionCode, count: number): FleetDriver[] {
  const rand = seededRandom(region === 'us' ? 99 : region === 'mx' ? 201 : 333)
  const names = NAMES[region]
  const depots = DEPOTS[region]
  const drivers: FleetDriver[] = []

  const statuses: FleetDriverStatus[] = ['driving', 'idle', 'alert', 'offline', 'sleeper']
  const statusWeights = [0.35, 0.25, 0.08, 0.2, 0.12]

  for (let i = 0; i < count; i++) {
    const name = names[i % names.length]!
    const nameParts = name.split(' ')
    const initials = nameParts
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    // Pick status based on weighted distribution
    const r = rand()
    let cumulative = 0
    let status: FleetDriverStatus = 'driving'
    for (let s = 0; s < statuses.length; s++) {
      cumulative += statusWeights[s]!
      if (r < cumulative) {
        status = statuses[s]!
        break
      }
    }

    // Offline/sleeper drivers are at depots
    let location: GeoPoint
    if (status === 'offline' || status === 'sleeper') {
      const depot = depots[Math.floor(rand() * depots.length)]!
      location = {
        lat: Math.round((depot.lat + (rand() - 0.5) * 0.1) * 10000) / 10000,
        lng: Math.round((depot.lng + (rand() - 0.5) * 0.1) * 10000) / 10000,
        city: depot.city,
        state: depot.state,
      }
    } else {
      // Will be updated to vehicle location during linking
      const depot = depots[Math.floor(rand() * depots.length)]!
      location = {
        lat: Math.round((depot.lat + (rand() - 0.5) * 0.3) * 10000) / 10000,
        lng: Math.round((depot.lng + (rand() - 0.5) * 0.3) * 10000) / 10000,
        city: depot.city,
        state: depot.state,
      }
    }

    drivers.push({
      id: `DRV-${region.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      name,
      initials,
      phone: generatePhone(region, rand),
      licenseNumber: generateLicense(region, i, rand),
      status,
      vehicleId: null, // linked later
      vehicleUnitNumber: null,
      assetId: null, // linked later
      assetName: null,
      currentLocation: location,
      hos: generateHos(status, rand),
    })
  }

  return drivers
}

// ── Exports ───────────────────────────────────────────────────────────────────

export const mockFleetDriversUS = generateDrivers('us', 50)
export const mockFleetDriversMX = generateDrivers('mx', 50)
export const mockFleetDriversUK = generateDrivers('uk', 50)

export const fleetDriversByRegion: Record<RegionCode, FleetDriver[]> = {
  us: mockFleetDriversUS,
  mx: mockFleetDriversMX,
  uk: mockFleetDriversUK,
}
