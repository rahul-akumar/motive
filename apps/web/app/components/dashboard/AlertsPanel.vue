<script setup lang="ts">
import { TriangleAlert, Info, X, ChevronRight, CheckCircle2 } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import type { FleetAlert } from '@motive/shared'

const props = defineProps<{
  alerts: FleetAlert[]
  criticalCount: number
  warningCount: number
}>()

const emit = defineEmits<{
  dismiss: [id: string]
  dismissAll: []
}>()

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getCSSVar(name: string): string {
  if (!import.meta.client) return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const severityConfig = computed(() => {
  return {
    critical: {
      label: 'CRITICAL',
      color: '#dc2626',
      bg: 'rgba(220,38,38,0.06)',
      border: '#dc2626',
      iconColor: '#dc2626',
    },
    warning: {
      label: 'WARNING',
      color: '#d97706',
      bg: 'rgba(217,119,6,0.06)',
      border: '#d97706',
      iconColor: '#d97706',
    },
    info: {
      label: 'INFO',
      color: '#8a8a8a',
      bg: 'rgba(255,255,255,0.04)',
      border: '#555555',
      iconColor: '#8a8a8a',
    },
  }
})
</script>

<template>
  <div class="alerts-panel fleet-card">
    <div class="alerts-panel__header">
      <div class="alerts-panel__title-row">
        <h2 class="alerts-panel__title">Alerts</h2>
        <div class="alerts-panel__counts">
          <span
            v-if="criticalCount > 0"
            class="alerts-panel__count alerts-panel__count--critical font-mono-data"
          >
            {{ criticalCount }} critical
          </span>
          <span
            v-if="warningCount > 0"
            class="alerts-panel__count alerts-panel__count--warning font-mono-data"
          >
            {{ warningCount }} warning
          </span>
        </div>
      </div>
      <button
        v-if="alerts.length > 0"
        class="alerts-panel__dismiss-all"
        type="button"
        @click="emit('dismissAll')"
        aria-label="Dismiss all alerts"
      >
        Dismiss all
      </button>
    </div>

    <div v-if="alerts.length === 0" class="alerts-panel__empty" role="status" aria-live="polite">
      <MIcon :icon="CheckCircle2" :size="32" color="#334155" :stroke-width="1.5" />
      <p class="alerts-panel__empty-text">No active alerts</p>
    </div>

    <div
      v-else
      class="alerts-panel__list"
      role="list"
      aria-label="Active alerts"
      aria-live="polite"
    >
      <TransitionGroup name="alert-item">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          :class="`alert-card alert-card--${alert.severity}`"
          role="listitem"
          :aria-label="`${alert.severity} alert: ${alert.title}`"
        >
          <div class="alert-card__header">
            <div class="alert-card__title-row">
              <!-- Severity icon -->
              <MIcon
                v-if="alert.severity === 'critical' || alert.severity === 'warning'"
                :icon="TriangleAlert"
                :size="14"
                :color="severityConfig[alert.severity].iconColor"
                :stroke-width="2"
                class="alert-card__icon"
              />
              <MIcon
                v-else
                :icon="Info"
                :size="14"
                :color="severityConfig[alert.severity].iconColor"
                :stroke-width="2"
                class="alert-card__icon"
              />
              <span
                class="alert-card__severity font-mono-data"
                :style="{ color: severityConfig[alert.severity].color }"
              >
                {{ severityConfig[alert.severity].label }}
              </span>
            </div>
            <div class="alert-card__actions">
              <time
                class="alert-card__time font-mono-data"
                :datetime="alert.timestamp.toISOString()"
              >
                {{ formatTime(alert.timestamp) }}
              </time>
              <button
                class="alert-card__dismiss"
                type="button"
                @click="emit('dismiss', alert.id)"
                :aria-label="`Dismiss alert: ${alert.title}`"
              >
                <MIcon :icon="X" :size="12" :stroke-width="2.5" />
              </button>
            </div>
          </div>

          <h3 class="alert-card__title">{{ alert.title }}</h3>
          <p class="alert-card__description">{{ alert.description }}</p>

          <div v-if="alert.actionLabel" class="alert-card__footer">
            <button class="alert-card__action-btn" type="button">
              {{ alert.actionLabel }}
              <MIcon :icon="ChevronRight" :size="12" :stroke-width="2" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.alerts-panel {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alerts-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.alerts-panel__title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.alerts-panel__title {
  font-family: var(--font-family-condensed);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
  margin: 0;
}

.alerts-panel__counts {
  display: flex;
  gap: 0.5rem;
}

.alerts-panel__count {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
  padding: 1px 5px;
  border-radius: 2px;
  font-family: var(--font-family-mono);
}

.alerts-panel__count--critical {
  background-color: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.alerts-panel__count--warning {
  background-color: rgba(217, 119, 6, 0.08);
  color: #d97706;
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.alerts-panel__dismiss-all {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--font-family-sans);
  transition: color 150ms ease;
  padding: 0;
}

.alerts-panel__dismiss-all:hover {
  color: var(--text-secondary);
}

.alerts-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 0;
}

.alerts-panel__empty-text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0;
}

.alerts-panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.alert-card {
  border-radius: 2px;
  padding: 0.875rem;
  border-left: 2px solid;
}

.alert-card--critical {
  background-color: rgba(220, 38, 38, 0.05);
  border-left-color: #dc2626;
}

.alert-card--warning {
  background-color: rgba(217, 119, 6, 0.05);
  border-left-color: #d97706;
}

.alert-card--info {
  background-color: var(--accent-subtle);
  border-left-color: var(--accent);
}

.alert-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.375rem;
}

.alert-card__title-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.alert-card__icon {
  flex-shrink: 0;
}

.alert-card__severity {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
}

.alert-card__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-card__time {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  letter-spacing: var(--tracking-normal);
}

.alert-card__dismiss {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    color 100ms ease,
    background-color 100ms ease;
}

.alert-card__dismiss:hover {
  color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.06);
}

.alert-card__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  line-height: var(--leading-tight);
}

.alert-card__description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
  margin: 0;
}

.alert-card__footer {
  margin-top: 0.625rem;
}

.alert-card__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--accent);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: var(--font-family-sans);
  transition: color 150ms ease;
}

.alert-card__action-btn:hover {
  opacity: 0.8;
}

/* TransitionGroup animations */
.alert-item-enter-active {
  transition: all 0.3s ease;
}

.alert-item-leave-active {
  transition: all 0.25s ease;
}

.alert-item-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.alert-item-leave-to {
  opacity: 0;
  transform: translateX(-8px);
  max-height: 0;
}
</style>
