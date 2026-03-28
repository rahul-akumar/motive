import { describe, it, expect, beforeEach } from 'vitest'
import { useFuelLossData } from '~/composables/useFuelLossData'

describe('useFuelLossData', () => {
  beforeEach(() => {
    // Reset module-level filters between tests
    const { clearFilters, clearSelectedEvent } = useFuelLossData()
    clearFilters()
    clearSelectedEvent()
  })

  it('returns a list of events', () => {
    const { events } = useFuelLossData()
    expect(events.value.length).toBeGreaterThan(0)
  })

  it('each event has required fields', () => {
    const { events } = useFuelLossData()
    for (const e of events.value) {
      expect(e).toHaveProperty('id')
      expect(e).toHaveProperty('vehicleId')
      expect(e).toHaveProperty('fuelDrop')
      expect(e).toHaveProperty('status')
      expect(e).toHaveProperty('startTime')
      expect(e.startTime).toBeInstanceOf(Date)
    }
  })

  it('filteredEvents includes all events when no filters are set', () => {
    const { events, filteredEvents } = useFuelLossData()
    expect(filteredEvents.value.length).toBe(events.value.length)
  })

  it('filterSearch narrows results by vehicle name', () => {
    const { events, filteredEvents, filterSearch } = useFuelLossData()
    const vehicleName = events.value[0]!.vehicleName
    filterSearch.value = vehicleName
    expect(filteredEvents.value.every((e) => e.vehicleName.includes(vehicleName))).toBe(true)
  })

  it('filterMinDropPct excludes events below the threshold', () => {
    const { filteredEvents, filterMinDropPct } = useFuelLossData()
    filterMinDropPct.value = 15
    expect(filteredEvents.value.every((e) => e.fuelDrop >= 15)).toBe(true)
  })

  it('filterStatus narrows to open events only', () => {
    const { filteredEvents, filterStatus } = useFuelLossData()
    filterStatus.value = 'open'
    expect(filteredEvents.value.every((e) => e.status === 'open')).toBe(true)
  })

  it('hasActiveFilters is false when all filters are cleared', () => {
    const { hasActiveFilters } = useFuelLossData()
    expect(hasActiveFilters.value).toBe(false)
  })

  it('hasActiveFilters is true when filterSearch is set', () => {
    const { hasActiveFilters, filterSearch } = useFuelLossData()
    filterSearch.value = 'something'
    expect(hasActiveFilters.value).toBe(true)
  })

  it('openCount reflects number of open events', () => {
    const { events, openCount } = useFuelLossData()
    const expected = events.value.filter((e) => e.status === 'open').length
    expect(openCount.value).toBe(expected)
  })

  it('markReviewed changes event status to reviewed', () => {
    const { events, markReviewed } = useFuelLossData()
    const openEvent = events.value.find((e) => e.status === 'open')
    if (!openEvent) return
    markReviewed(openEvent.id)
    const updated = events.value.find((e) => e.id === openEvent.id)
    expect(updated?.status).toBe('reviewed')
  })

  it('markDismissed changes event status to dismissed', () => {
    const { events, markDismissed } = useFuelLossData()
    const openEvent = events.value.find((e) => e.status === 'open')
    if (!openEvent) return
    markDismissed(openEvent.id)
    const updated = events.value.find((e) => e.id === openEvent.id)
    expect(updated?.status).toBe('dismissed')
  })

  it('selectEvent sets selectedEvent', () => {
    const { events, selectedEvent, selectEvent } = useFuelLossData()
    const target = events.value[0]!
    selectEvent(target)
    expect(selectedEvent.value?.id).toBe(target.id)
  })

  it('clearSelectedEvent clears the selection', () => {
    const { events, selectedEvent, selectEvent, clearSelectedEvent } = useFuelLossData()
    selectEvent(events.value[0]!)
    clearSelectedEvent()
    expect(selectedEvent.value).toBeNull()
  })
})
