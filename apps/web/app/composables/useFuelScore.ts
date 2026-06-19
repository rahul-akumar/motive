import { useFuelEventsData } from '~/composables/useFuelEventsData'
import { useFuelWasteData } from '~/composables/useFuelWasteData'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const DAY_MS = 86_400_000
const OPEN_STATUSES = new Set(['pending-review', 'coachable'])

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function fuelLossPenalty(rows: FuelEventRow[]): number {
  const total = rows.reduce((sum, row) => sum + clamp((row.fuelDrop! - 8) * 0.5, 0, 4), 0)
  return Math.min(total, 40)
}

function idlingPenalty(rows: FuelEventRow[]): number {
  const total = rows.reduce((sum, row) => sum + clamp((row.durationMins! - 20) * 0.1, 0, 3), 0)
  return Math.min(total, 20)
}

function scoreForWindow(rows: FuelEventRow[], windowStart: Date, windowEnd: Date) {
  const inWindow = rows.filter(
    (row) =>
      OPEN_STATUSES.has(row.status) && row.startTime >= windowStart && row.startTime < windowEnd,
  )
  const fuelLossRows = inWindow.filter((row) => row.type === 'fuel-loss')
  const idlingRows = inWindow.filter((row) => row.type === 'idling')

  const score = clamp(100 - fuelLossPenalty(fuelLossRows) - idlingPenalty(idlingRows), 0, 100)

  return {
    score,
    openFuelLossCount: fuelLossRows.length,
    openIdlingCount: idlingRows.length,
  }
}

export function useFuelScore() {
  const { allRows } = useFuelEventsData()
  const { totalWaste, unit } = useFuelWasteData()

  const result = computed(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS)
    const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS)

    const current = scoreForWindow(allRows.value, weekAgo, now)
    const previous = scoreForWindow(allRows.value, twoWeeksAgo, weekAgo)

    return {
      score: Math.round(current.score),
      trendDelta: Math.round(current.score - previous.score),
      openIdlingCount: current.openIdlingCount,
      openFuelLossCount: current.openFuelLossCount,
    }
  })

  return {
    score: computed(() => result.value.score),
    trendDelta: computed(() => result.value.trendDelta),
    openIdlingCount: computed(() => result.value.openIdlingCount),
    openFuelLossCount: computed(() => result.value.openFuelLossCount),
    totalWaste,
    unit,
  }
}
