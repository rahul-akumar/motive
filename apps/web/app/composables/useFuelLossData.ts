import type { FuelLossEvent, FuelDropStatus } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import type { RegionCode } from '~/composables/useRegion'

// ── Mock data helpers ────────────────────────────────────────
const now = new Date()

function ago(days = 0, hours = 0, minutes = 0): Date {
  return new Date(now.getTime() - days * 86_400_000 - hours * 3_600_000 - minutes * 60_000)
}

function addMins(date: Date, m: number): Date {
  return new Date(date.getTime() + m * 60_000)
}

// ── US seed events ───────────────────────────────────────────
const seedEventsUS: FuelLossEvent[] = [
  {
    id: 'fl-us-001',
    vehicleId: 'VEH-009',
    vehicleName: 'Unit 009',
    driverId: 'DRV-009',
    driverName: 'Carlos Mendez',
    location: { lat: 29.7604, lng: -95.3698, address: 'US-90 W, Houston, TX' },
    startTime: ago(0, 0, 35),
    endTime: addMins(ago(0, 0, 35), 14),
    fuelStart: 72,
    fuelEnd: 61,
    fuelDrop: 11,
    status: 'open',
  },
  {
    id: 'fl-us-002',
    vehicleId: 'VEH-001',
    vehicleName: 'Truck 001',
    driverId: 'DRV-001',
    driverName: 'Marcus Johnson',
    location: { lat: 32.7767, lng: -96.797, address: 'I-20 W, Dallas, TX' },
    startTime: ago(0, 2, 15),
    endTime: addMins(ago(0, 2, 15), 15),
    fuelStart: 68,
    fuelEnd: 53,
    fuelDrop: 15,
    status: 'open',
  },
  {
    id: 'fl-us-003',
    vehicleId: 'VEH-007',
    vehicleName: 'Truck 007',
    location: { lat: 33.4484, lng: -112.074, address: 'I-10 E, Phoenix, AZ' },
    startTime: ago(0, 3, 10),
    endTime: addMins(ago(0, 3, 10), 10),
    fuelStart: 81,
    fuelEnd: 72,
    fuelDrop: 9,
    status: 'open',
  },
  {
    id: 'fl-us-004',
    vehicleId: 'VEH-005',
    vehicleName: 'Truck 005',
    driverId: 'DRV-005',
    driverName: 'Derek Okafor',
    location: { lat: 33.749, lng: -84.388, address: 'I-285 S, Atlanta, GA' },
    startTime: ago(0, 5, 20),
    endTime: addMins(ago(0, 5, 20), 20),
    fuelStart: 89,
    fuelEnd: 71,
    fuelDrop: 18,
    status: 'open',
  },
  {
    id: 'fl-us-005',
    vehicleId: 'VEH-004',
    vehicleName: 'Truck 004',
    driverId: 'DRV-004',
    driverName: 'Amanda Williams',
    location: { lat: 41.8781, lng: -87.6298, address: 'I-90 W, Chicago, IL' },
    startTime: ago(1, 2, 0),
    endTime: addMins(ago(1, 2, 0), 12),
    fuelStart: 74,
    fuelEnd: 67,
    fuelDrop: 7,
    status: 'reviewed',
  },
  {
    id: 'fl-us-006',
    vehicleId: 'VEH-002',
    vehicleName: 'Truck 002',
    driverId: 'DRV-002',
    driverName: 'Sarah Chen',
    location: { lat: 34.0522, lng: -118.2437, address: 'I-5 N, Los Angeles, CA' },
    startTime: ago(1, 9, 0),
    endTime: addMins(ago(1, 9, 0), 12),
    fuelStart: 77,
    fuelEnd: 69,
    fuelDrop: 8,
    status: 'open',
  },
  {
    id: 'fl-us-007',
    vehicleId: 'VEH-003',
    vehicleName: 'Truck 003',
    driverId: 'DRV-003',
    driverName: 'Robert Torres',
    location: { lat: 25.7617, lng: -80.1918, address: 'Florida Turnpike, Miami, FL' },
    startTime: ago(2, 4, 0),
    endTime: addMins(ago(2, 4, 0), 14),
    fuelStart: 85,
    fuelEnd: 71,
    fuelDrop: 14,
    status: 'open',
  },
  {
    id: 'fl-us-008',
    vehicleId: 'VEH-008',
    vehicleName: 'Truck 008',
    driverId: 'DRV-008',
    driverName: 'Tanya Brooks',
    location: { lat: 40.7128, lng: -74.006, address: 'I-95 S, Newark, NJ' },
    startTime: ago(3, 1, 30),
    endTime: addMins(ago(3, 1, 30), 12),
    fuelStart: 91,
    fuelEnd: 79,
    fuelDrop: 12,
    status: 'reviewed',
  },
  {
    id: 'fl-us-009',
    vehicleId: 'VEH-006',
    vehicleName: 'Truck 006',
    driverId: 'DRV-006',
    driverName: 'Lisa Nguyen',
    location: { lat: 47.6062, lng: -122.3321, address: 'I-5 S, Seattle, WA' },
    startTime: ago(3, 7, 0),
    endTime: addMins(ago(3, 7, 0), 6),
    fuelStart: 56,
    fuelEnd: 52,
    fuelDrop: 4,
    status: 'dismissed',
  },
  {
    id: 'fl-us-010',
    vehicleId: 'VEH-010',
    vehicleName: 'Truck 010',
    driverId: 'DRV-010',
    driverName: 'Rachel Kim',
    location: { lat: 39.7392, lng: -104.9903, address: 'I-70 E, Denver, CO' },
    startTime: ago(4, 3, 0),
    endTime: addMins(ago(4, 3, 0), 7),
    fuelStart: 63,
    fuelEnd: 58,
    fuelDrop: 5,
    status: 'reviewed',
  },
  {
    id: 'fl-us-011',
    vehicleId: 'VEH-007',
    vehicleName: 'Truck 007',
    driverId: 'DRV-007',
    driverName: 'James Patel',
    location: { lat: 33.4484, lng: -112.074, address: 'I-17 N, Phoenix, AZ' },
    startTime: ago(5, 11, 0),
    endTime: addMins(ago(5, 11, 0), 11),
    fuelStart: 79,
    fuelEnd: 73,
    fuelDrop: 6,
    status: 'reviewed',
  },
  {
    id: 'fl-us-012',
    vehicleId: 'VEH-009',
    vehicleName: 'Unit 009',
    location: { lat: 29.7604, lng: -95.3698, address: 'Beltway 8, Houston, TX' },
    startTime: ago(7, 2, 0),
    endTime: addMins(ago(7, 2, 0), 5),
    fuelStart: 44,
    fuelEnd: 41,
    fuelDrop: 3,
    status: 'dismissed',
  },
]

// ── UK seed events ───────────────────────────────────────────
const seedEventsUK: FuelLossEvent[] = [
  {
    id: 'fl-uk-001',
    vehicleId: 'VEH-UK-009',
    vehicleName: 'Lorry 009',
    driverId: 'DRV-UK-009',
    driverName: 'William Foster',
    location: { lat: 53.3811, lng: -1.4701, address: 'M1 J33, Sheffield, ENG' },
    startTime: ago(0, 0, 28),
    endTime: addMins(ago(0, 0, 28), 11),
    fuelStart: 78,
    fuelEnd: 67,
    fuelDrop: 11,
    status: 'open',
  },
  {
    id: 'fl-uk-002',
    vehicleId: 'VEH-UK-001',
    vehicleName: 'Lorry 001',
    driverId: 'DRV-UK-001',
    driverName: 'James Whitfield',
    location: { lat: 51.5074, lng: -0.1278, address: 'A406 N Circular, London' },
    startTime: ago(0, 1, 55),
    endTime: addMins(ago(0, 1, 55), 16),
    fuelStart: 65,
    fuelEnd: 50,
    fuelDrop: 15,
    status: 'open',
  },
  {
    id: 'fl-uk-003',
    vehicleId: 'VEH-UK-007',
    vehicleName: 'Lorry 007',
    location: { lat: 51.4545, lng: -2.5879, address: 'M5 J15, Bristol, ENG' },
    startTime: ago(0, 3, 5),
    endTime: addMins(ago(0, 3, 5), 9),
    fuelStart: 83,
    fuelEnd: 75,
    fuelDrop: 8,
    status: 'open',
  },
  {
    id: 'fl-uk-004',
    vehicleId: 'VEH-UK-005',
    vehicleName: 'Lorry 005',
    driverId: 'DRV-UK-005',
    driverName: 'Liam Robertson',
    location: { lat: 55.8642, lng: -4.2518, address: 'M74 J1, Glasgow, SCO' },
    startTime: ago(0, 4, 50),
    endTime: addMins(ago(0, 4, 50), 19),
    fuelStart: 91,
    fuelEnd: 74,
    fuelDrop: 17,
    status: 'open',
  },
  {
    id: 'fl-uk-005',
    vehicleId: 'VEH-UK-004',
    vehicleName: 'Lorry 004',
    driverId: 'DRV-UK-004',
    driverName: 'Charlotte Davies',
    location: { lat: 53.8008, lng: -1.5491, address: 'M62 J26, Leeds, ENG' },
    startTime: ago(1, 1, 30),
    endTime: addMins(ago(1, 1, 30), 13),
    fuelStart: 71,
    fuelEnd: 64,
    fuelDrop: 7,
    status: 'reviewed',
  },
  {
    id: 'fl-uk-006',
    vehicleId: 'VEH-UK-002',
    vehicleName: 'Lorry 002',
    driverId: 'DRV-UK-002',
    driverName: 'Emily Clarke',
    location: { lat: 53.4808, lng: -2.2426, address: 'M60 J12, Manchester, ENG' },
    startTime: ago(1, 8, 0),
    endTime: addMins(ago(1, 8, 0), 10),
    fuelStart: 74,
    fuelEnd: 66,
    fuelDrop: 8,
    status: 'open',
  },
  {
    id: 'fl-uk-007',
    vehicleId: 'VEH-UK-003',
    vehicleName: 'Lorry 003',
    driverId: 'DRV-UK-003',
    driverName: 'Oliver Murphy',
    location: { lat: 52.4862, lng: -1.8904, address: 'M6 J6, Birmingham, ENG' },
    startTime: ago(2, 3, 0),
    endTime: addMins(ago(2, 3, 0), 14),
    fuelStart: 86,
    fuelEnd: 72,
    fuelDrop: 14,
    status: 'open',
  },
  {
    id: 'fl-uk-008',
    vehicleId: 'VEH-UK-008',
    vehicleName: 'Lorry 008',
    driverId: 'DRV-UK-008',
    driverName: 'Emma Pearson',
    location: { lat: 53.4084, lng: -2.9916, address: 'M57 J4, Liverpool, ENG' },
    startTime: ago(3, 0, 45),
    endTime: addMins(ago(3, 0, 45), 11),
    fuelStart: 89,
    fuelEnd: 78,
    fuelDrop: 11,
    status: 'reviewed',
  },
  {
    id: 'fl-uk-009',
    vehicleId: 'VEH-UK-006',
    vehicleName: 'Lorry 006',
    driverId: 'DRV-UK-006',
    driverName: 'Sophie Blackwood',
    location: { lat: 55.9533, lng: -3.1883, address: 'A720 E, Edinburgh, SCO' },
    startTime: ago(3, 6, 0),
    endTime: addMins(ago(3, 6, 0), 6),
    fuelStart: 53,
    fuelEnd: 49,
    fuelDrop: 4,
    status: 'dismissed',
  },
  {
    id: 'fl-uk-010',
    vehicleId: 'VEH-UK-010',
    vehicleName: 'Lorry 010',
    driverId: 'DRV-UK-010',
    driverName: 'Grace Hammond',
    location: { lat: 51.4816, lng: -3.1791, address: 'M4 J30, Cardiff, WAL' },
    startTime: ago(4, 2, 0),
    endTime: addMins(ago(4, 2, 0), 8),
    fuelStart: 60,
    fuelEnd: 55,
    fuelDrop: 5,
    status: 'reviewed',
  },
  {
    id: 'fl-uk-011',
    vehicleId: 'VEH-UK-007',
    vehicleName: 'Lorry 007',
    driverId: 'DRV-UK-007',
    driverName: 'Henry Thornton',
    location: { lat: 51.4545, lng: -2.5879, address: 'A38 N, Bristol, ENG' },
    startTime: ago(5, 10, 0),
    endTime: addMins(ago(5, 10, 0), 12),
    fuelStart: 77,
    fuelEnd: 71,
    fuelDrop: 6,
    status: 'reviewed',
  },
  {
    id: 'fl-uk-012',
    vehicleId: 'VEH-UK-009',
    vehicleName: 'Lorry 009',
    location: { lat: 53.3811, lng: -1.4701, address: 'A57 E, Sheffield, ENG' },
    startTime: ago(7, 1, 0),
    endTime: addMins(ago(7, 1, 0), 5),
    fuelStart: 41,
    fuelEnd: 38,
    fuelDrop: 3,
    status: 'dismissed',
  },
]

// ── MX seed events (existing) ────────────────────────────────
const seedEventsMX: FuelLossEvent[] = [
  {
    id: 'fl-001',
    vehicleId: 'VEH-MX-14',
    vehicleName: 'Trailer 47',
    location: {
      lat: 25.6751,
      lng: -100.3189,
      address: 'Blvd. Díaz Ordaz 150, Monterrey, NL',
    },
    startTime: ago(0, 0, 35),
    endTime: addMins(ago(0, 0, 35), 14),
    fuelStart: 72,
    fuelEnd: 61,
    fuelDrop: 11,
    status: 'open',
  },
  {
    id: 'fl-002',
    vehicleId: 'VEH-MX-01',
    vehicleName: 'Unidad 041',
    driverId: 'DRV-MX-01',
    driverName: 'Roberto Fuentes',
    location: {
      lat: 25.6866,
      lng: -100.3161,
      address: 'Av. Constitución 4520, Monterrey, NL',
    },
    startTime: ago(0, 2, 15),
    endTime: addMins(ago(0, 2, 15), 15),
    fuelStart: 68,
    fuelEnd: 53,
    fuelDrop: 15,
    status: 'open',
  },
  {
    id: 'fl-003',
    vehicleId: 'VEH-MX-07',
    vehicleName: 'Tractocamión 11',
    location: {
      lat: 19.0414,
      lng: -98.2063,
      address: 'Circunvalación Poniente km 4, Puebla, PUE',
    },
    startTime: ago(0, 3, 10),
    endTime: addMins(ago(0, 3, 10), 10),
    fuelStart: 81,
    fuelEnd: 72,
    fuelDrop: 9,
    status: 'open',
  },
  {
    id: 'fl-004',
    vehicleId: 'VEH-MX-04',
    vehicleName: 'Pipa 08',
    driverId: 'DRV-MX-04',
    driverName: 'Carlos Valdez',
    location: {
      lat: 25.4232,
      lng: -100.9936,
      address: 'Carr. Saltillo-Monterrey km 28, Saltillo, COAH',
    },
    startTime: ago(0, 5, 20),
    endTime: addMins(ago(0, 5, 20), 20),
    fuelStart: 89,
    fuelEnd: 71,
    fuelDrop: 18,
    status: 'open',
  },
  {
    id: 'fl-005',
    vehicleId: 'VEH-MX-09',
    vehicleName: 'Unidad 017',
    driverId: 'DRV-MX-09',
    driverName: 'Miguel Torres',
    location: {
      lat: 20.6597,
      lng: -103.3496,
      address: 'Av. Vallarta 3233, Guadalajara, JAL',
    },
    startTime: ago(1, 2, 0),
    endTime: addMins(ago(1, 2, 0), 12),
    fuelStart: 74,
    fuelEnd: 67,
    fuelDrop: 7,
    status: 'reviewed',
  },
  {
    id: 'fl-006',
    vehicleId: 'VEH-MX-12',
    vehicleName: 'Pipa 14',
    driverId: 'DRV-MX-12',
    driverName: 'Ricardo Morales',
    location: {
      lat: 28.6353,
      lng: -106.0889,
      address: 'Av. División del Norte 3001, Chihuahua, CHIH',
    },
    startTime: ago(1, 9, 0),
    endTime: addMins(ago(1, 9, 0), 12),
    fuelStart: 77,
    fuelEnd: 69,
    fuelDrop: 8,
    status: 'open',
  },
  {
    id: 'fl-007',
    vehicleId: 'VEH-MX-02',
    vehicleName: 'Tractocamión 05',
    driverId: 'DRV-MX-02',
    driverName: 'Pedro Jiménez',
    location: {
      lat: 19.1738,
      lng: -96.1342,
      address: 'Blvd. Manuel Ávila Camacho s/n, Veracruz, VER',
    },
    startTime: ago(2, 4, 0),
    endTime: addMins(ago(2, 4, 0), 14),
    fuelStart: 85,
    fuelEnd: 71,
    fuelDrop: 14,
    status: 'open',
  },
  {
    id: 'fl-008',
    vehicleId: 'VEH-MX-06',
    vehicleName: 'Trailer 23',
    driverId: 'DRV-MX-06',
    driverName: 'José Hernández',
    location: {
      lat: 19.4326,
      lng: -99.1332,
      address: 'Eje 3 Ote. 300, Iztapalapa, CDMX',
    },
    startTime: ago(3, 1, 30),
    endTime: addMins(ago(3, 1, 30), 12),
    fuelStart: 91,
    fuelEnd: 79,
    fuelDrop: 12,
    status: 'reviewed',
  },
  {
    id: 'fl-009',
    vehicleId: 'VEH-MX-11',
    vehicleName: 'Unidad 033',
    driverId: 'DRV-MX-11',
    driverName: 'Alejandro García',
    location: {
      lat: 25.6602,
      lng: -100.3476,
      address: 'Av. Morones Prieto 2800, San Nicolás, NL',
    },
    startTime: ago(3, 7, 0),
    endTime: addMins(ago(3, 7, 0), 6),
    fuelStart: 56,
    fuelEnd: 52,
    fuelDrop: 4,
    status: 'dismissed',
  },
  {
    id: 'fl-010',
    vehicleId: 'VEH-MX-05',
    vehicleName: 'Unidad 055',
    driverId: 'DRV-MX-05',
    driverName: 'Luis Ramírez',
    location: {
      lat: 20.5881,
      lng: -100.3876,
      address: 'Av. 5 de Febrero 100, Querétaro, QRO',
    },
    startTime: ago(4, 3, 0),
    endTime: addMins(ago(4, 3, 0), 7),
    fuelStart: 63,
    fuelEnd: 58,
    fuelDrop: 5,
    status: 'reviewed',
  },
  {
    id: 'fl-011',
    vehicleId: 'VEH-MX-08',
    vehicleName: 'Unidad 022',
    driverId: 'DRV-MX-08',
    driverName: 'Fernando Cruz',
    location: {
      lat: 22.1565,
      lng: -100.9855,
      address: 'Av. Venustiano Carranza 2180, San Luis Potosí, SLP',
    },
    startTime: ago(5, 11, 0),
    endTime: addMins(ago(5, 11, 0), 11),
    fuelStart: 79,
    fuelEnd: 73,
    fuelDrop: 6,
    status: 'reviewed',
  },
  {
    id: 'fl-012',
    vehicleId: 'VEH-MX-03',
    vehicleName: 'Unidad 038',
    location: {
      lat: 19.3587,
      lng: -99.0754,
      address: 'Calz. de la Viga 1200, Iztacalco, CDMX',
    },
    startTime: ago(7, 2, 0),
    endTime: addMins(ago(7, 2, 0), 5),
    fuelStart: 44,
    fuelEnd: 41,
    fuelDrop: 3,
    status: 'dismissed',
  },
]

// ── Region seed map ──────────────────────────────────────────
const seedEventsByRegion: Record<RegionCode, FuelLossEvent[]> = {
  us: seedEventsUS,
  mx: seedEventsMX,
  uk: seedEventsUK,
}

// ── Module-level singleton state ─────────────────────────────
// Mutation overrides: { eventId → overridden status } per region
const mutationOverrides = ref<Record<string, FuelDropStatus>>({})
const selectedEventId = ref<string | null>(null)
const filterSearch = ref('')
const filterMinDropPct = ref(0)
const filterStatus = ref<FuelDropStatus | 'all'>('all')

// Reset mutation/filter state whenever region changes
watch(currentRegion, () => {
  mutationOverrides.value = {}
  selectedEventId.value = null
  filterSearch.value = ''
  filterMinDropPct.value = 0
  filterStatus.value = 'all'
})

// Base events for current region (with mutation overrides applied)
const baseEvents = computed<FuelLossEvent[]>(() =>
  seedEventsByRegion[currentRegion.value].map((e) => ({
    ...e,
    status: (mutationOverrides.value[e.id] ?? e.status) as FuelDropStatus,
  })),
)

let initialToastShown = false

export function useFuelLossData() {
  const { showToast } = useToast()

  // Fire a simulated real-time detection toast once per session
  if (!initialToastShown && import.meta.client) {
    initialToastShown = true
    setTimeout(() => {
      showToast({
        variant: 'critical',
        message: 'Fuel Loss Alert — Pipa 08',
        subtext: 'Tank dropped 18% · Saltillo, COAH · just now',
        actionLabel: 'View',
        duration: 6000,
      })
    }, 1800)
  }

  // ── Computed ─────────────────────────────────────────────
  const filteredEvents = computed(() =>
    baseEvents.value.filter((e) => {
      if (
        filterSearch.value &&
        !e.vehicleName.toLowerCase().includes(filterSearch.value.toLowerCase()) &&
        !(e.driverName ?? '').toLowerCase().includes(filterSearch.value.toLowerCase())
      ) {
        return false
      }
      if (filterMinDropPct.value > 0 && e.fuelDrop < filterMinDropPct.value) {
        return false
      }
      if (filterStatus.value !== 'all' && e.status !== filterStatus.value) {
        return false
      }
      return true
    }),
  )

  // For the right panel — always shows all events, unfiltered
  const recentEvents = computed(() =>
    [...baseEvents.value].sort((a, b) => b.startTime.getTime() - a.startTime.getTime()).slice(0, 5),
  )

  const totalThisMonth = computed(() => baseEvents.value.length)
  const openCount = computed(() => baseEvents.value.filter((e) => e.status === 'open').length)

  const hasActiveFilters = computed(
    () => filterSearch.value !== '' || filterMinDropPct.value !== 0 || filterStatus.value !== 'all',
  )

  const selectedEvent = computed<FuelLossEvent | null>(
    () => baseEvents.value.find((e) => e.id === selectedEventId.value) ?? null,
  )

  // ── Mutations ────────────────────────────────────────────
  function markReviewed(id: string) {
    mutationOverrides.value = { ...mutationOverrides.value, [id]: 'reviewed' }
  }

  function markDismissed(id: string) {
    mutationOverrides.value = { ...mutationOverrides.value, [id]: 'dismissed' }
    if (selectedEventId.value === id) selectedEventId.value = null
  }

  function selectEvent(event: FuelLossEvent) {
    selectedEventId.value = selectedEventId.value === event.id ? null : event.id
  }

  function clearSelectedEvent() {
    selectedEventId.value = null
  }

  function clearFilters() {
    filterSearch.value = ''
    filterMinDropPct.value = 0
    filterStatus.value = 'all'
  }

  // ── CSV Export ───────────────────────────────────────────
  function exportCsv() {
    if (!import.meta.client) return

    const headers = [
      'Vehicle',
      'Driver',
      'Date',
      'Start Time',
      'End Time',
      'Duration (min)',
      'Location',
      'Fuel Start %',
      'Fuel End %',
      'Fuel Drop %',
      'Status',
    ]

    const formatDate = (d: Date) =>
      new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const formatTime = (d: Date) =>
      new Date(d).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    const duration = (start: Date, end: Date) =>
      Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000)

    const rows = filteredEvents.value.map((e) => [
      e.vehicleName,
      e.driverName ?? '',
      formatDate(e.startTime),
      formatTime(e.startTime),
      formatTime(e.endTime),
      duration(e.startTime, e.endTime),
      e.location.address,
      e.fuelStart,
      e.fuelEnd,
      e.fuelDrop,
      e.status,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fuel-loss-events-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    events: baseEvents,
    filteredEvents,
    filterSearch,
    filterMinDropPct,
    filterStatus,
    hasActiveFilters,
    recentEvents,
    totalThisMonth,
    openCount,
    selectedEvent,
    selectEvent,
    clearSelectedEvent,
    markReviewed,
    markDismissed,
    clearFilters,
    exportCsv,
  }
}
