import { describe, it, expect } from 'vitest'
import { useAlerts } from '~/composables/useAlerts'

describe('useAlerts', () => {
  it('returns a non-empty alerts array', () => {
    const { alerts } = useAlerts()
    expect(alerts.value.length).toBeGreaterThan(0)
  })

  it('all alerts have required fields', () => {
    const { alerts } = useAlerts()
    for (const a of alerts.value) {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('severity')
      expect(a).toHaveProperty('title')
      expect(a).toHaveProperty('description')
      expect(a).toHaveProperty('timestamp')
    }
  })

  it('all alerts start as undismissed', () => {
    const { alerts } = useAlerts()
    expect(alerts.value.every((a) => !a.dismissed)).toBe(true)
  })

  it('activeAlerts initially equals full alerts list', () => {
    const { alerts, activeAlerts } = useAlerts()
    expect(activeAlerts.value).toHaveLength(alerts.value.length)
  })

  it('dismiss marks a single alert as dismissed', () => {
    const { alerts, activeAlerts, dismiss } = useAlerts()
    const id = alerts.value[0]!.id
    dismiss(id)
    const dismissed = alerts.value.find((a) => a.id === id)
    expect(dismissed?.dismissed).toBe(true)
    expect(activeAlerts.value.find((a) => a.id === id)).toBeUndefined()
  })

  it('dismissAll removes all alerts from activeAlerts', () => {
    const { activeAlerts, dismissAll } = useAlerts()
    dismissAll()
    expect(activeAlerts.value).toHaveLength(0)
  })

  it('criticalCount counts only critical severity alerts', () => {
    const { alerts, criticalCount } = useAlerts()
    const expectedCritical = alerts.value.filter((a) => a.severity === 'critical').length
    expect(criticalCount.value).toBe(expectedCritical)
  })

  it('warningCount counts only warning severity alerts', () => {
    const { alerts, warningCount } = useAlerts()
    const expectedWarnings = alerts.value.filter((a) => a.severity === 'warning').length
    expect(warningCount.value).toBe(expectedWarnings)
  })
})
