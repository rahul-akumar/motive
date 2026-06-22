import type { FleetAsset, FleetAssetAvailability, FleetAssetType } from '@motive/shared'
import { useFleetData } from '~/composables/useFleetData'

export function useAssetsTable() {
  const { fleetAssets, loading, status, refresh } = useFleetData()

  const sortKey = ref<string>('name')
  const sortDir = ref<'asc' | 'desc'>('asc')
  const searchQuery = ref('')
  const availabilityFilter = ref<FleetAssetAvailability | null>(null)
  const typeFilter = ref<FleetAssetType | null>(null)

  const filteredAssets = computed<FleetAsset[]>(() => {
    let result = fleetAssets.value

    const q = searchQuery.value.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.subtype.toLowerCase().includes(q) ||
          (a.driverName && a.driverName.toLowerCase().includes(q)) ||
          (a.vehicleUnitNumber && a.vehicleUnitNumber.toLowerCase().includes(q)) ||
          a.currentLocation.city.toLowerCase().includes(q),
      )
    }

    if (availabilityFilter.value !== null) {
      result = result.filter((a) => a.availability === availabilityFilter.value)
    }

    if (typeFilter.value !== null) {
      result = result.filter((a) => a.type === typeFilter.value)
    }

    const key = sortKey.value as keyof FleetAsset
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

  const hasActiveFilters = computed(
    () =>
      searchQuery.value !== '' || availabilityFilter.value !== null || typeFilter.value !== null,
  )

  function handleSort(key: string, dir: 'asc' | 'desc') {
    sortKey.value = key
    sortDir.value = dir
  }

  function clearFilters() {
    searchQuery.value = ''
    availabilityFilter.value = null
    typeFilter.value = null
  }

  return {
    assets: filteredAssets,
    loading,
    status,
    refresh,
    sortKey,
    sortDir,
    searchQuery,
    availabilityFilter,
    typeFilter,
    hasActiveFilters,
    handleSort,
    clearFilters,
  }
}
