import type { FleetDriver, FleetDriverStatus } from '@motive/shared'
import { useFleetDataV2 } from '~/composables/useFleetData'

export function useDriversTable() {
  const { fleetDrivers, loading } = useFleetDataV2()

  const sortKey = ref<string>('name')
  const sortDir = ref<'asc' | 'desc'>('asc')
  const searchQuery = ref('')
  const statusFilter = ref<FleetDriverStatus | 'all'>('all')

  const filteredDrivers = computed<FleetDriver[]>(() => {
    let result = fleetDrivers.value

    const q = searchQuery.value.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.vehicleUnitNumber && d.vehicleUnitNumber.toLowerCase().includes(q)) ||
          d.currentLocation.city.toLowerCase().includes(q),
      )
    }

    if (statusFilter.value !== 'all') {
      result = result.filter((d) => d.status === statusFilter.value)
    }

    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    result = [...result].sort((a, b) => {
      let aVal: string | number | null
      let bVal: string | number | null

      if (key.startsWith('hos.')) {
        const hosKey = key.replace('hos.', '') as keyof FleetDriver['hos']
        aVal = a.hos[hosKey] as number
        bVal = b.hos[hosKey] as number
      } else {
        aVal = a[key as keyof FleetDriver] as string | number | null
        bVal = b[key as keyof FleetDriver] as string | number | null
      }

      aVal = aVal ?? ''
      bVal = bVal ?? ''

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

  const hasActiveFilters = computed(() => searchQuery.value !== '' || statusFilter.value !== 'all')

  function handleSort(key: string, dir: 'asc' | 'desc') {
    sortKey.value = key
    sortDir.value = dir
  }

  function clearFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
  }

  return {
    drivers: filteredDrivers,
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
