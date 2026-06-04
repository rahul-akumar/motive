<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { MButton, MIcon, MSelect, type MSelectOption } from '@motive/ui'
import type { FuelDropStatus } from '@motive/shared'

const route = useRoute()
const { formatDate, formatTime } = useFormatters()

const eventId = computed(() => (route.params.id as string) ?? '')
const { event } = useFuelEventDetail(eventId)
const { allRows, updateEventStatus } = useFuelEventsData()

// ── Breadcrumb ───────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = {
  'fuel-loss': 'Fuel Loss',
  idling: 'Idling',
}

const breadcrumb = computed(() => {
  let label = eventId.value
  if (event.value) {
    const type = TYPE_LABEL[event.value.type] ?? event.value.type
    const date = formatDate(event.value.startTime)
    const time = formatTime(event.value.startTime)
    label = `${type} • ${date} ${time} EDT`
  }
  return [{ label: 'Fuel', to: '/fuel/events' }, { label: 'Events', to: '/fuel/events' }, { label }]
})

// ── Navigation ───────────────────────────────────────────────
const currentIndex = computed(() => allRows.value.findIndex((r) => r.id === eventId.value))
const totalEvents = computed(() => allRows.value.length)
const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(
  () => currentIndex.value < totalEvents.value - 1 && currentIndex.value >= 0,
)

function goToPrev() {
  if (canGoPrev.value) {
    const prev = allRows.value[currentIndex.value - 1]
    if (prev) navigateTo(`/fuel/events/${prev.id}`)
  }
}

function goToNext() {
  if (canGoNext.value) {
    const next = allRows.value[currentIndex.value + 1]
    if (next) navigateTo(`/fuel/events/${next.id}`)
  }
}

// ── Status ───────────────────────────────────────────────────
const STATUS_OPTIONS: MSelectOption<FuelDropStatus>[] = [
  { label: 'Pending review', value: 'pending-review' },
  { label: 'Coachable', value: 'coachable' },
  { label: 'Coached', value: 'coached' },
  { label: 'Dismissed', value: 'dismissed' },
]

function handleStatusChange(v: string | number | null) {
  if (!event.value || !v) return
  updateEventStatus(event.value.id, v as FuelDropStatus)
}
</script>

<template>
  <LayoutAppShell>
    <LayoutAppMainDetail :breadcrumb="breadcrumb">
      <template #actions>
        <MSelect
          v-if="event"
          :model-value="event.status"
          :options="STATUS_OPTIONS"
          label=""
          :clearable="false"
          class="event-detail-status"
          aria-label="Change event status"
          @update:model-value="handleStatusChange"
        />

        <div v-if="event" class="event-detail-nav">
          <MButton
            variant="outline"
            size="sm"
            icon-only
            :disabled="!canGoPrev"
            aria-label="Previous event"
            @click="goToPrev"
          >
            <MIcon :icon="ChevronLeft" :size="16" />
          </MButton>
          <span class="event-detail-nav__counter">
            {{ currentIndex >= 0 ? currentIndex + 1 : '–' }} / {{ totalEvents }}
          </span>
          <MButton
            variant="outline"
            size="sm"
            icon-only
            :disabled="!canGoNext"
            aria-label="Next event"
            @click="goToNext"
          >
            <MIcon :icon="ChevronRight" :size="16" />
          </MButton>
        </div>
      </template>

      <slot />
    </LayoutAppMainDetail>
  </LayoutAppShell>
</template>

<style scoped>
.event-detail-status {
  max-width: 180px;
}

.event-detail-status :deep(.m-select__trigger) {
  background-color: var(--mtv-color-brand-default);
  border-color: var(--mtv-color-brand-default);
  color: var(--mtv-color-brand-foreground);
}

.event-detail-status :deep(.m-select__trigger:hover:not(:disabled)) {
  background-color: var(--mtv-color-brand-hover);
  border-color: var(--mtv-color-brand-hover);
}

.event-detail-status :deep(.m-select__chevron) {
  color: var(--mtv-color-brand-foreground);
}

.event-detail-status :deep(.m-select__value) {
  color: var(--mtv-color-brand-foreground);
}

.event-detail-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.event-detail-nav__counter {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  min-width: 3.5rem;
  text-align: center;
  white-space: nowrap;
}
</style>
