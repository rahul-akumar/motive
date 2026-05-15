/**
 * Links vehicles, drivers, and assets together with realistic partial relationships.
 * Not all entities are linked — mirrors real fleet operations.
 *
 * Distribution:
 * - ~60% of vehicles have an assigned driver
 * - ~50% of active vehicles have an attached asset
 * - Remaining entities are unlinked (parked vehicles, off-duty drivers, yard assets)
 */
import type { FleetVehicle, FleetDriver, FleetAsset } from '@motive/shared'
import type { RegionCode } from '~/composables/useRegion'
import { fleetVehiclesByRegion } from './vehicles'
import { fleetDriversByRegion } from './drivers'
import { fleetAssetsByRegion } from './assets'

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function linkRegion(region: RegionCode): {
  vehicles: FleetVehicle[]
  drivers: FleetDriver[]
  assets: FleetAsset[]
} {
  const seed = region === 'us' ? 5001 : region === 'mx' ? 5002 : 5003
  const rand = seededRandom(seed)

  const vehicles = fleetVehiclesByRegion[region]
  const drivers = fleetDriversByRegion[region]
  const assets = fleetAssetsByRegion[region]

  // Get eligible drivers (driving/idle/alert can be assigned to vehicles)
  const eligibleDrivers = drivers.filter(
    (d) => d.status === 'driving' || d.status === 'idle' || d.status === 'alert',
  )
  const shuffledDrivers = [...eligibleDrivers].sort(() => rand() - 0.5)

  // Get eligible assets (in-use assets can be attached to vehicles)
  const inUseAssets = assets.filter((a) => a.availability === 'in-use')
  const shuffledAssets = [...inUseAssets].sort(() => rand() - 0.5)

  // Link ~60% of vehicles to drivers
  const activeVehicles = vehicles.filter((v) => v.status === 'active' || v.status === 'idle')
  const vehiclesToLink = activeVehicles.slice(0, Math.floor(activeVehicles.length * 0.65))

  let driverIdx = 0
  for (const vehicle of vehiclesToLink) {
    if (driverIdx >= shuffledDrivers.length) break
    const driver = shuffledDrivers[driverIdx]!
    driverIdx++

    // Wire vehicle → driver
    vehicle.driverId = driver.id
    vehicle.driverName = driver.name

    // Wire driver → vehicle
    driver.vehicleId = vehicle.id
    driver.vehicleUnitNumber = vehicle.unitNumber

    // Sync location: driver moves to vehicle location
    driver.currentLocation = { ...vehicle.currentLocation }
  }

  // Link ~50% of linked vehicles to assets
  const vehiclesWithDrivers = vehicles.filter((v) => v.driverId !== null)
  const vehiclesToLinkAssets = vehiclesWithDrivers
    .sort(() => rand() - 0.5)
    .slice(0, Math.floor(vehiclesWithDrivers.length * 0.55))

  let assetIdx = 0
  for (const vehicle of vehiclesToLinkAssets) {
    if (assetIdx >= shuffledAssets.length) break
    const asset = shuffledAssets[assetIdx]!
    assetIdx++

    // Wire vehicle → asset
    vehicle.assetId = asset.id
    vehicle.assetName = asset.name

    // Wire asset → vehicle
    asset.vehicleId = vehicle.id
    asset.vehicleUnitNumber = vehicle.unitNumber

    // Wire asset → driver (through vehicle)
    if (vehicle.driverId) {
      asset.driverId = vehicle.driverId
      asset.driverName = vehicle.driverName
    }

    // Wire driver → asset
    const linkedDriver = drivers.find((d) => d.id === vehicle.driverId)
    if (linkedDriver) {
      linkedDriver.assetId = asset.id
      linkedDriver.assetName = asset.name
    }

    // Sync location: asset travels with its vehicle
    asset.currentLocation = { ...vehicle.currentLocation }
  }

  return { vehicles, drivers, assets }
}

// Run linking for all regions on module load
const linkedUS = linkRegion('us')
const linkedMX = linkRegion('mx')
const linkedUK = linkRegion('uk')

export const linkedVehiclesByRegion: Record<RegionCode, FleetVehicle[]> = {
  us: linkedUS.vehicles,
  mx: linkedMX.vehicles,
  uk: linkedUK.vehicles,
}

export const linkedDriversByRegion: Record<RegionCode, FleetDriver[]> = {
  us: linkedUS.drivers,
  mx: linkedMX.drivers,
  uk: linkedUK.drivers,
}

export const linkedAssetsByRegion: Record<RegionCode, FleetAsset[]> = {
  us: linkedUS.assets,
  mx: linkedMX.assets,
  uk: linkedUK.assets,
}
