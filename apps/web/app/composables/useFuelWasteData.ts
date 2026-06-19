import type { DailyFuelWasteData } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { fuelWasteByRegion } from '~/mocks/fuel-waste'

export function useFuelWasteData() {
  const dailyWaste = computed<DailyFuelWasteData[]>(() => fuelWasteByRegion[currentRegion.value])

  // US measures fuel in gallons; UK and MX in litres.
  const unit = computed(() => (currentRegion.value === 'us' ? 'gal' : 'L'))

  const totalWaste = computed(() =>
    dailyWaste.value.reduce((sum, d) => sum + d.idling + d.fuelLoss, 0),
  )
  const totalIdling = computed(() => dailyWaste.value.reduce((sum, d) => sum + d.idling, 0))
  const totalFuelLoss = computed(() => dailyWaste.value.reduce((sum, d) => sum + d.fuelLoss, 0))

  return { dailyWaste, unit, totalWaste, totalIdling, totalFuelLoss }
}
