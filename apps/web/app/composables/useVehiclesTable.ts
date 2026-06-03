import type { FleetVehicle, FleetVehicleStatus } from '@motive/shared'
import { useFleetDataV2 } from '~/composables/useFleetData'

export function useVehiclesTable() {
  const { fleetVehicles, loading } = useFleetDataV2()

  const sortKey = ref<string>('unitNumber')
  const sortDir = ref<'asc' | 'desc'>('asc')
  const searchQuery = ref('')
  const statusFilter = ref<FleetVehicleStatus | null>(null)

  const filteredVehicles = computed<FleetVehicle[]>(() => {
    let result = fleetVehicles.value

    const q = searchQuery.value.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (v) =>
          v.unitNumber.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.driverName && v.driverName.toLowerCase().includes(q)) ||
          v.currentLocation.city.toLowerCase().includes(q),
      )
    }

    if (statusFilter.value !== null) {
      result = result.filter((v) => v.status === statusFilter.value)
    }

    const key = sortKey.value as keyof FleetVehicle
    const dir = sortDir.value === 'asc' ? 1 : -1
    result = [...result].sort((a, b) => {
      const aVal = a[key] ?? ''
      const bVal = b[key] ?? ''
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * dir
      }
      return 0
    })

    return result
  })

  const hasActiveFilters = computed(() => searchQuery.value !== '' || statusFilter.value !== null)

  function handleSort(key: string, dir: 'asc' | 'desc') {
    sortKey.value = key
    sortDir.value = dir
  }

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = null
  }

  return {
    vehicles: filteredVehicles,
    loading,
    sortKey,
    sortDir,
    searchQuery,
    statusFilter,
    hasActiveFilters,
    handleSort,
    clearFilters,
  }
}
