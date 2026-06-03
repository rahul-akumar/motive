import type { FuelLossEvent, FuelDropStatus } from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { fuelLossByRegion } from '~/mocks/fuel-loss'

// ── Module-level singleton state ─────────────────────────────
// Mutation overrides: { eventId → overridden status } per region
const mutationOverrides = ref<Record<string, FuelDropStatus>>({})
const selectedEventId = ref<string | null>(null)
const filterSearch = ref('')
const filterMinDropPct = ref(0)
const filterStatus = ref<FuelDropStatus | 'all'>('all')

// Reset mutation/filter state whenever region changes
watch(currentRegion, () => {
  mutationOverrides.value = {}
  selectedEventId.value = null
  filterSearch.value = ''
  filterMinDropPct.value = 0
  filterStatus.value = 'all'
})

// Base events for current region (with mutation overrides applied)
const baseEvents = computed<FuelLossEvent[]>(() =>
  fuelLossByRegion[currentRegion.value].map((e) => ({
    ...e,
    status: (mutationOverrides.value[e.id] ?? e.status) as FuelDropStatus,
  })),
)

// Map marker events — pending-review events with ≥12% fuel drop, sorted newest first.
// MX shows all qualifying events to reflect high theft prevalence;
// US and UK are capped at the single most recent event.
const mapFuelLossEvents = computed<FuelLossEvent[]>(() => {
  const qualifying = baseEvents.value
    .filter((e) => e.status === 'pending-review' && e.fuelDrop >= 12)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  return currentRegion.value === 'mx' ? qualifying : qualifying.slice(0, 1)
})

let initialToastShown = false

export function useFuelLossData() {
  const { showToast } = useToast()

  // Fire a simulated real-time detection toast once per session
  if (!initialToastShown && import.meta.client) {
    initialToastShown = true
    setTimeout(() => {
      showToast({
        variant: 'critical',
        message: 'Fuel Loss Alert — MX-1017',
        subtext: 'Tank dropped 18% · Saltillo, COAH · just now',
        actionLabel: 'View',
        duration: 6000,
        dismissible: false,
        onAction: () => {
          selectedEventId.value = 'fl-mx-pipa08'
          navigateTo('/fuel/events')
        },
      })
    }, 1800)
  }

  // ── Computed ─────────────────────────────────────────────
  const filteredEvents = computed(() =>
    baseEvents.value.filter((e) => {
      if (
        filterSearch.value &&
        !e.vehicleName.toLowerCase().includes(filterSearch.value.toLowerCase()) &&
        !(e.driverName ?? '').toLowerCase().includes(filterSearch.value.toLowerCase())
      ) {
        return false
      }
      if (filterMinDropPct.value > 0 && e.fuelDrop < filterMinDropPct.value) {
        return false
      }
      if (filterStatus.value !== 'all' && e.status !== filterStatus.value) {
        return false
      }
      return true
    }),
  )

  // For the right panel — always shows all events, unfiltered
  const recentEvents = computed(() =>
    [...baseEvents.value].sort((a, b) => b.startTime.getTime() - a.startTime.getTime()).slice(0, 5),
  )

  const totalThisMonth = computed(() => baseEvents.value.length)
  const openCount = computed(
    () => baseEvents.value.filter((e) => e.status === 'pending-review').length,
  )

  const hasActiveFilters = computed(
    () => filterSearch.value !== '' || filterMinDropPct.value !== 0 || filterStatus.value !== 'all',
  )

  const selectedEvent = computed<FuelLossEvent | null>(
    () => baseEvents.value.find((e) => e.id === selectedEventId.value) ?? null,
  )

  // ── Mutations ────────────────────────────────────────────
  function markReviewed(id: string) {
    mutationOverrides.value = { ...mutationOverrides.value, [id]: 'coached' }
  }

  function markDismissed(id: string) {
    mutationOverrides.value = { ...mutationOverrides.value, [id]: 'dismissed' }
    if (selectedEventId.value === id) selectedEventId.value = null
  }

  function selectEvent(event: FuelLossEvent) {
    selectedEventId.value = selectedEventId.value === event.id ? null : event.id
  }

  function clearSelectedEvent() {
    selectedEventId.value = null
  }

  function clearFilters() {
    filterSearch.value = ''
    filterMinDropPct.value = 0
    filterStatus.value = 'all'
  }

  // ── CSV Export ───────────────────────────────────────────
  function exportCsv() {
    if (!import.meta.client) return

    const headers = [
      'Vehicle',
      'Driver',
      'Date',
      'Start Time',
      'End Time',
      'Duration (min)',
      'Location',
      'Fuel Start %',
      'Fuel End %',
      'Fuel Drop %',
      'Status',
    ]

    const { formatDate, formatTime } = useFormatters()
    const duration = (start: Date, end: Date) =>
      Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000)

    const rows = filteredEvents.value.map((e) => [
      e.vehicleName,
      e.driverName ?? '',
      formatDate(e.startTime),
      formatTime(e.startTime),
      formatTime(e.endTime),
      duration(e.startTime, e.endTime),
      e.location.address,
      e.fuelStart,
      e.fuelEnd,
      e.fuelDrop,
      e.status,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fuel-loss-events-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    events: baseEvents,
    mapFuelLossEvents,
    filteredEvents,
    filterSearch,
    filterMinDropPct,
    filterStatus,
    hasActiveFilters,
    recentEvents,
    totalThisMonth,
    openCount,
    selectedEvent,
    selectEvent,
    clearSelectedEvent,
    markReviewed,
    markDismissed,
    clearFilters,
    exportCsv,
  }
}
