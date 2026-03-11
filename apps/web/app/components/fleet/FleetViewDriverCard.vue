<script setup lang="ts">
import type { Driver, DriverStatus } from '@motive/shared'

const props = defineProps<{
  driver: Driver
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const STATUS_COLORS: Record<DriverStatus, string> = {
  driving: '#4ade80',
  idle: '#fbbf24',
  alert: '#f87171',
  offline: '#525252',
  sleeper: '#a78bfa',
}

const STATUS_LABELS: Record<DriverStatus, string> = {
  driving: 'DRIVING',
  idle: 'IDLE',
  alert: 'ALERT',
  offline: 'OFFLINE',
  sleeper: 'SLEEPER',
}

const hosPercent = computed(() => {
  const max = 11
  return Math.max(0, Math.min(100, (props.driver.hos.drivingRemaining / max) * 100))
})

const hosColor = computed(() => {
  const h = props.driver.hos.drivingRemaining
  if (props.driver.hos.hasViolation || h <= 0) return '#f87171'
  if (h <= 2) return '#fbbf24'
  return '#4ade80'
})

const statusColor = computed(() => STATUS_COLORS[props.driver.status])
const statusLabel = computed(() => STATUS_LABELS[props.driver.status])

function formatLastUpdated(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}
</script>

<template>
  <button
    type="button"
    :class="['fv-driver-card', { 'fv-driver-card--selected': isSelected }]"
    :aria-pressed="isSelected"
    :aria-label="`Select driver ${driver.name}`"
    @click="emit('select', driver.id)"
  >
    <!-- Left accent bar (selected state) -->
    <div
      class="fv-driver-card__accent"
      :style="{ backgroundColor: statusColor }"
      aria-hidden="true"
    />

    <!-- Avatar -->
    <div class="fv-driver-card__avatar" :style="{ borderColor: statusColor }" aria-hidden="true">
      {{ driver.initials }}
    </div>

    <!-- Info -->
    <div class="fv-driver-card__info">
      <div class="fv-driver-card__row">
        <span class="fv-driver-card__name">{{ driver.name }}</span>
        <span class="fv-driver-card__status" :style="{ color: statusColor }">{{
          statusLabel
        }}</span>
      </div>
      <div class="fv-driver-card__location">
        {{ driver.currentLocation.city }}, {{ driver.currentLocation.state }}
        <span v-if="driver.currentLoad" class="fv-driver-card__load"
          >· {{ driver.currentLoad }}</span
        >
      </div>

      <!-- HOS bar -->
      <div class="fv-driver-card__hos-row" aria-label="Hours of service remaining">
        <div class="fv-driver-card__hos-bar-track">
          <div
            class="fv-driver-card__hos-bar-fill"
            :style="{ width: `${hosPercent}%`, backgroundColor: hosColor }"
          />
        </div>
        <span class="fv-driver-card__hos-label" :style="{ color: hosColor }">
          <template v-if="driver.hos.hasViolation">VIOLATION</template>
          <template v-else>{{ driver.hos.drivingRemaining.toFixed(1) }}h</template>
        </span>
      </div>
    </div>

    <!-- Updated time -->
    <div class="fv-driver-card__updated">{{ formatLastUpdated(driver.lastUpdated) }}</div>
  </button>
</template>

<style scoped>
.fv-driver-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 0.875rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  text-align: left;
  transition: background-color 120ms ease;
  overflow: hidden;
}

.fv-driver-card:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.fv-driver-card--selected {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Left accent bar */
.fv-driver-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  opacity: 0;
  transition: opacity 120ms ease;
}

.fv-driver-card--selected .fv-driver-card__accent {
  opacity: 1;
}

/* Avatar */
.fv-driver-card__avatar {
  width: 30px;
  height: 30px;
  border-radius: 2px;
  border: 1.5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.5625rem;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--bg-elevated);
  flex-shrink: 0;
  letter-spacing: 0.04em;
}

/* Info block */
.fv-driver-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fv-driver-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.fv-driver-card__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fv-driver-card__status {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.725rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.fv-driver-card__location {
  font-size: 0.725rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fv-driver-card__load {
  color: var(--text-muted);
}

/* HOS bar */
.fv-driver-card__hos-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 2px;
}

.fv-driver-card__hos-bar-track {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1px;
  overflow: hidden;
}

.fv-driver-card__hos-bar-fill {
  height: 100%;
  border-radius: 1px;
  transition: width 300ms ease;
}

.fv-driver-card__hos-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.5625rem;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.04em;
}

/* Updated time */
.fv-driver-card__updated {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.725rem;
  color: var(--text-muted);
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 2px;
}
</style>
