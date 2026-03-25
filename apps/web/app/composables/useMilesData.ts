import type { DailyMilesData } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import type { RegionCode } from '~/composables/useRegion'

const dailyMilesByRegion: Record<RegionCode, DailyMilesData[]> = {
  us: [
    { date: '2026-02-26', label: 'Thu', miles: 9842, trips: 38 },
    { date: '2026-02-27', label: 'Fri', miles: 11234, trips: 44 },
    { date: '2026-02-28', label: 'Sat', miles: 7621, trips: 29 },
    { date: '2026-03-01', label: 'Sun', miles: 5103, trips: 19 },
    { date: '2026-03-02', label: 'Mon', miles: 13456, trips: 52 },
    { date: '2026-03-03', label: 'Tue', miles: 12089, trips: 47 },
    { date: '2026-03-04', label: 'Today', miles: 12847, trips: 47 },
  ],
  mx: [
    { date: '2026-02-26', label: 'Thu', miles: 5812, trips: 22 },
    { date: '2026-02-27', label: 'Fri', miles: 6934, trips: 27 },
    { date: '2026-02-28', label: 'Sat', miles: 4211, trips: 16 },
    { date: '2026-03-01', label: 'Sun', miles: 2840, trips: 10 },
    { date: '2026-03-02', label: 'Mon', miles: 7643, trips: 29 },
    { date: '2026-03-03', label: 'Tue', miles: 6921, trips: 26 },
    { date: '2026-03-04', label: 'Today', miles: 8243, trips: 31 },
  ],
  uk: [
    { date: '2026-02-26', label: 'Thu', miles: 4102, trips: 17 },
    { date: '2026-02-27', label: 'Fri', miles: 5344, trips: 21 },
    { date: '2026-02-28', label: 'Sat', miles: 3201, trips: 12 },
    { date: '2026-03-01', label: 'Sun', miles: 1893, trips: 7 },
    { date: '2026-03-02', label: 'Mon', miles: 6012, trips: 24 },
    { date: '2026-03-03', label: 'Tue', miles: 5678, trips: 22 },
    { date: '2026-03-04', label: 'Today', miles: 6107, trips: 22 },
  ],
}

export function useMilesData() {
  const dailyMiles = computed<DailyMilesData[]>(() => dailyMilesByRegion[currentRegion.value])

  const totalMiles = computed(() => dailyMiles.value.reduce((sum, d) => sum + d.miles, 0))
  const avgMiles = computed(() => Math.round(totalMiles.value / dailyMiles.value.length))
  const maxMiles = computed(() => Math.max(...dailyMiles.value.map((d) => d.miles)))

  return { dailyMiles, totalMiles, avgMiles, maxMiles }
}
