import type { KpiMetric } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { metricsByRegion } from '~/mocks/kpi'

export function useKPIMetrics() {
  const metrics = computed<KpiMetric[]>(() => metricsByRegion[currentRegion.value])
  return { metrics }
}
