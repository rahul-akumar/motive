import type { ActivityEvent } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import type { RegionCode } from '~/composables/useRegion'

const now = new Date()
const mins = (m: number) => new Date(now.getTime() - m * 60000)

// ── US events ─────────────────────────────────────────────────────────────────
const mockEventsUS: ActivityEvent[] = [
  {
    id: 'evt-001',
    type: 'hos_violation',
    driverId: 'DRV-005',
    driverName: 'Derek Okafor',
    vehicleId: 'VEH-005',
    description: 'HOS violation: 11-hour driving limit exceeded',
    location: 'Atlanta, GA',
    timestamp: mins(4),
    severity: 'critical',
  },
  {
    id: 'evt-002',
    type: 'trip_completed',
    driverId: 'DRV-002',
    driverName: 'Sarah Chen',
    vehicleId: 'VEH-002',
    description: 'Load LOAD-8821 delivered to Riverside Distribution Center',
    location: 'Riverside, CA',
    timestamp: mins(12),
    severity: 'success',
  },
  {
    id: 'evt-003',
    type: 'hos_warning',
    driverId: 'DRV-004',
    driverName: 'Amanda Williams',
    vehicleId: 'VEH-004',
    description: 'HOS warning: 1.5 hours remaining on driving window',
    location: 'Chicago, IL',
    timestamp: mins(18),
    severity: 'warning',
  },
  {
    id: 'evt-004',
    type: 'trip_started',
    driverId: 'DRV-007',
    driverName: 'James Patel',
    vehicleId: 'VEH-007',
    description: 'Load LOAD-8852 picked up from Phoenix Freight Terminal',
    location: 'Phoenix, AZ',
    timestamp: mins(31),
    severity: 'info',
  },
  {
    id: 'evt-005',
    type: 'fuel_stop',
    driverId: 'DRV-001',
    driverName: 'Marcus Johnson',
    vehicleId: 'VEH-001',
    description: 'Fuel stop at Pilot Travel Center — 87 gallons',
    location: 'Fort Worth, TX',
    timestamp: mins(45),
    severity: 'info',
  },
  {
    id: 'evt-006',
    type: 'geofence_enter',
    driverId: 'DRV-009',
    driverName: 'Carlos Mendez',
    vehicleId: 'VEH-009',
    description: 'Entered Houston Distribution Zone geofence',
    location: 'Houston, TX',
    timestamp: mins(58),
    severity: 'info',
  },
  {
    id: 'evt-007',
    type: 'inspection_passed',
    driverId: 'DRV-003',
    driverName: 'Robert Torres',
    vehicleId: 'VEH-003',
    description: 'Pre-trip inspection completed — all systems nominal',
    location: 'Miami, FL',
    timestamp: mins(72),
    severity: 'success',
  },
  {
    id: 'evt-008',
    type: 'alert_triggered',
    driverId: 'DRV-004',
    driverName: 'Amanda Williams',
    vehicleId: 'VEH-004',
    description: 'Hard braking event detected — 0.4g deceleration',
    location: 'I-90 W, Chicago, IL',
    timestamp: mins(89),
    severity: 'warning',
  },
  {
    id: 'evt-009',
    type: 'trip_started',
    driverId: 'DRV-001',
    driverName: 'Marcus Johnson',
    vehicleId: 'VEH-001',
    description: 'Load LOAD-8821 picked up from Dallas Freight Hub',
    location: 'Dallas, TX',
    timestamp: mins(124),
    severity: 'info',
  },
  {
    id: 'evt-010',
    type: 'vehicle_idle',
    driverId: 'DRV-010',
    driverName: 'Rachel Kim',
    vehicleId: 'VEH-010',
    description: 'Vehicle idle for 45 minutes — engine running',
    location: 'Denver, CO',
    timestamp: mins(156),
    severity: 'warning',
  },
]

// ── MX events ─────────────────────────────────────────────────────────────────
const mockEventsMX: ActivityEvent[] = [
  {
    id: 'evt-mx-001',
    type: 'hos_violation',
    driverId: 'DRV-MX-005',
    driverName: 'Diego Hernández',
    vehicleId: 'VEH-MX-005',
    description: 'Infracción de jornada: límite de conducción de 11 horas excedido',
    location: 'Tijuana, BC',
    timestamp: mins(4),
    severity: 'critical',
  },
  {
    id: 'evt-mx-002',
    type: 'trip_completed',
    driverId: 'DRV-MX-002',
    driverName: 'Ana Martínez',
    vehicleId: 'VEH-MX-002',
    description: 'Carga CARGA-8834 entregada en Centro de Distribución Zapopan',
    location: 'Zapopan, JAL',
    timestamp: mins(12),
    severity: 'success',
  },
  {
    id: 'evt-mx-003',
    type: 'hos_warning',
    driverId: 'DRV-MX-004',
    driverName: 'Isabella Vargas',
    vehicleId: 'VEH-MX-004',
    description: 'Advertencia de jornada: 1.5 horas restantes en ventana de conducción',
    location: 'Puebla, PUE',
    timestamp: mins(18),
    severity: 'warning',
  },
  {
    id: 'evt-mx-004',
    type: 'trip_started',
    driverId: 'DRV-MX-007',
    driverName: 'Ricardo Castillo',
    vehicleId: 'VEH-MX-007',
    description: 'Carga CARGA-8852 recogida en Terminal de Carga Querétaro',
    location: 'Querétaro, QRO',
    timestamp: mins(31),
    severity: 'info',
  },
  {
    id: 'evt-mx-005',
    type: 'fuel_stop',
    driverId: 'DRV-MX-001',
    driverName: 'Carlos Fuentes',
    vehicleId: 'VEH-MX-001',
    description: 'Parada de combustible en PEMEX — 320 litros',
    location: 'Ecatepec, CDMX',
    timestamp: mins(45),
    severity: 'info',
  },
  {
    id: 'evt-mx-006',
    type: 'geofence_enter',
    driverId: 'DRV-MX-009',
    driverName: 'Javier Guzmán',
    vehicleId: 'VEH-MX-009',
    description: 'Ingresó a geocerca de Zona Industrial León',
    location: 'León, GTO',
    timestamp: mins(58),
    severity: 'info',
  },
  {
    id: 'evt-mx-007',
    type: 'inspection_passed',
    driverId: 'DRV-MX-003',
    driverName: 'Manuel Reyes',
    vehicleId: 'VEH-MX-003',
    description: 'Inspección pre-viaje completada — todos los sistemas nominales',
    location: 'Monterrey, NL',
    timestamp: mins(72),
    severity: 'success',
  },
  {
    id: 'evt-mx-008',
    type: 'alert_triggered',
    driverId: 'DRV-MX-004',
    driverName: 'Isabella Vargas',
    vehicleId: 'VEH-MX-004',
    description: 'Evento de frenado brusco detectado — deceleración de 0.4g',
    location: 'Autopista México-Puebla km 118',
    timestamp: mins(89),
    severity: 'warning',
  },
  {
    id: 'evt-mx-009',
    type: 'trip_started',
    driverId: 'DRV-MX-001',
    driverName: 'Carlos Fuentes',
    vehicleId: 'VEH-MX-001',
    description: 'Carga CARGA-8821 recogida en Hub de Carga Ciudad de México',
    location: 'CDMX',
    timestamp: mins(124),
    severity: 'info',
  },
  {
    id: 'evt-mx-010',
    type: 'vehicle_idle',
    driverId: 'DRV-MX-010',
    driverName: 'Valentina Cruz',
    vehicleId: 'VEH-MX-010',
    description: 'Vehículo en ralentí durante 45 minutos — motor en marcha',
    location: 'Saltillo, COAH',
    timestamp: mins(156),
    severity: 'warning',
  },
]

// ── UK events ─────────────────────────────────────────────────────────────────
const mockEventsUK: ActivityEvent[] = [
  {
    id: 'evt-uk-001',
    type: 'hos_violation',
    driverId: 'DRV-UK-005',
    driverName: 'Liam Robertson',
    vehicleId: 'VEH-UK-005',
    description: 'Tachograph violation: 4.5-hour driving limit exceeded without break',
    location: 'Glasgow, SCO',
    timestamp: mins(4),
    severity: 'critical',
  },
  {
    id: 'evt-uk-002',
    type: 'trip_completed',
    driverId: 'DRV-UK-002',
    driverName: 'Emily Clarke',
    vehicleId: 'VEH-UK-002',
    description: 'Consignment LOAD-UK-8834 delivered to Trafford Park Distribution Centre',
    location: 'Trafford Park, Manchester',
    timestamp: mins(12),
    severity: 'success',
  },
  {
    id: 'evt-uk-003',
    type: 'hos_warning',
    driverId: 'DRV-UK-004',
    driverName: 'Charlotte Davies',
    vehicleId: 'VEH-UK-004',
    description: 'Tachograph warning: 1.5 hours remaining on driving window',
    location: 'Leeds, ENG',
    timestamp: mins(18),
    severity: 'warning',
  },
  {
    id: 'evt-uk-004',
    type: 'trip_started',
    driverId: 'DRV-UK-007',
    driverName: 'Henry Thornton',
    vehicleId: 'VEH-UK-007',
    description: 'Consignment LOAD-UK-8852 collected from Bristol Freight Terminal',
    location: 'Bristol, ENG',
    timestamp: mins(31),
    severity: 'info',
  },
  {
    id: 'evt-uk-005',
    type: 'fuel_stop',
    driverId: 'DRV-UK-001',
    driverName: 'James Whitfield',
    vehicleId: 'VEH-UK-001',
    description: 'Fuel stop at Moto Services — 240 litres',
    location: 'M25 J10, Surrey',
    timestamp: mins(45),
    severity: 'info',
  },
  {
    id: 'evt-uk-006',
    type: 'geofence_enter',
    driverId: 'DRV-UK-009',
    driverName: 'William Foster',
    vehicleId: 'VEH-UK-009',
    description: 'Entered Sheffield Steel Park geofence',
    location: 'Sheffield, ENG',
    timestamp: mins(58),
    severity: 'info',
  },
  {
    id: 'evt-uk-007',
    type: 'inspection_passed',
    driverId: 'DRV-UK-003',
    driverName: 'Oliver Murphy',
    vehicleId: 'VEH-UK-003',
    description: 'Walkaround check completed — all systems nominal',
    location: 'Birmingham, ENG',
    timestamp: mins(72),
    severity: 'success',
  },
  {
    id: 'evt-uk-008',
    type: 'alert_triggered',
    driverId: 'DRV-UK-004',
    driverName: 'Charlotte Davies',
    vehicleId: 'VEH-UK-004',
    description: 'Harsh braking event detected — 0.4g deceleration',
    location: 'M62 W, West Yorkshire',
    timestamp: mins(89),
    severity: 'warning',
  },
  {
    id: 'evt-uk-009',
    type: 'trip_started',
    driverId: 'DRV-UK-001',
    driverName: 'James Whitfield',
    vehicleId: 'VEH-UK-001',
    description: 'Consignment LOAD-UK-8821 collected from London Gateway',
    location: 'London Gateway, ENG',
    timestamp: mins(124),
    severity: 'info',
  },
  {
    id: 'evt-uk-010',
    type: 'vehicle_idle',
    driverId: 'DRV-UK-010',
    driverName: 'Grace Hammond',
    vehicleId: 'VEH-UK-010',
    description: 'Vehicle idle for 45 minutes — engine running',
    location: 'Cardiff, WAL',
    timestamp: mins(156),
    severity: 'warning',
  },
]

// ── Region map ────────────────────────────────────────────────────────────────
const eventsByRegion: Record<RegionCode, ActivityEvent[]> = {
  us: mockEventsUS,
  mx: mockEventsMX,
  uk: mockEventsUK,
}

export function useActivityFeed() {
  const events = computed<ActivityEvent[]>(() => eventsByRegion[currentRegion.value])
  const displayCount = ref(6)

  const visibleEvents = computed(() => events.value.slice(0, displayCount.value))
  const hasMore = computed(() => displayCount.value < events.value.length)

  // Reset display count when region changes
  watch(currentRegion, () => {
    displayCount.value = 6
  })

  function loadMore() {
    displayCount.value = Math.min(displayCount.value + 4, events.value.length)
  }

  function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  return { events, visibleEvents, hasMore, loadMore, formatRelativeTime }
}
