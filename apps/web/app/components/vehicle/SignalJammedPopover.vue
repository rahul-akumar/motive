<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next'
import { MBadge, MButton, MIcon } from '@motive/ui'
import type { JammingEvent } from '@motive/shared'

interface Props {
  jammingEvent: JammingEvent
  elapsedSeconds: number
  isImmobilized?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'mark-incident': []
  'broadcast-incident': []
  'notify-online': []
  'inform-authorities': []
  're-mobilize': []
}>()

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const HOLD_DURATION_MS = 3000
const TICK_MS = 30
const holdProgress = ref(0)
let holdTimer: ReturnType<typeof setInterval> | null = null

function startHold() {
  holdProgress.value = 0
  holdTimer = setInterval(() => {
    holdProgress.value += (TICK_MS / HOLD_DURATION_MS) * 100
    if (holdProgress.value >= 100) {
      holdProgress.value = 100
      cancelHold()
      emit('re-mobilize')
    }
  }, TICK_MS)
}

function cancelHold() {
  if (holdTimer) {
    clearInterval(holdTimer)
    holdTimer = null
  }
  holdProgress.value = 0
}

onUnmounted(cancelHold)
</script>

<template>
  <div class="signal-jammed-popover">
    <!-- Header -->
    <div class="signal-jammed-popover__header">
      <div class="signal-jammed-popover__title">
        <MIcon :icon="ShieldAlert" :size="16" class="signal-jammed-popover__icon" />
        <span>Signal Jammed</span>
      </div>
      <MBadge :label="formatElapsed(elapsedSeconds)" color="danger" size="sm" />
    </div>

    <!-- Metrics grid -->
    <div class="signal-jammed-popover__grid">
      <div class="signal-jammed-popover__metric">
        <span class="signal-jammed-popover__metric-label">GPS</span>
        <span
          class="signal-jammed-popover__metric-value signal-jammed-popover__metric-value--critical"
          >Jammed</span
        >
      </div>
      <div class="signal-jammed-popover__metric">
        <span class="signal-jammed-popover__metric-label">CELLULAR</span>
        <span
          class="signal-jammed-popover__metric-value signal-jammed-popover__metric-value--critical"
          >Jammed</span
        >
      </div>
      <div class="signal-jammed-popover__metric">
        <span class="signal-jammed-popover__metric-label">RELAY</span>
        <span
          class="signal-jammed-popover__metric-value signal-jammed-popover__metric-value--critical"
          >Engaged</span
        >
      </div>
      <div class="signal-jammed-popover__metric">
        <span class="signal-jammed-popover__metric-label">BATTERY</span>
        <span class="signal-jammed-popover__metric-value">94%</span>
      </div>
    </div>

    <!-- Info row -->
    <div class="signal-jammed-popover__info">
      Speed: {{ jammingEvent.lastKnownSpeed }} km/h · Heading: {{ jammingEvent.lastKnownHeading }}°
      NW
    </div>

    <!-- Actions -->
    <div class="signal-jammed-popover__actions">
      <MButton variant="outline" size="sm" @click="emit('mark-incident')"
        >Mark incident location</MButton
      >
      <MButton variant="outline" size="sm" @click="emit('broadcast-incident')"
        >Broadcast incident</MButton
      >
      <MButton variant="outline" size="sm" @click="emit('notify-online')"
        >Notify when back online</MButton
      >
      <MButton variant="outline" size="sm" @click="emit('inform-authorities')"
        >Inform authorities</MButton
      >
      <button
        v-if="isImmobilized"
        class="signal-jammed-popover__hold-btn"
        @pointerdown.prevent="startHold"
        @pointerup="cancelHold"
        @pointerleave="cancelHold"
        @pointercancel="cancelHold"
      >
        <span class="signal-jammed-popover__hold-fill" :style="{ width: `${holdProgress}%` }" />
        <span class="signal-jammed-popover__hold-label">
          {{ holdProgress > 0 ? 'Keep holding…' : 'Re-mobilize' }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.signal-jammed-popover {
  width: 280px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.signal-jammed-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.signal-jammed-popover__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-status-critical);
}

.signal-jammed-popover__icon {
  color: var(--mtv-color-status-critical);
}

.signal-jammed-popover__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--mtv-color-border-default);
}

.signal-jammed-popover__metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.signal-jammed-popover__metric-label {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mtv-color-foreground-muted);
}

.signal-jammed-popover__metric-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
}

.signal-jammed-popover__metric-value--critical {
  color: var(--mtv-color-status-critical);
}

.signal-jammed-popover__info {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  padding-top: 0.5rem;
  border-top: 1px solid var(--mtv-color-border-default);
}

.signal-jammed-popover__actions {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--mtv-color-border-default);
}

.signal-jammed-popover__actions :deep(.m-button) {
  width: 100%;
}

.signal-jammed-popover__hold-btn {
  position: relative;
  width: 100%;
  height: 32px;
  border: none;
  border-radius: var(--radius);
  background: var(--mtv-color-brand-default);
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  touch-action: none;
}

.signal-jammed-popover__hold-fill {
  position: absolute;
  inset: 0;
  width: 0;
  background: var(--mtv-color-surface-accent);
  transition: width var(--mtv-duration-instant) var(--mtv-ease-linear);
  pointer-events: none;
}

.signal-jammed-popover__hold-label {
  position: relative;
  z-index: var(--mtv-z-raised);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-on-accent);
  letter-spacing: 0.02em;
}
</style>
