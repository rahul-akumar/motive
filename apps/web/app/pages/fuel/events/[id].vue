<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { MBadge, MIcon } from '@motive/ui'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

definePageMeta({
  title: 'Event Detail',
  moduleName: 'Fuel',
  mainVariant: 'default',
})

const route = useRoute()
const eventId = computed(() => route.params.id as string)
const { formatDate, formatTime } = useFormatters()

// Look up event from composable data
const { event, notFound } = useFuelEventDetail(eventId)

const TYPE_LABEL: Record<string, string> = {
  'fuel-loss': 'Fuel Loss',
  idling: 'Idling',
}

const breadcrumbLabel = computed(() => {
  if (!event.value) return ''
  const type = TYPE_LABEL[event.value.type] ?? event.value.type
  const date = formatDate(event.value.startTime)
  const time = formatTime(event.value.startTime)
  return `${type} • ${date} ${time} EDT`
})
</script>

<template>
  <div class="fe-detail-page">
    <!-- Breadcrumb header -->
    <nav class="fe-detail-page__breadcrumb" aria-label="Breadcrumb">
      <NuxtLinkLocale to="/fuel/events" class="fe-detail-page__crumb-link"> Fuel </NuxtLinkLocale>
      <MIcon :icon="ChevronRight" :size="12" class="fe-detail-page__crumb-sep" />
      <NuxtLinkLocale to="/fuel/events" class="fe-detail-page__crumb-link"> Events </NuxtLinkLocale>
      <MIcon :icon="ChevronRight" :size="12" class="fe-detail-page__crumb-sep" />
      <span class="fe-detail-page__crumb-current">{{ breadcrumbLabel }}</span>
    </nav>

    <!-- Content -->
    <div v-if="notFound" class="fe-detail-page__state">
      <p class="fe-detail-page__not-found">Event "{{ eventId }}" not found.</p>
      <NuxtLinkLocale to="/fuel/events" class="fe-detail-page__back">
        ← Back to Events
      </NuxtLinkLocale>
    </div>

    <div v-else-if="event" class="fe-detail-page__content">
      <!-- Placeholder: design TBD -->
      <div class="fe-detail-page__header-row">
        <h1 class="fe-detail-page__title">{{ TYPE_LABEL[event.type] }} Event</h1>
        <MBadge :label="event.status" size="sm" />
      </div>

      <div class="fe-detail-page__placeholder">
        <p>Event detail layout will be provided by design.</p>
        <p class="fe-detail-page__placeholder-meta">
          Vehicle: {{ event.vehicleName }} · Driver: {{ event.driverName ?? 'Unassigned' }} ·
          Location: {{ event.location }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fe-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem 1.5rem 1.5rem;
  overflow: auto;
}

/* ── Breadcrumb ──────────────────────────────────────────── */
.fe-detail-page__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
}

.fe-detail-page__crumb-link {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  text-decoration: none;
  transition: color 100ms ease;
}

.fe-detail-page__crumb-link:hover {
  color: var(--mtv-color-brand-default);
}

.fe-detail-page__crumb-sep {
  color: var(--mtv-color-foreground-subtle);
}

.fe-detail-page__crumb-current {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

/* ── States ──────────────────────────────────────────────── */
.fe-detail-page__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.75rem;
}

.fe-detail-page__not-found {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.fe-detail-page__back {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-brand-default);
  text-decoration: none;
}

.fe-detail-page__back:hover {
  text-decoration: underline;
}

/* ── Content ─────────────────────────────────────────────── */
.fe-detail-page__content {
  flex: 1;
}

.fe-detail-page__header-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.fe-detail-page__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.fe-detail-page__placeholder {
  padding: 2rem;
  background: var(--mtv-color-surface-raised);
  border: 1px dashed var(--mtv-color-border-default);
  border-radius: 6px;
  text-align: center;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
}

.fe-detail-page__placeholder-meta {
  margin-top: 0.75rem;
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
}
</style>
