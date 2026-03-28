import { describe, it, expect } from 'vitest'
import { useFleetView } from '~/composables/useFleetView'

describe('useFleetView', () => {
  it('returns drivers via filteredDrivers', () => {
    const { filteredDrivers } = useFleetView()
    expect(filteredDrivers.value.length).toBeGreaterThan(0)
  })

  it('all status filters are active by default', () => {
    const { isAllSelected } = useFleetView()
    expect(isAllSelected.value).toBe(true)
  })

  it('toggleFilter removes a status from active filters', () => {
    const { activeFilters, toggleFilter } = useFleetView()
    const before = activeFilters.value.size
    toggleFilter('offline')
    expect(activeFilters.value.has('offline')).toBe(false)
    expect(activeFilters.value.size).toBe(before - 1)
  })

  it('toggleFilter will not remove the last remaining status', () => {
    const { activeFilters, toggleFilter } = useFleetView()
    const statuses = ['driving', 'idle', 'alert', 'offline'] as const
    // Remove all but one
    for (const s of statuses) toggleFilter(s)
    // Try to remove the last one — should be no-op
    const remaining = [...activeFilters.value][0]!
    toggleFilter(remaining)
    expect(activeFilters.value.size).toBe(1)
  })

  it('setAllFilters restores all statuses', () => {
    const { activeFilters, toggleFilter, setAllFilters, isAllSelected } = useFleetView()
    toggleFilter('offline')
    expect(isAllSelected.value).toBe(false)
    setAllFilters()
    expect(isAllSelected.value).toBe(true)
    expect(activeFilters.value.size).toBeGreaterThan(1)
  })

  it('searchQuery filters drivers by name', () => {
    const { drivers, filteredDrivers, searchQuery } = useFleetView()
    const firstName = drivers.value[0]!.name
    searchQuery.value = firstName
    expect(filteredDrivers.value.length).toBeGreaterThan(0)
    expect(filteredDrivers.value.every((d) => d.name.includes(firstName))).toBe(true)
  })

  it('selectDriver sets selectedDriverId and selectedDriver', () => {
    const { drivers, selectedDriver, selectDriver } = useFleetView()
    const targetId = drivers.value[0]!.id
    selectDriver(targetId)
    expect(selectedDriver.value?.id).toBe(targetId)
  })

  it('isDetailOpen is false when no driver is selected', () => {
    const { isDetailOpen, selectDriver } = useFleetView()
    selectDriver(null)
    expect(isDetailOpen.value).toBe(false)
  })

  it('isDetailOpen is true when a driver is selected', () => {
    const { drivers, isDetailOpen, selectDriver } = useFleetView()
    selectDriver(drivers.value[0]!.id)
    expect(isDetailOpen.value).toBe(true)
  })

  it('statusCounts contains counts for all statuses', () => {
    const { statusCounts } = useFleetView()
    expect(statusCounts.value).toHaveProperty('driving')
    expect(statusCounts.value).toHaveProperty('idle')
    expect(statusCounts.value).toHaveProperty('alert')
    expect(statusCounts.value).toHaveProperty('offline')
    expect(statusCounts.value).toHaveProperty('sleeper')
  })

  it('fitAllTrigger increments each time fitAllTrucks is called', () => {
    const { fitAllTrigger, fitAllTrucks } = useFleetView()
    const before = fitAllTrigger.value
    fitAllTrucks()
    expect(fitAllTrigger.value).toBe(before + 1)
  })
})
