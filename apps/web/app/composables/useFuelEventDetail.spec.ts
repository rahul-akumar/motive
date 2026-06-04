import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useFuelEventDetail } from '~/composables/useFuelEventDetail'
import { useFuelLossData } from '~/composables/useFuelLossData'
import { idlingByRegion } from '~/mocks/idling'
import { currentRegion } from '~/composables/useRegion'

describe('useFuelEventDetail', () => {
  it('finds a fuel-loss event by id', () => {
    const { events } = useFuelLossData()
    const firstId = events.value[0]!.id
    const eventId = ref(firstId)

    const { event, notFound } = useFuelEventDetail(eventId)

    expect(event.value).not.toBeNull()
    expect(event.value!.id).toBe(firstId)
    expect(event.value!.type).toBe('fuel-loss')
    expect(notFound.value).toBe(false)
  })

  it('finds an idling event by id', () => {
    const idlingEvents = idlingByRegion[currentRegion.value]
    const firstId = idlingEvents[0]!.id
    const eventId = ref(firstId)

    const { event, notFound } = useFuelEventDetail(eventId)

    expect(event.value).not.toBeNull()
    expect(event.value!.id).toBe(firstId)
    expect(event.value!.type).toBe('idling')
    expect(notFound.value).toBe(false)
  })

  it('returns null and notFound for non-existent id', () => {
    const eventId = ref('non-existent-id-xyz')

    const { event, raw, notFound } = useFuelEventDetail(eventId)

    expect(event.value).toBeNull()
    expect(raw.value).toBeNull()
    expect(notFound.value).toBe(true)
  })
})
