import { describe, it, expect } from 'vitest'
import { FLEET_STATUS_COLORS, FLEET_STATUS_LABELS, hosBarColor } from '~/composables/useFleetStatus'

describe('FLEET_STATUS_COLORS', () => {
  const statuses = ['driving', 'idle', 'alert', 'offline', 'sleeper'] as const

  it('has an entry for every valid status', () => {
    for (const s of statuses) {
      expect(FLEET_STATUS_COLORS).toHaveProperty(s)
    }
  })

  it('each value is a CSS var reference', () => {
    for (const s of statuses) {
      expect(FLEET_STATUS_COLORS[s]).toMatch(/^var\(--/)
    }
  })
})

describe('FLEET_STATUS_LABELS', () => {
  const statuses = ['driving', 'idle', 'alert', 'offline', 'sleeper'] as const

  it('has a human-readable label for every status', () => {
    for (const s of statuses) {
      expect(typeof FLEET_STATUS_LABELS[s]).toBe('string')
      expect(FLEET_STATUS_LABELS[s].length).toBeGreaterThan(0)
    }
  })
})

describe('hosBarColor', () => {
  it('returns alert color for violations', () => {
    expect(hosBarColor(80, true)).toContain('--fleet-status-alert')
  })

  it('returns alert color when percent is 0', () => {
    expect(hosBarColor(0, false)).toContain('--fleet-status-alert')
  })

  it('returns idle color when percent is low (≤18)', () => {
    expect(hosBarColor(10, false)).toContain('--fleet-status-idle')
  })

  it('returns driving color for healthy remaining time', () => {
    expect(hosBarColor(60, false)).toContain('--fleet-status-driving')
  })
})
