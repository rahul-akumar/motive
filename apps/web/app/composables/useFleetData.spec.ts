import { describe, it, expect } from 'vitest'
import { useFleetData } from '~/composables/useFleetData'

describe('useFleetData', () => {
  it('returns non-empty drivers and vehicles arrays', () => {
    const { drivers, vehicles } = useFleetData()
    expect(drivers.value.length).toBeGreaterThan(0)
    expect(vehicles.value.length).toBeGreaterThan(0)
  })

  it('each driver has required fields', () => {
    const { drivers } = useFleetData()
    for (const d of drivers.value) {
      expect(d).toHaveProperty('id')
      expect(d).toHaveProperty('name')
      expect(d).toHaveProperty('status')
      expect(d).toHaveProperty('vehicleId')
    }
  })

  it('each vehicle has required fields', () => {
    const { vehicles } = useFleetData()
    for (const v of vehicles.value) {
      expect(v).toHaveProperty('id')
      expect(v).toHaveProperty('make')
      expect(v).toHaveProperty('model')
      expect(v).toHaveProperty('fuelLevel')
    }
  })

  it('fleetStatus.total equals drivers array length', () => {
    const { drivers, fleetStatus } = useFleetData()
    expect(fleetStatus.value.total).toBe(drivers.value.length)
  })

  it('fleetStatus counts sum correctly', () => {
    const { fleetStatus } = useFleetData()
    const { driving, idle, offline, alert, total } = fleetStatus.value
    expect(driving + idle + offline + alert).toBeLessThanOrEqual(total)
  })

  it('driver vehicleId matches a vehicle id', () => {
    const { drivers, vehicles } = useFleetData()
    const vehicleIds = new Set(vehicles.value.map((v) => v.id))
    for (const d of drivers.value) {
      expect(vehicleIds.has(d.vehicleId)).toBe(true)
    }
  })

  it('loading starts as false', () => {
    const { loading } = useFleetData()
    expect(loading.value).toBe(false)
  })
})
