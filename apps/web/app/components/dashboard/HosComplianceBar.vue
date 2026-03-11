<script setup lang="ts">
import type { Driver } from '@motive/shared'

const props = defineProps<{
  drivers: Driver[]
}>()

const MAX_HOURS = 11 // 11-hour driving limit

const topDrivers = computed(() =>
  [...props.drivers]
    .filter((d) => d.status !== 'offline')
    .sort((a, b) => b.hos.drivingToday - a.hos.drivingToday)
    .slice(0, 5),
)

function hosBarWidth(hours: number): string {
  return `${Math.min((hours / MAX_HOURS) * 100, 100)}%`
}

function getCSSVar(name: string): string {
  if (!import.meta.client) return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function hosColor(driver: Driver): string {
  if (driver.hos.hasViolation) return '#dc2626'
  if (driver.hos.drivingRemaining <= 1) return '#d97706'
  if (driver.hos.drivingRemaining <= 3) return '#d97706'
  return getCSSVar('--accent') || '#e2e2e2'
}

function hosStatus(driver: Driver): string {
  if (driver.hos.hasViolation) return 'VIOLATION'
  if (driver.hos.drivingRemaining <= 1) return 'CRITICAL'
  if (driver.hos.drivingRemaining <= 3) return 'WARNING'
  return 'OK'
}

function hosStatusColor(driver: Driver): string {
  if (driver.hos.hasViolation) return '#dc2626'
  if (driver.hos.drivingRemaining <= 1) return '#dc2626'
  if (driver.hos.drivingRemaining <= 3) return '#d97706'
  return '#555555'
}
</script>

<template>
  <div class="hos-bar fleet-card">
    <div class="hos-bar__header">
      <h2 class="hos-bar__title">HOS Compliance</h2>
      <p class="hos-bar__subtitle font-mono-data">Top 5 drivers by hours driven</p>
    </div>

    <div class="hos-bar__list" role="list" aria-label="HOS compliance by driver">
      <div v-for="driver in topDrivers" :key="driver.id" class="hos-bar__item" role="listitem">
        <!-- Driver info -->
        <div class="hos-bar__driver">
          <div class="hos-bar__avatar" aria-hidden="true">{{ driver.initials }}</div>
          <div class="hos-bar__driver-info">
            <span class="hos-bar__driver-name">{{ driver.name.split(' ')[0] }}</span>
            <span
              class="hos-bar__status font-mono-data"
              :style="{ color: hosStatusColor(driver) }"
              :aria-label="`HOS status: ${hosStatus(driver)}`"
            >
              {{ hosStatus(driver) }}
            </span>
          </div>
        </div>

        <!-- Bar -->
        <div
          class="hos-bar__track"
          :aria-label="`${driver.hos.drivingToday.toFixed(1)} of ${MAX_HOURS} hours driven`"
        >
          <div
            class="hos-bar__fill"
            :style="{
              width: hosBarWidth(driver.hos.drivingToday),
              backgroundColor: hosColor(driver),
            }"
          />
          <!-- Remaining indicator -->
          <div
            v-if="!driver.hos.hasViolation && driver.hos.drivingRemaining > 0"
            class="hos-bar__remaining"
            :style="{
              width: hosBarWidth(driver.hos.drivingRemaining),
              left: hosBarWidth(driver.hos.drivingToday),
            }"
          />
        </div>

        <!-- Hours -->
        <div class="hos-bar__hours font-mono-data">
          <span class="hos-bar__hours-driven">{{ driver.hos.drivingToday.toFixed(1) }}h</span>
          <span class="hos-bar__hours-sep">/</span>
          <span class="hos-bar__hours-remaining" :style="{ color: hosStatusColor(driver) }">
            {{ driver.hos.drivingRemaining.toFixed(1) }}h left
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hos-bar {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hos-bar__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.hos-bar__title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  margin: 0;
}

.hos-bar__subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 2px 0 0;
  letter-spacing: 0.04em;
}

.hos-bar__list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.hos-bar__item {
  display: grid;
  grid-template-columns: 140px 1fr 120px;
  align-items: center;
  gap: 0.75rem;
}

.hos-bar__driver {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hos-bar__avatar {
  width: 24px;
  height: 24px;
  border-radius: 25%;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hos-bar__driver-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.hos-bar__driver-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hos-bar__status {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hos-bar__track {
  position: relative;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0;
  overflow: hidden;
}

.hos-bar__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 0;
  transition: width 600ms ease;
}

.hos-bar__remaining {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.04);
  border-radius: 0;
}

.hos-bar__hours {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: flex-end;
}

.hos-bar__hours-driven {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.hos-bar__hours-sep {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.hos-bar__hours-remaining {
  font-size: 1rem;
  font-weight: 500;
}
</style>
