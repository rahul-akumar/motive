import { describe, it, expect } from 'vitest'
import { formatDate, generateId, clamp } from './index'

describe('formatDate', () => {
  it('formats a date correctly', () => {
    const date = new Date('2025-01-15')
    const result = formatDate(date)
    expect(result).toContain('Jan')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })
})

describe('generateId', () => {
  it('generates an ID with default prefix', () => {
    const id = generateId()
    expect(id).toMatch(/^motive-[a-z0-9]+$/)
  })

  it('generates an ID with custom prefix', () => {
    const id = generateId('vehicle')
    expect(id).toMatch(/^vehicle-[a-z0-9]+$/)
  })

  it('generates unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })
})

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to min when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to max when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })
})
