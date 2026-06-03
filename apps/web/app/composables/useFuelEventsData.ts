import type {
  FuelLossEvent,
  IdlingEvent,
  FuelEventType,
  FuelDropStatus,
  FleetVehicle,
} from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { linkedVehiclesByRegion } from '~/mocks/fleet-linked'
import { idlingByRegion } from '~/mocks/idling'

// ── Unified row shape ────────────────────────────────────────
export interface FuelEventRow {
  id: string
  type: FuelEventType
  vehicleId: string
  vehicleName: string
  vehicleMMY: string
  driverId: string | null
  driverName: string | null
  location: string
  startTime: Date
  endTime: Date
  /** fuel-loss only */
  fuelDrop?: number
  fuelStart?: number
  fuelEnd?: number
  /** idling only */
  durationMins?: number
  fuelWasted?: number
  status: FuelDropStatus
}

// ── Vehicle lookup from linked fleet data ────────────────────
function getVehicle(vehicleId: string): FleetVehicle | undefined {
  const vehicles = linkedVehiclesByRegion[currentRegion.value]
  return vehicles.find((v) => v.id === vehicleId)
}

function vehicleMMY(v: FleetVehicle | undefined): string {
  if (!v) return ''
  return `${v.year} ${v.make} ${v.model}`
}

// ── Normalize to unified rows ────────────────────────────────
function fuelLossToRow(e: FuelLossEvent): FuelEventRow {
  const vehicle = getVehicle(e.vehicleId)
  return {
    id: e.id,
    type: 'fuel-loss',
    vehicleId: e.vehicleId,
    vehicleName: vehicle?.unitNumber ?? e.vehicleId,
    vehicleMMY: vehicleMMY(vehicle),
    driverId: vehicle?.driverId ?? null,
    driverName: vehicle?.driverName ?? null,
    location: e.location.address,
    startTime: e.startTime,
    endTime: e.endTime,
    fuelDrop: e.fuelDrop,
    fuelStart: e.fuelStart,
    fuelEnd: e.fuelEnd,
    status: e.status,
  }
}

function idlingToRow(e: IdlingEvent): FuelEventRow {
  const vehicle = getVehicle(e.vehicleId)
  return {
    id: e.id,
    type: 'idling',
    vehicleId: e.vehicleId,
    vehicleName: vehicle?.unitNumber ?? e.vehicleId,
    vehicleMMY: vehicleMMY(vehicle),
    driverId: vehicle?.driverId ?? null,
    driverName: vehicle?.driverName ?? null,
    location: e.location.address,
    startTime: e.startTime,
    endTime: e.endTime,
    durationMins: e.durationMins,
    fuelWasted: e.fuelWasted,
    status: e.status,
  }
}

// ── Module-level singleton state ─────────────────────────────
const filterSearch = ref('')
const filterEventType = ref<FuelEventType | null>(null)
const filterStatus = ref<FuelDropStatus | null>(null)
const filterVehicle = ref<string | null>(null)
const filterDriver = ref<string | null>(null)

watch(currentRegion, () => {
  filterSearch.value = ''
  filterEventType.value = null
  filterStatus.value = null
  filterVehicle.value = null
  filterDriver.value = null
})

export function useFuelEventsData() {
  const { events: fuelLossEvents } = useFuelLossData()

  const idlingEvents = computed<IdlingEvent[]>(() => idlingByRegion[currentRegion.value])

  // Merge both event types into unified rows
  const allRows = computed<FuelEventRow[]>(() => {
    const flRows = fuelLossEvents.value.map(fuelLossToRow)
    const idleRows = idlingEvents.value.map(idlingToRow)
    return [...flRows, ...idleRows].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
  })

  // Filtered rows
  const filteredRows = computed<FuelEventRow[]>(() =>
    allRows.value.filter((row) => {
      if (filterEventType.value !== null && row.type !== filterEventType.value) return false
      if (filterStatus.value !== null && row.status !== filterStatus.value) return false
      if (filterVehicle.value !== null && row.vehicleId !== filterVehicle.value) return false
      if (filterDriver.value !== null && row.driverId !== filterDriver.value) return false
      if (filterSearch.value) {
        const q = filterSearch.value.toLowerCase()
        if (
          !row.vehicleName.toLowerCase().includes(q) &&
          !(row.driverName ?? '').toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    }),
  )

  // Unique vehicles/drivers from current data for filter options
  const vehicleOptions = computed(() => {
    const seen = new Map<string, string>()
    for (const row of allRows.value) {
      if (!seen.has(row.vehicleId)) seen.set(row.vehicleId, row.vehicleName)
    }
    return [...seen.entries()].map(([id, name]) => ({ label: name, value: id }))
  })

  const driverOptions = computed(() => {
    const seen = new Map<string, string>()
    for (const row of allRows.value) {
      if (row.driverId && row.driverName && !seen.has(row.driverId)) {
        seen.set(row.driverId, row.driverName)
      }
    }
    return [...seen.entries()].map(([id, name]) => ({ label: name, value: id }))
  })

  const hasActiveFilters = computed(
    () =>
      filterSearch.value !== '' ||
      filterEventType.value !== null ||
      filterStatus.value !== null ||
      filterVehicle.value !== null ||
      filterDriver.value !== null,
  )

  function clearFilters() {
    filterSearch.value = ''
    filterEventType.value = null
    filterStatus.value = null
    filterVehicle.value = null
    filterDriver.value = null
  }

  return {
    filteredRows,
    filterSearch,
    filterEventType,
    filterStatus,
    filterVehicle,
    filterDriver,
    vehicleOptions,
    driverOptions,
    hasActiveFilters,
    clearFilters,
  }
}
