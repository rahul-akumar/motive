import type { DailyMilesData } from '@motive/shared'

export function useMilesData() {
  const dailyMiles = ref<DailyMilesData[]>([
    { date: '2026-02-26', label: 'Thu', miles: 9842, trips: 38 },
    { date: '2026-02-27', label: 'Fri', miles: 11234, trips: 44 },
    { date: '2026-02-28', label: 'Sat', miles: 7621, trips: 29 },
    { date: '2026-03-01', label: 'Sun', miles: 5103, trips: 19 },
    { date: '2026-03-02', label: 'Mon', miles: 13456, trips: 52 },
    { date: '2026-03-03', label: 'Tue', miles: 12089, trips: 47 },
    { date: '2026-03-04', label: 'Today', miles: 12847, trips: 47 },
  ])

  const totalMiles = computed(() => dailyMiles.value.reduce((sum, d) => sum + d.miles, 0))
  const avgMiles = computed(() => Math.round(totalMiles.value / dailyMiles.value.length))
  const maxMiles = computed(() => Math.max(...dailyMiles.value.map((d) => d.miles)))

  return { dailyMiles, totalMiles, avgMiles, maxMiles }
}
