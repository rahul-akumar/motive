// ── Driver fuel-loss insights ─────────────────────────────────────────────────
// Computes insights from the mapped FuelEventRow data (which uses vehicle→driver
// linkage). When a real API exists, replace these with API calls.

import type { FuelEventRow } from '~/composables/useFuelEventMappers'

export interface DriverFuelHistory {
  totalEvents: number
  totalFuelLost: number // gallons (estimated from fuelDrop%)
  cost: number // USD
  groups: number
}

export interface DriverInsight {
  eventsThisMonth: number
  totalLossValue: number // USD
  fleetAvgMultiplier: number
}

const TANK_SIZE_GAL = 150
const COST_PER_GAL = 3.8

/** Compute driver fuel history from mapped event rows (last 30 days) */
export function getDriverFuelHistory(
  driverId: string | undefined | null,
  allRows: FuelEventRow[],
): DriverFuelHistory | null {
  if (!driverId) return null
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000)

  const driverEvents = allRows.filter(
    (r) =>
      r.type === 'fuel-loss' && r.driverId === driverId && new Date(r.startTime) >= thirtyDaysAgo,
  )

  if (driverEvents.length === 0) return null

  const totalFuelLost = driverEvents.reduce(
    (sum, e) => sum + ((e.fuelDrop ?? 0) / 100) * TANK_SIZE_GAL,
    0,
  )
  const cost = totalFuelLost * COST_PER_GAL

  // Groups: deterministic from id (1-3), simulates fleet group membership
  const hash = driverId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const groups = 1 + (hash % 3)

  return {
    totalEvents: driverEvents.length,
    totalFuelLost: Math.round(totalFuelLost * 100) / 100,
    cost: Math.round(cost),
    groups,
  }
}

/** Compute AI insight for repeat offenders from mapped event rows */
export function getDriverInsight(
  driverId: string | undefined | null,
  allRows: FuelEventRow[],
): DriverInsight | null {
  if (!driverId) return null
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000)

  // This driver's fuel-loss events in the last 30 days
  const driverEvents = allRows.filter(
    (r) =>
      r.type === 'fuel-loss' && r.driverId === driverId && new Date(r.startTime) >= thirtyDaysAgo,
  )

  // Only show insight for repeat offenders (3+ events this month)
  if (driverEvents.length < 3) return null

  const totalLossGal = driverEvents.reduce(
    (sum, e) => sum + ((e.fuelDrop ?? 0) / 100) * TANK_SIZE_GAL,
    0,
  )
  const totalLossValue = Math.round(totalLossGal * COST_PER_GAL)

  // Fleet average: total fuel-loss events / unique drivers (this month)
  const monthFuelLoss = allRows.filter(
    (r) => r.type === 'fuel-loss' && new Date(r.startTime) >= thirtyDaysAgo,
  )
  const uniqueDrivers = new Set(monthFuelLoss.filter((r) => r.driverId).map((r) => r.driverId))
  const fleetAvg = uniqueDrivers.size > 0 ? monthFuelLoss.length / uniqueDrivers.size : 1
  const fleetAvgMultiplier = Math.round(driverEvents.length / fleetAvg)

  if (fleetAvgMultiplier < 2) return null

  return {
    eventsThisMonth: driverEvents.length,
    totalLossValue,
    fleetAvgMultiplier,
  }
}
