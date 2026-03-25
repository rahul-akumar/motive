import type { FleetAlert } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import type { RegionCode } from '~/composables/useRegion'

const now = new Date()
const mins = (m: number) => new Date(now.getTime() - m * 60000)

// ── US alerts ─────────────────────────────────────────────────────────────────
const initialAlertsUS: FleetAlert[] = [
  {
    id: 'alert-001',
    severity: 'critical',
    title: 'HOS Violation — Derek Okafor',
    description:
      'Driver has exceeded the 11-hour driving limit. Immediate action required. Vehicle must stop.',
    driverId: 'DRV-005',
    driverName: 'Derek Okafor',
    vehicleId: 'VEH-005',
    timestamp: mins(4),
    dismissed: false,
    actionLabel: 'Contact Driver',
  },
  {
    id: 'alert-002',
    severity: 'critical',
    title: 'Speeding Alert — Amanda Williams',
    description: 'Vehicle traveling at 82 mph in a 65 mph zone on I-90 W near Chicago.',
    driverId: 'DRV-004',
    driverName: 'Amanda Williams',
    vehicleId: 'VEH-004',
    timestamp: mins(11),
    dismissed: false,
    actionLabel: 'View Location',
  },
  {
    id: 'alert-003',
    severity: 'critical',
    title: 'Unplanned Stop — Carlos Mendez',
    description:
      'Vehicle stopped for 28 minutes outside designated route corridor near Beaumont, TX.',
    driverId: 'DRV-009',
    driverName: 'Carlos Mendez',
    vehicleId: 'VEH-009',
    timestamp: mins(28),
    dismissed: false,
    actionLabel: 'View Route',
  },
  {
    id: 'alert-004',
    severity: 'warning',
    title: 'Low HOS — Amanda Williams',
    description: '1.5 hours remaining on driving window. Driver should plan for rest stop.',
    driverId: 'DRV-004',
    driverName: 'Amanda Williams',
    vehicleId: 'VEH-004',
    timestamp: mins(18),
    dismissed: false,
  },
  {
    id: 'alert-005',
    severity: 'warning',
    title: 'Low Fuel — Marcus Johnson',
    description: 'Vehicle fuel level at 18%. Next fuel stop recommended within 80 miles.',
    driverId: 'DRV-001',
    driverName: 'Marcus Johnson',
    vehicleId: 'VEH-001',
    timestamp: mins(35),
    dismissed: false,
  },
  {
    id: 'alert-006',
    severity: 'warning',
    title: 'Hard Braking Event',
    description: 'Hard braking detected on I-90 W. Review driver coaching report.',
    driverId: 'DRV-004',
    driverName: 'Amanda Williams',
    vehicleId: 'VEH-004',
    timestamp: mins(89),
    dismissed: false,
  },
  {
    id: 'alert-007',
    severity: 'info',
    title: 'Scheduled Maintenance Due',
    description: 'VEH-006 (Volvo VNL 860) is due for 90,000-mile service in 3 days.',
    vehicleId: 'VEH-006',
    timestamp: mins(120),
    dismissed: false,
  },
  {
    id: 'alert-008',
    severity: 'critical',
    title: 'Fuel Loss Alert — Pipa 08',
    description:
      'Tank dropped 18% over 20 minutes while stopped. Possible fuel theft near Saltillo, COAH.',
    vehicleId: 'VEH-MX-04',
    driverName: 'Carlos Valdez',
    timestamp: mins(5),
    dismissed: false,
    actionLabel: 'View Event',
  },
]

// ── MX alerts ─────────────────────────────────────────────────────────────────
const initialAlertsMX: FleetAlert[] = [
  {
    id: 'alert-mx-001',
    severity: 'critical',
    title: 'Infracción de Jornada — Diego Hernández',
    description:
      'Conductor excedió el límite de conducción de 11 horas. Acción inmediata requerida. Vehículo debe detenerse.',
    driverId: 'DRV-MX-005',
    driverName: 'Diego Hernández',
    vehicleId: 'VEH-MX-005',
    timestamp: mins(4),
    dismissed: false,
    actionLabel: 'Contactar Conductor',
  },
  {
    id: 'alert-mx-002',
    severity: 'critical',
    title: 'Alerta de Velocidad — Isabella Vargas',
    description: 'Vehículo viajando a 130 km/h en zona de 100 km/h en Autopista México-Puebla.',
    driverId: 'DRV-MX-004',
    driverName: 'Isabella Vargas',
    vehicleId: 'VEH-MX-004',
    timestamp: mins(11),
    dismissed: false,
    actionLabel: 'Ver Ubicación',
  },
  {
    id: 'alert-mx-003',
    severity: 'critical',
    title: 'Parada No Planificada — Javier Guzmán',
    description:
      'Vehículo detenido 28 minutos fuera del corredor de ruta designado cerca de Silao, GTO.',
    driverId: 'DRV-MX-009',
    driverName: 'Javier Guzmán',
    vehicleId: 'VEH-MX-009',
    timestamp: mins(28),
    dismissed: false,
    actionLabel: 'Ver Ruta',
  },
  {
    id: 'alert-mx-004',
    severity: 'warning',
    title: 'Jornada Baja — Isabella Vargas',
    description:
      '1.5 horas restantes en ventana de conducción. Conductor debe planificar descanso.',
    driverId: 'DRV-MX-004',
    driverName: 'Isabella Vargas',
    vehicleId: 'VEH-MX-004',
    timestamp: mins(18),
    dismissed: false,
  },
  {
    id: 'alert-mx-005',
    severity: 'warning',
    title: 'Combustible Bajo — Carlos Fuentes',
    description: 'Nivel de combustible al 18%. Próxima parada recomendada dentro de 120 km.',
    driverId: 'DRV-MX-001',
    driverName: 'Carlos Fuentes',
    vehicleId: 'VEH-MX-001',
    timestamp: mins(35),
    dismissed: false,
  },
  {
    id: 'alert-mx-006',
    severity: 'warning',
    title: 'Frenado Brusco Detectado',
    description: 'Frenado brusco detectado en Autopista Méx-Pue. Revisar informe de conducción.',
    driverId: 'DRV-MX-004',
    driverName: 'Isabella Vargas',
    vehicleId: 'VEH-MX-004',
    timestamp: mins(89),
    dismissed: false,
  },
  {
    id: 'alert-mx-007',
    severity: 'info',
    title: 'Mantenimiento Programado Próximo',
    description: 'VEH-MX-006 (Volvo FH) vence servicio de 150,000 km en 3 días.',
    vehicleId: 'VEH-MX-006',
    timestamp: mins(120),
    dismissed: false,
  },
  {
    id: 'alert-mx-008',
    severity: 'critical',
    title: 'Pérdida de Combustible — Unidad 041',
    description:
      'Tanque descendió 15% en 15 minutos mientras estaba detenido. Posible robo de combustible en Monterrey, NL.',
    vehicleId: 'VEH-MX-001',
    driverName: 'Roberto Fuentes',
    timestamp: mins(5),
    dismissed: false,
    actionLabel: 'Ver Evento',
  },
]

// ── UK alerts ─────────────────────────────────────────────────────────────────
const initialAlertsUK: FleetAlert[] = [
  {
    id: 'alert-uk-001',
    severity: 'critical',
    title: 'Tachograph Violation — Liam Robertson',
    description:
      'Driver has exceeded the 4.5-hour continuous driving limit without a mandatory break.',
    driverId: 'DRV-UK-005',
    driverName: 'Liam Robertson',
    vehicleId: 'VEH-UK-005',
    timestamp: mins(4),
    dismissed: false,
    actionLabel: 'Contact Driver',
  },
  {
    id: 'alert-uk-002',
    severity: 'critical',
    title: 'Speeding Alert — Charlotte Davies',
    description: 'Vehicle travelling at 68 mph in a 50 mph roadworks zone on M62 W near Leeds.',
    driverId: 'DRV-UK-004',
    driverName: 'Charlotte Davies',
    vehicleId: 'VEH-UK-004',
    timestamp: mins(11),
    dismissed: false,
    actionLabel: 'View Location',
  },
  {
    id: 'alert-uk-003',
    severity: 'critical',
    title: 'Unplanned Stop — Henry Thornton',
    description:
      'Vehicle stopped for 31 minutes outside designated route near Stroud, Gloucestershire.',
    driverId: 'DRV-UK-007',
    driverName: 'Henry Thornton',
    vehicleId: 'VEH-UK-007',
    timestamp: mins(28),
    dismissed: false,
    actionLabel: 'View Route',
  },
  {
    id: 'alert-uk-004',
    severity: 'warning',
    title: 'Low Drive Time — Charlotte Davies',
    description: '1.5 hours remaining on driving window. Driver should plan for rest stop.',
    driverId: 'DRV-UK-004',
    driverName: 'Charlotte Davies',
    vehicleId: 'VEH-UK-004',
    timestamp: mins(18),
    dismissed: false,
  },
  {
    id: 'alert-uk-005',
    severity: 'warning',
    title: 'Low AdBlue — James Whitfield',
    description: 'AdBlue level at 12%. Refill within 200 miles to avoid engine derate.',
    driverId: 'DRV-UK-001',
    driverName: 'James Whitfield',
    vehicleId: 'VEH-UK-001',
    timestamp: mins(35),
    dismissed: false,
  },
  {
    id: 'alert-uk-006',
    severity: 'warning',
    title: 'Harsh Braking Event',
    description: 'Harsh braking detected on M62 W. Review driver coaching report.',
    driverId: 'DRV-UK-004',
    driverName: 'Charlotte Davies',
    vehicleId: 'VEH-UK-004',
    timestamp: mins(89),
    dismissed: false,
  },
  {
    id: 'alert-uk-007',
    severity: 'info',
    title: 'MOT Due',
    description: 'VEH-UK-006 (Scania R 500) MOT due in 7 days. Book at approved DVSA test station.',
    vehicleId: 'VEH-UK-006',
    timestamp: mins(120),
    dismissed: false,
  },
  {
    id: 'alert-uk-008',
    severity: 'warning',
    title: 'Tachograph Download Overdue — William Foster',
    description:
      'Tachograph data for VEH-UK-009 not downloaded in 28 days. Legal download required within 56 days.',
    vehicleId: 'VEH-UK-009',
    driverName: 'William Foster',
    timestamp: mins(200),
    dismissed: false,
    actionLabel: 'Download Now',
  },
]

// ── Region map  ────────────────────────────────────────────────────────────────
const alertsByRegion: Record<RegionCode, FleetAlert[]> = {
  us: initialAlertsUS,
  mx: initialAlertsMX,
  uk: initialAlertsUK,
}

// Per-region dismissed state (so switching region shows fresh alerts)
const dismissedByRegion: Record<RegionCode, Set<string>> = {
  us: new Set(),
  mx: new Set(),
  uk: new Set(),
}

export function useAlerts() {
  const allAlerts = computed<FleetAlert[]>(() => alertsByRegion[currentRegion.value])
  const dismissed = computed(() => dismissedByRegion[currentRegion.value])

  const alerts = computed(() =>
    allAlerts.value.map((a) => ({ ...a, dismissed: dismissed.value.has(a.id) })),
  )
  const activeAlerts = computed(() => alerts.value.filter((a) => !a.dismissed))
  const criticalCount = computed(
    () => activeAlerts.value.filter((a) => a.severity === 'critical').length,
  )
  const warningCount = computed(
    () => activeAlerts.value.filter((a) => a.severity === 'warning').length,
  )

  function dismiss(id: string) {
    dismissedByRegion[currentRegion.value].add(id)
  }

  function dismissAll() {
    allAlerts.value.forEach((a) => dismissedByRegion[currentRegion.value].add(a.id))
  }

  return { alerts, activeAlerts, criticalCount, warningCount, dismiss, dismissAll }
}
