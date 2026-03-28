import { describe, it, expect } from 'vitest'
import { useCameraData, STATUS_SEVERITY, getStatusGroup } from '~/composables/useCameraData'

describe('useCameraData', () => {
  it('returns a non-empty cameras array', () => {
    const { cameras } = useCameraData()
    expect(cameras.value.length).toBeGreaterThan(0)
  })

  it('each camera has required fields', () => {
    const { cameras } = useCameraData()
    for (const c of cameras.value) {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('vehicle')
      expect(c).toHaveProperty('assetId')
      expect(c).toHaveProperty('type')
      expect(c).toHaveProperty('status')
    }
  })
})

describe('getStatusGroup', () => {
  it('maps online to "online"', () => {
    expect(getStatusGroup('online')).toBe('online')
  })

  it('maps offline to "offline"', () => {
    expect(getStatusGroup('offline')).toBe('offline')
  })

  it('maps pending-setup to "pending"', () => {
    expect(getStatusGroup('pending-setup')).toBe('pending')
  })

  it('maps signal-issue to "issues"', () => {
    expect(getStatusGroup('signal-issue')).toBe('issues')
  })

  it('maps installation-issue to "issues"', () => {
    expect(getStatusGroup('installation-issue')).toBe('issues')
  })
})

describe('STATUS_SEVERITY', () => {
  it('online has highest severity value', () => {
    const values = Object.values(STATUS_SEVERITY)
    expect(STATUS_SEVERITY['online']).toBe(Math.max(...values))
  })

  it('offline has lowest severity value', () => {
    const values = Object.values(STATUS_SEVERITY)
    expect(STATUS_SEVERITY['offline']).toBe(Math.min(...values))
  })
})
