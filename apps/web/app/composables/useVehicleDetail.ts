import type { FleetVehicle, FleetDriver } from '@motive/shared'
import { useFleetData } from '~/composables/useFleetData'

export function useVehicleDetail(vehicleId: Ref<string>) {
  const { fleetVehicles, fleetDrivers, loading } = useFleetData()

  const vehicle = computed<FleetVehicle | undefined>(() =>
    fleetVehicles.value.find((v) => v.id === vehicleId.value),
  )

  const driver = computed<FleetDriver | undefined>(() => {
    if (!vehicle.value?.driverId) return undefined
    return fleetDrivers.value.find((d) => d.id === vehicle.value!.driverId)
  })

  const notFound = computed(() => !loading.value && !vehicle.value)

  return { vehicle, driver, loading, notFound }
}
