import type { FleetAlert } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import type { RegionCode } from '~/composables/useRegion'
import { alertsByRegion } from '~/mocks/alerts'

// Per-region dismissed state (so switching region shows fresh alerts)
const dismissedByRegion: Record<RegionCode, Set<string>> = {
  us: new Set(),
  mx: new Set(),
  uk: new Set(),
}

export function useAlerts() {
  const allAlerts = computed<FleetAlert[]>(() => alertsByRegion[currentRegion.value])
  const dismissed = computed(() => dismissedByRegion[currentRegion.value])

  const alerts = computed(() =>
    allAlerts.value.map((a) => ({ ...a, dismissed: dismissed.value.has(a.id) })),
  )
  const activeAlerts = computed(() => alerts.value.filter((a) => !a.dismissed))
  const criticalCount = computed(
    () => activeAlerts.value.filter((a) => a.severity === 'critical').length,
  )
  const warningCount = computed(
    () => activeAlerts.value.filter((a) => a.severity === 'warning').length,
  )

  function dismiss(id: string) {
    dismissedByRegion[currentRegion.value].add(id)
  }

  function dismissAll() {
    allAlerts.value.forEach((a) => dismissedByRegion[currentRegion.value].add(a.id))
  }

  return { alerts, activeAlerts, criticalCount, warningCount, dismiss, dismissAll }
}
