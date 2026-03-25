import type { FuelLossEvent, FuelDropStatus } from '@motive/shared'

// ── Mock data helpers ────────────────────────────────────────
const now = new Date()

function ago(days = 0, hours = 0, minutes = 0): Date {
  return new Date(now.getTime() - days * 86_400_000 - hours * 3_600_000 - minutes * 60_000)
}

function addMins(date: Date, m: number): Date {
  return new Date(date.getTime() + m * 60_000)
}

// ── Seed data ────────────────────────────────────────────────
// 12 events with realistic Mexican fleet data, newest first
const seedEvents: FuelLossEvent[] = [
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

// ── Module-level singleton state ─────────────────────────────
const events = ref<FuelLossEvent[]>(seedEvents)
const filterSearch = ref('')
const filterMinDropPct = ref(0) // 0 = any
const filterStatus = ref<FuelDropStatus | 'all'>('all')
const selectedEvent = ref<FuelLossEvent | null>(null)

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
    events.value.filter((e) => {
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
    [...events.value].sort((a, b) => b.startTime.getTime() - a.startTime.getTime()).slice(0, 5),
  )

  const totalThisMonth = computed(() => events.value.length)
  const openCount = computed(() => events.value.filter((e) => e.status === 'open').length)

  const hasActiveFilters = computed(
    () => filterSearch.value !== '' || filterMinDropPct.value !== 0 || filterStatus.value !== 'all',
  )

  // ── Mutations ────────────────────────────────────────────
  function markReviewed(id: string) {
    const event = events.value.find((e) => e.id === id)
    if (event) event.status = 'reviewed'
  }

  function markDismissed(id: string) {
    const event = events.value.find((e) => e.id === id)
    if (event) event.status = 'dismissed'
    if (selectedEvent.value?.id === id) selectedEvent.value = null
  }

  function selectEvent(event: FuelLossEvent) {
    selectedEvent.value = selectedEvent.value?.id === event.id ? null : event
  }

  function clearSelectedEvent() {
    selectedEvent.value = null
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
    events,
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
