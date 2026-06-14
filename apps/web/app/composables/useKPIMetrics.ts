import type { KpiMetric } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { metricsByRegion } from '~/mocks/kpi'

export function useKPIMetrics() {
  const { fleetDrivers } = useFleetData()

  const metrics = computed<KpiMetric[]>(() => {
    const base = metricsByRegion[currentRegion.value]
    const drivers = fleetDrivers.value
    const total = drivers.length
    const offline = drivers.filter((d) => d.status === 'offline').length
    const active = total - offline
    const atRisk = drivers.filter((d) => d.hos.hasViolation).length
    const hosRate = total > 0 ? ((total - atRisk) / total) * 100 : 0

    return base.map((metric) => {
      if (metric.id === 'active-drivers') {
        return {
          ...metric,
          value: active,
          displayValue: String(active),
          unit: `/ ${total}`,
          subtitle: `${offline} offline`,
        }
      }
      if (metric.id === 'hos-compliance') {
        return {
          ...metric,
          value: hosRate,
          displayValue: hosRate.toFixed(1),
          subtitle: `${atRisk} ${atRisk === 1 ? 'driver' : 'drivers'} at risk`,
        }
      }
      return metric
    })
  })

  return { metrics }
}
