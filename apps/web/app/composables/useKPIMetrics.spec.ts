import { describe, it, expect } from 'vitest'
import { useKPIMetrics } from '~/composables/useKPIMetrics'

describe('useKPIMetrics', () => {
  it('returns an array of metrics', () => {
    const { metrics } = useKPIMetrics()
    expect(Array.isArray(metrics.value)).toBe(true)
    expect(metrics.value.length).toBeGreaterThan(0)
  })

  it('each metric has required fields', () => {
    const { metrics } = useKPIMetrics()
    for (const m of metrics.value) {
      expect(m).toHaveProperty('id')
      expect(m).toHaveProperty('title')
      expect(m).toHaveProperty('value')
      expect(m).toHaveProperty('displayValue')
      expect(typeof m.value).toBe('number')
    }
  })

  it('includes an active-drivers metric', () => {
    const { metrics } = useKPIMetrics()
    const driverMetric = metrics.value.find((m) => m.id === 'active-drivers')
    expect(driverMetric).toBeDefined()
    expect(driverMetric!.value).toBeGreaterThan(0)
  })

  it('includes an active-alerts metric', () => {
    const { metrics } = useKPIMetrics()
    const alertMetric = metrics.value.find((m) => m.id === 'active-alerts')
    expect(alertMetric).toBeDefined()
  })
})
