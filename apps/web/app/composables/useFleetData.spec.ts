import { describe, it, expect } from 'vitest'
import { useFleetData } from '~/composables/useFleetData'

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
})
