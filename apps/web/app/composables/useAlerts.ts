import type { FleetAlert } from '@motive/shared'

const now = new Date()
const mins = (m: number) => new Date(now.getTime() - m * 60000)

const initialAlerts: FleetAlert[] = [
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

export function useAlerts() {
  const alerts = ref<FleetAlert[]>(initialAlerts)

  const activeAlerts = computed(() => alerts.value.filter((a) => !a.dismissed))
  const criticalCount = computed(
    () => activeAlerts.value.filter((a) => a.severity === 'critical').length,
  )
  const warningCount = computed(
    () => activeAlerts.value.filter((a) => a.severity === 'warning').length,
  )

  function dismiss(id: string) {
    const alert = alerts.value.find((a) => a.id === id)
    if (alert) alert.dismissed = true
  }

  function dismissAll() {
    alerts.value.forEach((a) => {
      a.dismissed = true
    })
  }

  return { alerts, activeAlerts, criticalCount, warningCount, dismiss, dismissAll }
}
