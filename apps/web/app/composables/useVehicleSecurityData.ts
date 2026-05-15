import type { VehicleDevice, JammingEvent, SignalTimelineEntry } from '@motive/shared'
import { mockVehicleDevices, mockJammingEvent, JAMMED_VEHICLE_ID } from '~/mocks/vehicle-security'
import { computeSectorPolygon } from '~/composables/useSearchZoneGeometry'

export function useVehicleSecurityData(vehicleId: Ref<string> | ComputedRef<string>) {
  const devices = computed<VehicleDevice[]>(() => {
    if (toValue(vehicleId) !== JAMMED_VEHICLE_ID) return []
    return mockVehicleDevices
  })

  const jammingEvent = computed<JammingEvent | null>(() => {
    if (toValue(vehicleId) !== JAMMED_VEHICLE_ID) return null
    return mockJammingEvent
  })

  const isJammed = computed(() => jammingEvent.value?.isActive ?? false)

  const elapsedSeconds = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  function startTimer() {
    if (!jammingEvent.value) return
    const jammedAt = jammingEvent.value.jammedAt.getTime()
    elapsedSeconds.value = Math.floor((Date.now() - jammedAt) / 1000)
    timer = setInterval(() => {
      elapsedSeconds.value++
    }, 1000)
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const searchRadiusMeters = computed(() => {
    if (!jammingEvent.value) return 0
    const speedMps = (jammingEvent.value.lastKnownSpeed * 1000) / 3600
    return speedMps * elapsedSeconds.value
  })

  const searchRadiusKm = computed(() => {
    return Math.round(searchRadiusMeters.value / 10) / 100
  })

  const sectorPoints = computed<[number, number][]>(() => {
    if (!jammingEvent.value || searchRadiusMeters.value === 0) return []
    return computeSectorPolygon(
      jammingEvent.value.lastKnownLocation,
      searchRadiusMeters.value,
      jammingEvent.value.lastKnownHeading,
      60,
      30,
    )
  })

  const timeline = computed<SignalTimelineEntry[]>(() => {
    return jammingEvent.value?.timeline ?? []
  })

  onMounted(startTimer)
  onUnmounted(stopTimer)

  return {
    devices,
    jammingEvent,
    isJammed,
    elapsedSeconds,
    searchRadiusMeters,
    searchRadiusKm,
    sectorPoints,
    timeline,
  }
}
