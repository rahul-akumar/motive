import type { FleetStatusCount, FleetVehicle, FleetDriver, FleetAsset } from '@motive/shared'
import type { AsyncStatus } from '@motive/ui'
import { currentRegion } from '~/composables/useRegion'
import {
  vehiclesForRegion,
  driversForRegion,
  assetsForRegion,
  getVehicles,
  getDrivers,
  getAssets,
} from '~/services/fleetRepository'

export function useFleetData() {
  const fleetVehicles = computed<FleetVehicle[]>(() => vehiclesForRegion(currentRegion.value))
  const fleetDrivers = computed<FleetDriver[]>(() => driversForRegion(currentRegion.value))
  const fleetAssets = computed<FleetAsset[]>(() => assetsForRegion(currentRegion.value))
  const loading = ref(false)
  const error = ref<unknown>(null)

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
    error.value = null
    // Re-fetch the active region's data through the repository seam.
    const region = currentRegion.value
    try {
      await Promise.all([getVehicles(region), getDrivers(region), getAssets(region)])
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Switching region is a deliberate selection — surface the loading state while
  // the repository "fetches" the new region's data (the computeds derive from the
  // synchronous *ForRegion path, so this only drives the loading window).
  watch(currentRegion, () => {
    refresh()
  })

  // AsyncBoundary status for the loading/error window. Resolves to 'success'
  // even with zero rows so tables can render their own filter-aware empty state
  // (keeping the filter chrome usable) rather than blanking the whole surface.
  const status = computed<AsyncStatus>(() => {
    if (loading.value) return 'pending'
    if (error.value) return 'error'
    return 'success'
  })

  return { fleetVehicles, fleetDrivers, fleetAssets, fleetStatus, loading, error, status, refresh }
}
