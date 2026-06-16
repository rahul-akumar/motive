import { describe, it, expect, vi } from 'vitest'
import { useFleetData } from '~/composables/useFleetData'
import { currentRegion } from '~/composables/useRegion'

describe('useFleetData', () => {
  it('returns non-empty fleetDrivers and fleetVehicles arrays', () => {
    const { fleetDrivers, fleetVehicles } = useFleetData()
    expect(fleetDrivers.value.length).toBeGreaterThan(0)
    expect(fleetVehicles.value.length).toBeGreaterThan(0)
  })

  it('each driver has required fields', () => {
    const { fleetDrivers } = useFleetData()
    for (const d of fleetDrivers.value) {
      expect(d).toHaveProperty('id')
      expect(d).toHaveProperty('name')
      expect(d).toHaveProperty('status')
      expect(d).toHaveProperty('vehicleId')
    }
  })

  it('each vehicle has required fields', () => {
    const { fleetVehicles } = useFleetData()
    for (const v of fleetVehicles.value) {
      expect(v).toHaveProperty('id')
      expect(v).toHaveProperty('make')
      expect(v).toHaveProperty('model')
      expect(v).toHaveProperty('fuelLevel')
    }
  })

  it('fleetStatus.total equals fleetDrivers array length', () => {
    const { fleetDrivers, fleetStatus } = useFleetData()
    expect(fleetStatus.value.total).toBe(fleetDrivers.value.length)
  })

  it('fleetStatus counts sum correctly', () => {
    const { fleetStatus } = useFleetData()
    const { driving, idle, sleeper, offline, alert, total } = fleetStatus.value
    expect(driving + idle + sleeper + offline + alert).toBeLessThanOrEqual(total)
  })

  it('loading starts as false', () => {
    const { loading } = useFleetData()
    expect(loading.value).toBe(false)
  })

  it('switching region drives the loading state', async () => {
    vi.useFakeTimers()
    try {
      const { loading } = useFleetData()
      expect(loading.value).toBe(false)

      currentRegion.value = currentRegion.value === 'us' ? 'mx' : 'us'
      await nextTick()
      expect(loading.value).toBe(true)

      await vi.runAllTimersAsync()
      expect(loading.value).toBe(false)
    } finally {
      vi.useRealTimers()
      currentRegion.value = 'us'
    }
  })
})
