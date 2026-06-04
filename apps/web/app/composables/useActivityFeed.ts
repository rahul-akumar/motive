import type { ActivityEvent } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { eventsByRegion } from '~/mocks/activity'

export function useActivityFeed() {
  const events = computed<ActivityEvent[]>(() => eventsByRegion[currentRegion.value])
  const displayCount = ref(6)

  const visibleEvents = computed(() => events.value.slice(0, displayCount.value))
  const hasMore = computed(() => displayCount.value < events.value.length)

  // Reset display count when region changes
  watch(currentRegion, () => {
    displayCount.value = 6
  })

  function loadMore() {
    displayCount.value = Math.min(displayCount.value + 4, events.value.length)
  }

  function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  return { events, visibleEvents, hasMore, loadMore, formatRelativeTime }
}
