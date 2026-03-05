import type { ActivityEvent } from '@motive/shared'

const now = new Date()
const mins = (m: number) => new Date(now.getTime() - m * 60000)

const mockEvents: ActivityEvent[] = [
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

export function useActivityFeed() {
  const events = ref<ActivityEvent[]>(mockEvents)
  const displayCount = ref(6)

  const visibleEvents = computed(() => events.value.slice(0, displayCount.value))
  const hasMore = computed(() => displayCount.value < events.value.length)

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
