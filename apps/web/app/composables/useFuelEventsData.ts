import type { IdlingEvent, FuelEventType, FuelDropStatus } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { idlingByRegion } from '~/mocks/idling'
import { mapFuelLossToRow, mapIdlingToRow } from '~/composables/useFuelEventMappers'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

// ── Module-level singleton state ─────────────────────────────
const filterSearch = ref('')
const filterEventType = ref<FuelEventType | null>(null)
const filterStatus = ref<FuelDropStatus | null>(null)
const filterVehicle = ref<string | null>(null)
const filterDriver = ref<string | null>(null)

/** In-memory status overrides (survives navigation, resets on hard refresh) */
const statusOverrides = reactive<Map<string, FuelDropStatus>>(new Map())

export function updateEventStatus(id: string, status: FuelDropStatus) {
  statusOverrides.set(id, status)
}

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

  // Merge both event types into unified rows, applying status overrides
  const allRows = computed<FuelEventRow[]>(() => {
    const flRows = fuelLossEvents.value.map(mapFuelLossToRow)
    const idleRows = idlingEvents.value.map(mapIdlingToRow)
    const rows = [...flRows, ...idleRows].map((row) => {
      const override = statusOverrides.get(row.id)
      return override ? { ...row, status: override } : row
    })
    return rows.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
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
    allRows,
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
    updateEventStatus,
  }
}
