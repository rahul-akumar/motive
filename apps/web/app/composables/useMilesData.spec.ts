import { describe, it, expect } from 'vitest'
import { useMilesData } from '~/composables/useMilesData'

describe('useMilesData', () => {
  it('returns 7 daily data points', () => {
    const { dailyMiles } = useMilesData()
    expect(dailyMiles.value).toHaveLength(7)
  })

  it('includes required fields on each data point', () => {
    const { dailyMiles } = useMilesData()
    const first = dailyMiles.value[0]!
    expect(first).toHaveProperty('date')
    expect(first).toHaveProperty('label')
    expect(first).toHaveProperty('miles')
    expect(first).toHaveProperty('trips')
    expect(typeof first.miles).toBe('number')
    expect(first.miles).toBeGreaterThan(0)
  })

  it('computes totalMiles as sum of all daily miles', () => {
    const { dailyMiles, totalMiles } = useMilesData()
    const expected = dailyMiles.value.reduce((s, d) => s + d.miles, 0)
    expect(totalMiles.value).toBe(expected)
  })

  it('computes avgMiles as rounded mean', () => {
    const { dailyMiles, avgMiles } = useMilesData()
    const expected = Math.round(
      dailyMiles.value.reduce((s, d) => s + d.miles, 0) / dailyMiles.value.length,
    )
    expect(avgMiles.value).toBe(expected)
  })

  it('computes maxMiles as single highest value', () => {
    const { dailyMiles, maxMiles } = useMilesData()
    const expected = Math.max(...dailyMiles.value.map((d) => d.miles))
    expect(maxMiles.value).toBe(expected)
  })
})
