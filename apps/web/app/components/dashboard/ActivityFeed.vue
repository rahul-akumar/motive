<script setup lang="ts">
import { ArrowRight, Check, TriangleAlert, XCircle, MapPin } from 'lucide-vue-next'
import type { ActivityEvent, ActivityEventType, ActivitySeverity } from '@motive/shared'

const props = defineProps<{
  events: ActivityEvent[]
  hasMore: boolean
}>()

const emit = defineEmits<{
  loadMore: []
}>()

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function getCSSVar(name: string): string {
  if (!import.meta.client) return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const eventConfig = computed(
  (): Record<ActivityEventType, { label: string; color: string; bg: string }> => {
    return {
      trip_started: { label: 'Trip Started', color: '#9a9a9a', bg: 'rgba(255,255,255,0.04)' },
      trip_completed: { label: 'Trip Completed', color: '#9a9a9a', bg: 'rgba(255,255,255,0.04)' },
      hos_warning: { label: 'HOS Warning', color: '#d97706', bg: 'rgba(217,119,6,0.06)' },
      hos_violation: { label: 'HOS Violation', color: '#dc2626', bg: 'rgba(220,38,38,0.06)' },
      geofence_enter: { label: 'Geofence Enter', color: '#8a8a8a', bg: 'rgba(255,255,255,0.04)' },
      geofence_exit: { label: 'Geofence Exit', color: '#8a8a8a', bg: 'rgba(255,255,255,0.04)' },
      fuel_stop: { label: 'Fuel Stop', color: '#8a8a8a', bg: 'rgba(255,255,255,0.04)' },
      alert_triggered: { label: 'Alert', color: '#d97706', bg: 'rgba(217,119,6,0.06)' },
      driver_login: { label: 'Driver Login', color: '#8a8a8a', bg: 'rgba(255,255,255,0.04)' },
      inspection_passed: { label: 'Inspection', color: '#8a8a8a', bg: 'rgba(255,255,255,0.04)' },
      vehicle_idle: { label: 'Vehicle Idle', color: '#d97706', bg: 'rgba(217,119,6,0.06)' },
    }
  },
)

function getConfig(type: ActivityEventType) {
  return eventConfig.value[type] || { label: type, color: '#64748b', bg: 'rgba(100,116,139,0.12)' }
}
</script>

<template>
  <div class="activity-feed fleet-card">
    <div class="activity-feed__header">
      <h2 class="activity-feed__title">Activity Feed</h2>
      <div class="activity-feed__live">
        <span class="status-dot status-dot--driving" aria-hidden="true" />
        <span class="activity-feed__live-label font-mono-data">LIVE</span>
      </div>
    </div>

    <div
      class="activity-feed__list"
      role="feed"
      aria-label="Fleet activity feed"
      aria-live="polite"
    >
      <article
        v-for="(event, i) in events"
        :key="event.id"
        class="activity-feed__item"
        :aria-label="`${event.driverName}: ${event.description}`"
      >
        <!-- Event type dot -->
        <div
          class="activity-feed__dot"
          :style="{ backgroundColor: getConfig(event.type).bg, color: getConfig(event.type).color }"
          aria-hidden="true"
        >
          <ArrowRight v-if="event.type === 'trip_started'" :size="10" :stroke-width="2.5" />
          <Check v-else-if="event.type === 'trip_completed'" :size="10" :stroke-width="2.5" />
          <TriangleAlert
            v-else-if="
              event.type === 'hos_warning' ||
              event.type === 'alert_triggered' ||
              event.type === 'vehicle_idle'
            "
            :size="10"
            :stroke-width="2.5"
          />
          <XCircle v-else-if="event.type === 'hos_violation'" :size="10" :stroke-width="2.5" />
          <!-- Default dot -->
          <svg v-else width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true">
            <circle cx="3" cy="3" r="3" />
          </svg>
        </div>

        <!-- Content -->
        <div class="activity-feed__content">
          <div class="activity-feed__event-header">
            <span
              class="activity-feed__event-type font-mono-data"
              :style="{ color: getConfig(event.type).color }"
            >
              {{ getConfig(event.type).label }}
            </span>
            <time
              class="activity-feed__time font-mono-data"
              :datetime="event.timestamp.toISOString()"
            >
              {{ formatRelativeTime(event.timestamp) }}
            </time>
          </div>
          <p class="activity-feed__description">{{ event.description }}</p>
          <div class="activity-feed__meta">
            <span class="activity-feed__driver">{{ event.driverName }}</span>
            <span v-if="event.location" class="activity-feed__location">
              <MapPin :size="10" :stroke-width="2" aria-hidden="true" />
              {{ event.location }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- Load more -->
    <button v-if="hasMore" class="activity-feed__load-more" type="button" @click="emit('loadMore')">
      Load more events
    </button>
  </div>
</template>

<style scoped>
.activity-feed {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-feed__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.activity-feed__title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  margin: 0;
}

.activity-feed__live {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.activity-feed__live-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
}

.activity-feed__list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activity-feed__item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  position: relative;
}

.activity-feed__item:last-child {
  border-bottom: none;
}

.activity-feed__dot {
  width: 24px;
  height: 24px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.activity-feed__content {
  flex: 1;
  min-width: 0;
}

.activity-feed__event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.activity-feed__event-type {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.activity-feed__time {
  font-size: 0.6875rem;
  color: var(--text-muted);
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.activity-feed__description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 0.375rem;
}

.activity-feed__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.activity-feed__driver {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.activity-feed__location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.activity-feed__load-more {
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--text-secondary);
  font-size: 0.6875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    color 100ms ease,
    background-color 100ms ease;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.06em;
}

.activity-feed__load-more:hover {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.04);
}
</style>
