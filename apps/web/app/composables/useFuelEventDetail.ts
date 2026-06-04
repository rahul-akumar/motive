import type { FuelLossEvent, IdlingEvent } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { idlingByRegion } from '~/mocks/idling'
import { findFuelEventRowById } from '~/composables/useFuelEventMappers'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

export function useFuelEventDetail(eventId: Ref<string>) {
  const { events: fuelLossEvents } = useFuelLossData()

  const idlingEvents = computed<IdlingEvent[]>(() => idlingByRegion[currentRegion.value])

  const event = computed<FuelEventRow | null>(() =>
    findFuelEventRowById(eventId.value, fuelLossEvents.value, idlingEvents.value),
  )

  const raw = computed<FuelLossEvent | IdlingEvent | null>(() => {
    const fl = fuelLossEvents.value.find((e) => e.id === eventId.value)
    if (fl) return fl
    const idle = idlingEvents.value.find((e) => e.id === eventId.value)
    if (idle) return idle
    return null
  })

  const notFound = computed(() => !event.value)

  return { event, raw, notFound }
}
