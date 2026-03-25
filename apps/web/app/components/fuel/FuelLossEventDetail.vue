<script setup lang="ts">
import { X, MapPin, User, Clock, Fuel } from 'lucide-vue-next'
import { MIcon, MButton, MBadge } from '@motive/ui'
import type { FuelLossEvent, FuelDropStatus } from '@motive/shared'

defineProps<{
  event: FuelLossEvent
}>()

const emit = defineEmits<{
  close: []
  reviewed: [id: string]
  dismissed: [id: string]
}>()

const STATUS_BADGE: Record<
  FuelDropStatus,
  { color: 'warning' | 'success' | 'default'; label: string }
> = {
  open: { color: 'warning', label: 'Open' },
  reviewed: { color: 'success', label: 'Reviewed' },
  dismissed: { color: 'default', label: 'Dismissed' },
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function durationMins(start: Date, end: Date): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000)
}

function dropColor(drop: number): string {
  if (drop >= 10) return 'oklch(0.711 0.166 22.2)'
  if (drop >= 5) return 'oklch(0.837 0.164 84.4)'
  return 'oklch(0.700 0.177 253)'
}
</script>

<template>
  <aside class="fl-detail" role="complementary" aria-label="Fuel loss event details">
    <!-- Header -->
    <div class="fl-detail__header">
      <div class="fl-detail__header-info">
        <div class="fl-detail__vehicle">{{ event.vehicleName }}</div>
        <div class="fl-detail__time-range">
          {{ formatTime(event.startTime) }} → {{ formatTime(event.endTime) }}
        </div>
      </div>
      <button
        type="button"
        class="fl-detail__close"
        aria-label="Close event details"
        @click="emit('close')"
      >
        <X :size="16" :stroke-width="1.75" />
      </button>
    </div>

    <!-- Body -->
    <div class="fl-detail__body">
      <!-- Status -->
      <div class="fl-detail__section">
        <div class="fl-detail__section-label">
          <MIcon :icon="Fuel" :size="13" aria-hidden="true" />
          Status
        </div>
        <MBadge :color="STATUS_BADGE[event.status].color" size="sm">
          {{ STATUS_BADGE[event.status].label }}
        </MBadge>
      </div>

      <!-- Fuel visualization -->
      <div class="fl-detail__section fl-detail__section--fuel">
        <div class="fl-detail__fuel-labels">
          <span class="fl-detail__fuel-label">
            <span class="fl-detail__fuel-dot fl-detail__fuel-dot--start" />
            Start: <strong>{{ event.fuelStart }}%</strong>
          </span>
          <span class="fl-detail__fuel-drop-badge" :style="{ color: dropColor(event.fuelDrop) }">
            −{{ event.fuelDrop }}%
          </span>
          <span class="fl-detail__fuel-label">
            <span class="fl-detail__fuel-dot fl-detail__fuel-dot--end" />
            End: <strong>{{ event.fuelEnd }}%</strong>
          </span>
        </div>

        <!-- Bar: [remaining][drop][empty] -->
        <div
          class="fl-detail__fuel-bar"
          role="img"
          :aria-label="`Fuel dropped from ${event.fuelStart}% to ${event.fuelEnd}%`"
        >
          <div class="fl-detail__fuel-remaining" :style="{ width: `${event.fuelEnd}%` }" />
          <div
            class="fl-detail__fuel-lost"
            :style="{
              left: `${event.fuelEnd}%`,
              width: `${event.fuelDrop}%`,
              backgroundColor: dropColor(event.fuelDrop),
            }"
          />
        </div>

        <div class="fl-detail__fuel-scale">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <!-- Driver -->
      <div class="fl-detail__section">
        <div class="fl-detail__section-label">
          <MIcon :icon="User" :size="13" aria-hidden="true" />
          Driver
        </div>
        <span class="fl-detail__value">
          {{ event.driverName ?? 'Unknown driver' }}
        </span>
      </div>

      <!-- Location -->
      <div class="fl-detail__section">
        <div class="fl-detail__section-label">
          <MIcon :icon="MapPin" :size="13" aria-hidden="true" />
          Location
        </div>
        <span class="fl-detail__value fl-detail__value--address">
          {{ event.location.address }}
        </span>
      </div>

      <!-- Timeline -->
      <div class="fl-detail__section">
        <div class="fl-detail__section-label">
          <MIcon :icon="Clock" :size="13" aria-hidden="true" />
          Event window
        </div>
        <div class="fl-detail__timeline">
          <span class="fl-detail__value">{{ formatDateTime(event.startTime) }}</span>
          <span class="fl-detail__timeline-sep">→</span>
          <span class="fl-detail__value">{{ formatDateTime(event.endTime) }}</span>
          <span class="fl-detail__duration">
            {{ durationMins(event.startTime, event.endTime) }} min
          </span>
        </div>
      </div>
    </div>

    <!-- Footer CTAs -->
    <div v-if="event.status === 'open'" class="fl-detail__footer">
      <MButton variant="primary" size="sm" style="flex: 1" @click="emit('reviewed', event.id)">
        Mark as Reviewed
      </MButton>
      <MButton variant="ghost" size="sm" @click="emit('dismissed', event.id)"> Dismiss </MButton>
    </div>
  </aside>
</template>

<style scoped>
/* ── Panel container ─────────────────────────────────────── */
.fl-detail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ──────────────────────────────────────────────── */
.fl-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem 1rem 0.875rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.fl-detail__header-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.fl-detail__vehicle {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  line-height: var(--leading-tight);
}

.fl-detail__time-range {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}

.fl-detail__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--mtv-color-foreground-subtle);
  border-radius: 4px;
  padding: 0;
  flex-shrink: 0;
  transition: all 100ms ease;
}

.fl-detail__close:hover {
  background-color: var(--mtv-color-surface-hover);
  color: var(--mtv-color-foreground-default);
}

/* ── Body ────────────────────────────────────────────────── */
.fl-detail__body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Section ─────────────────────────────────────────────── */
.fl-detail__section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
}

.fl-detail__section:last-child {
  border-bottom: none;
}

.fl-detail__section-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--mtv-color-foreground-subtle);
}

.fl-detail__value {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
  line-height: var(--leading-tight);
}

.fl-detail__value--address {
  color: var(--mtv-color-foreground-muted);
}

/* ── Fuel visualization ──────────────────────────────────── */
.fl-detail__section--fuel {
  gap: 0.5rem;
}

.fl-detail__fuel-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fl-detail__fuel-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}

.fl-detail__fuel-label strong {
  color: var(--mtv-color-foreground-default);
  font-weight: var(--font-weight-semibold);
}

.fl-detail__fuel-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.fl-detail__fuel-dot--start {
  background-color: oklch(0.696 0.149 162.5);
}

.fl-detail__fuel-dot--end {
  background-color: var(--mtv-color-foreground-subtle);
}

.fl-detail__fuel-drop-badge {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.fl-detail__fuel-bar {
  position: relative;
  height: 10px;
  background-color: var(--mtv-color-border-default);
  border-radius: 5px;
  overflow: hidden;
}

.fl-detail__fuel-remaining {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: oklch(0.696 0.149 162.5 / 0.6);
  border-radius: 5px 0 0 5px;
}

.fl-detail__fuel-lost {
  position: absolute;
  top: 0;
  height: 100%;
  opacity: 0.85;
  border-radius: 0 2px 2px 0;
}

.fl-detail__fuel-scale {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  font-family: var(--font-family-mono);
}

/* ── Timeline ────────────────────────────────────────────── */
.fl-detail__timeline {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.fl-detail__timeline-sep {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  padding-left: 0.25rem;
}

.fl-detail__duration {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  margin-top: 0.1rem;
}

/* ── Footer ──────────────────────────────────────────────── */
.fl-detail__footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}
</style>
