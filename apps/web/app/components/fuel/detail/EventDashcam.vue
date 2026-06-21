<script setup lang="ts">
import { MIcon } from '@motive/ui'
import { Video, Pause, Play, Gauge, ArrowDown, Cog, Clock, ArrowRight } from 'lucide-vue-next'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'
import EventDashcamFuelTimeline from './EventDashcamFuelTimeline.vue'

const props = defineProps<{
  event: FuelEventRow
}>()

// ── Playback state ──────────────────────────────────────────
const isPlaying = ref(false)
const playbackSpeed = ref(1)
const currentTime = ref(6) // seconds into video
const totalDuration = ref(10) // seconds

const formattedCurrent = computed(() => formatSec(currentTime.value))
const formattedTotal = computed(() => formatSec(totalDuration.value))
const progressPercent = computed(() => (currentTime.value / totalDuration.value) * 100)

function formatSec(s: number): string {
  const min = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function cycleSpeed() {
  playbackSpeed.value = playbackSpeed.value === 1 ? 2 : 1
}

function seekTo(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  currentTime.value = Math.round(pct * totalDuration.value)
}

// ── Telematics data (mock, deterministic from event ID) ─────
const seed = props.event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

const telematics = computed(() => {
  const s = seed
  return {
    speed: 30 + (s % 40),
    speedLimit: 35,
    accel: 50 + (s % 30),
    decel: 15 + ((s * 3) % 25),
    rpm: 1200 + (s % 1200),
    timeHit: `${(0.5 + (s % 15) * 0.1).toFixed(1)} sec`,
    signal: s % 2 === 0 ? 'Left' : 'Right',
    seatBelt: s % 3 !== 0 ? 'Buckled' : 'Unbuckled',
    cruise: s % 4 !== 0 ? 'Enabled' : 'Disabled',
  }
})
</script>

<template>
  <div class="dashcam">
    <!-- Video panels -->
    <div class="dashcam__videos">
      <div class="dashcam__video-panel dashcam__video-panel--main">
        <div class="dashcam__placeholder">
          <MIcon :icon="Video" :size="32" />
          <span>Road-facing camera</span>
        </div>
        <div class="dashcam__speed-overlay">
          <span class="dashcam__speed-value">{{ telematics.speed }}</span>
          <span class="dashcam__speed-unit">MPH</span>
          <span class="dashcam__speed-limit">{{ telematics.speedLimit }} AUTO</span>
        </div>
      </div>
      <div class="dashcam__video-panel dashcam__video-panel--secondary">
        <div class="dashcam__placeholder">
          <MIcon :icon="Video" :size="24" />
          <span>Driver-facing</span>
        </div>
      </div>
    </div>

    <!-- Controls bar -->
    <div class="dashcam__controls">
      <button class="dashcam__btn" aria-label="Play/Pause" @click="togglePlay">
        <MIcon :icon="isPlaying ? Pause : Play" :size="16" />
      </button>
      <span class="dashcam__time">{{ formattedCurrent }} / {{ formattedTotal }}</span>
      <div class="dashcam__seekbar" @click="seekTo">
        <div class="dashcam__seekbar-fill" :style="{ width: `${progressPercent}%` }" />
        <div class="dashcam__seekbar-thumb" :style="{ left: `${progressPercent}%` }" />
      </div>
      <button class="dashcam__btn" aria-label="Playback speed" @click="cycleSpeed">
        {{ playbackSpeed }}x
      </button>
    </div>

    <!-- Telematics strip -->
    <div class="dashcam__telematics">
      <div class="dashcam__metric">
        <span class="dashcam__metric-value">{{ telematics.speed }}</span>
        <span class="dashcam__metric-label">MPH</span>
      </div>
      <div class="dashcam__metric">
        <span class="dashcam__metric-value">{{ telematics.speedLimit }}</span>
        <span class="dashcam__metric-label">AUTO</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="Gauge" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.accel }}%</span>
        <span class="dashcam__metric-label">ACCEL</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="ArrowDown" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.decel }}%</span>
        <span class="dashcam__metric-label">DECEL</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="Cog" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.rpm.toLocaleString() }}</span>
        <span class="dashcam__metric-label">RPM</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="Clock" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.timeHit }}</span>
        <span class="dashcam__metric-label">TIME HIT</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="ArrowRight" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.signal }}</span>
        <span class="dashcam__metric-label">SIGNAL</span>
      </div>
      <div class="dashcam__metric">
        <span class="dashcam__metric-value">{{ telematics.seatBelt }}</span>
        <span class="dashcam__metric-label">SEAT BELT</span>
      </div>
      <div class="dashcam__metric">
        <span class="dashcam__metric-value">{{ telematics.cruise }}</span>
        <span class="dashcam__metric-label">CRUISE</span>
      </div>
    </div>

    <!-- Fuel level timeline -->
    <EventDashcamFuelTimeline
      :event="event"
      :current-time="currentTime"
      :total-duration="totalDuration"
    />
  </div>
</template>

<style scoped>
.dashcam {
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--radius);
  background: var(--mtv-color-surface-base);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: var(--mtv-color-foreground-default);
}

/* ── Video panels ─────────────────────────────── */
.dashcam__videos {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 1px;
  background: var(--mtv-color-surface-default);
}

.dashcam__video-panel {
  position: relative;
  background: var(--mtv-color-surface-sunken);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashcam__video-panel--main {
  min-height: 240px;
}

.dashcam__video-panel--secondary {
  min-height: 240px;
}

.dashcam__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-xs);
}

.dashcam__speed-overlay {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  background: oklch(from var(--mtv-color-surface-base) l c h / 0.85);
  padding: 0.375rem 0.625rem;
  border-radius: var(--radius-sm);
}

.dashcam__speed-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--mtv-color-foreground-default);
}

.dashcam__speed-unit {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.dashcam__speed-limit {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  margin-left: 0.5rem;
}

/* ── Controls ─────────────────────────────────── */
.dashcam__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--mtv-color-border-default);
  background: var(--mtv-color-surface-base);
}

.dashcam__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--mtv-color-foreground-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.dashcam__btn:hover {
  background: var(--mtv-color-surface-default);
}

.dashcam__time {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  font-variant-numeric: tabular-nums;
  min-width: 5rem;
}

.dashcam__seekbar {
  flex: 1;
  height: 4px;
  background: var(--mtv-color-border-default);
  border-radius: var(--radius-sm);
  position: relative;
  cursor: pointer;
}

.dashcam__seekbar-fill {
  height: 100%;
  background: var(--mtv-color-foreground-muted);
  border-radius: var(--radius-sm);
}

.dashcam__seekbar-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--mtv-color-foreground-default);
  box-shadow: var(--mtv-shadow-sm);
}

/* ── Telematics strip ─────────────────────────── */
.dashcam__telematics {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--mtv-color-border-default);
  background: var(--mtv-color-surface-base);
  flex-wrap: wrap;
}

.dashcam__metric {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dashcam__metric-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.dashcam__metric-label {
  font-size: var(--font-size-2xs);
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
</style>
