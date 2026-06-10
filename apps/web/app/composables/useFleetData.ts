import type {
  Driver,
  Vehicle,
  FleetStatusCount,
  FleetVehicle,
  FleetDriver,
  FleetAsset,
} from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { driversByRegion, vehiclesByRegion } from '~/mocks/fleet'

// ── New fleet data composable (uses linked data) ──────────────────────────────
import {
  linkedVehiclesByRegion,
  linkedDriversByRegion,
  linkedAssetsByRegion,
} from '~/mocks/fleet-linked'

export function useFleetData() {
  const drivers = computed<Driver[]>(() => driversByRegion[currentRegion.value])
  const vehicles = computed<Vehicle[]>(() => vehiclesByRegion[currentRegion.value])
  const loading = ref(false)

  const fleetStatus = computed<FleetStatusCount>(() => {
    const counts = { driving: 0, idle: 0, offline: 0, alert: 0, total: drivers.value.length }
    for (const d of drivers.value) {
      if (d.status === 'driving') counts.driving++
      else if (d.status === 'idle' || d.status === 'sleeper') counts.idle++
      else if (d.status === 'offline') counts.offline++
      else if (d.status === 'alert') counts.alert++
    }
    return counts
  })

  async function refresh() {
    loading.value = true
    await new Promise((r) => setTimeout(r, 800))
    loading.value = false
  }

  return { drivers, vehicles, fleetStatus, loading, refresh }
}

export function useFleetDataV2() {
  const fleetVehicles = computed<FleetVehicle[]>(() => linkedVehiclesByRegion[currentRegion.value])
  const fleetDrivers = computed<FleetDriver[]>(() => linkedDriversByRegion[currentRegion.value])
  const fleetAssets = computed<FleetAsset[]>(() => linkedAssetsByRegion[currentRegion.value])
  const loading = ref(false)

  async function refresh() {
    loading.value = true
    await new Promise((r) => setTimeout(r, 800))
    loading.value = false
  }

  return { fleetVehicles, fleetDrivers, fleetAssets, loading, refresh }
}
