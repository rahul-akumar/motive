import type { FleetDriverStatus, FleetDriver, FleetVehicle } from '@motive/shared'
import { useFleetData } from '~/composables/useFleetData'

const ALL_STATUSES: FleetDriverStatus[] = ['driving', 'idle', 'alert', 'offline', 'sleeper']

export function useFleetView() {
  const { fleetVehicles, fleetDrivers } = useFleetData()

  // Drivers/vehicles flow straight from the canonical fleet data source — no
  // legacy bridge, so map/panel components consume honest FleetDriver/FleetVehicle.
  const drivers = fleetDrivers
  const vehicles = fleetVehicles

  // ── Filter state ──────────────────────────────────────────────
  const activeFilters = ref<Set<FleetDriverStatus>>(new Set(ALL_STATUSES))

  function toggleFilter(status: FleetDriverStatus) {
    const next = new Set(activeFilters.value)
    if (next.has(status)) {
      // Don't allow deselecting all
      if (next.size > 1) next.delete(status)
    } else {
      next.add(status)
    }
    activeFilters.value = next
  }

  function setAllFilters() {
    activeFilters.value = new Set(ALL_STATUSES)
  }

  const isAllSelected = computed(() => activeFilters.value.size === ALL_STATUSES.length)

  // ── Search ────────────────────────────────────────────────────
  const searchQuery = ref('')

  // ── Filtered drivers ──────────────────────────────────────────
  const filteredDrivers = computed<FleetDriver[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    return drivers.value.filter((d) => {
      if (!activeFilters.value.has(d.status)) return false
      if (q && !d.name.toLowerCase().includes(q) && !d.id.toLowerCase().includes(q)) return false
      return true
    })
  })

  // ── Status counts (for filter chips) ─────────────────────────
  const statusCounts = computed(() => {
    const counts: Record<FleetDriverStatus, number> = {
      driving: 0,
      idle: 0,
      alert: 0,
      offline: 0,
      sleeper: 0,
    }
    for (const d of drivers.value) {
      counts[d.status]++
    }
    return counts
  })

  // ── Selected driver (detail panel) ───────────────────────────
  const selectedDriverId = ref<string | null>(null)

  const selectedDriver = computed<FleetDriver | null>(
    () => drivers.value.find((d) => d.id === selectedDriverId.value) ?? null,
  )

  const selectedVehicle = computed<FleetVehicle | null>(() =>
    selectedDriver.value?.vehicleId
      ? (vehicles.value.find((v) => v.id === selectedDriver.value!.vehicleId) ?? null)
      : null,
  )

  function selectDriver(id: string | null) {
    selectedDriverId.value = id
  }

  const isDetailOpen = computed(() => selectedDriverId.value !== null)

  // ── Left panel visibility ─────────────────────────────────────
  const isPanelOpen = ref(true)

  function togglePanel() {
    isPanelOpen.value = !isPanelOpen.value
  }

  // ── Fit-all trigger (map listens to this) ─────────────────────
  const fitAllTrigger = ref(0)

  function fitAllTrucks() {
    fitAllTrigger.value++
  }

  return {
    // Data
    drivers,
    vehicles,
    filteredDrivers,
    statusCounts,
    // Filters
    activeFilters,
    isAllSelected,
    toggleFilter,
    setAllFilters,
    // Search
    searchQuery,
    // Selection
    selectedDriverId,
    selectedDriver,
    selectedVehicle,
    selectDriver,
    isDetailOpen,
    // Panel
    isPanelOpen,
    togglePanel,
    // Map
    fitAllTrigger,
    fitAllTrucks,
  }
}
