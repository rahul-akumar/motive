import type { FleetStatusCount, FleetVehicle, FleetDriver, FleetAsset } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import {
  linkedVehiclesByRegion,
  linkedDriversByRegion,
  linkedAssetsByRegion,
} from '~/mocks/fleet-linked'

export function useFleetData() {
  const fleetVehicles = computed<FleetVehicle[]>(() => linkedVehiclesByRegion[currentRegion.value])
  const fleetDrivers = computed<FleetDriver[]>(() => linkedDriversByRegion[currentRegion.value])
  const fleetAssets = computed<FleetAsset[]>(() => linkedAssetsByRegion[currentRegion.value])
  const loading = ref(false)

  const fleetStatus = computed<FleetStatusCount>(() => {
    const counts = {
      driving: 0,
      idle: 0,
      sleeper: 0,
      offline: 0,
      alert: 0,
      total: fleetDrivers.value.length,
    }
    for (const d of fleetDrivers.value) {
      if (d.status === 'driving') counts.driving++
      else if (d.status === 'idle') counts.idle++
      else if (d.status === 'sleeper') counts.sleeper++
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

  return { fleetVehicles, fleetDrivers, fleetAssets, fleetStatus, loading, refresh }
}
