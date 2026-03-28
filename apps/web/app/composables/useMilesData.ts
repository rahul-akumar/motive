import type { DailyMilesData } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { dailyMilesByRegion } from '~/mocks/miles'

export function useMilesData() {
  const dailyMiles = computed<DailyMilesData[]>(() => dailyMilesByRegion[currentRegion.value])

  const totalMiles = computed(() => dailyMiles.value.reduce((sum, d) => sum + d.miles, 0))
  const avgMiles = computed(() => Math.round(totalMiles.value / dailyMiles.value.length))
  const maxMiles = computed(() => Math.max(...dailyMiles.value.map((d) => d.miles)))

  return { dailyMiles, totalMiles, avgMiles, maxMiles }
}
