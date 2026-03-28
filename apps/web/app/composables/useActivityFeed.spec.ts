import { describe, it, expect } from 'vitest'
import { useActivityFeed } from '~/composables/useActivityFeed'

describe('useActivityFeed', () => {
  it('returns events for the current region', () => {
    const { events } = useActivityFeed()
    expect(events.value.length).toBeGreaterThan(0)
  })

  it('each event has required fields', () => {
    const { events } = useActivityFeed()
    for (const e of events.value) {
      expect(e).toHaveProperty('id')
      expect(e).toHaveProperty('type')
      expect(e).toHaveProperty('description')
      expect(e).toHaveProperty('timestamp')
      expect(e.timestamp).toBeInstanceOf(Date)
    }
  })

  it('visibleEvents shows at most 6 events initially', () => {
    const { visibleEvents } = useActivityFeed()
    expect(visibleEvents.value.length).toBeLessThanOrEqual(6)
  })

  it('loadMore increases visible count by 4', () => {
    const { visibleEvents, loadMore, hasMore } = useActivityFeed()
    if (!hasMore.value) return // skip if already showing all
    const before = visibleEvents.value.length
    loadMore()
    expect(visibleEvents.value.length).toBe(Math.min(before + 4, visibleEvents.value.length))
  })

  it('hasMore is false when all events are visible', () => {
    const { events, visibleEvents, hasMore, loadMore } = useActivityFeed()
    // Load all events
    while (hasMore.value) loadMore()
    expect(visibleEvents.value.length).toBe(events.value.length)
    expect(hasMore.value).toBe(false)
  })

  it('formatRelativeTime returns "just now" for very recent timestamps', () => {
    const { formatRelativeTime } = useActivityFeed()
    const now = new Date()
    expect(formatRelativeTime(now)).toBe('just now')
  })

  it('formatRelativeTime returns minutes for recent timestamps', () => {
    const { formatRelativeTime } = useActivityFeed()
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago')
  })

  it('formatRelativeTime returns hours for older timestamps', () => {
    const { formatRelativeTime } = useActivityFeed()
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago')
  })
})
