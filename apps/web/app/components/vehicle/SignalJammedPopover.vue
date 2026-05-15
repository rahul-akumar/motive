<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next'
import { MBadge, MButton } from '@motive/ui'
import type { JammingEvent } from '@motive/shared'

interface Props {
  jammingEvent: JammingEvent
  elapsedSeconds: number
}

defineProps<Props>()

const emit = defineEmits<{
  'mark-incident': []
  'broadcast-incident': []
  'notify-online': []
}>()

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}
</script>

<template>
  <div class="signal-jammed-popover">
    <!-- Header -->
    <div class="signal-jammed-popover__header">
      <div class="signal-jammed-popover__title">
        <ShieldAlert :size="16" class="signal-jammed-popover__icon" />
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
      <MButton variant="danger" size="sm" @click="emit('mark-incident')"
        >Mark incident location</MButton
      >
      <MButton variant="outline" size="sm" @click="emit('broadcast-incident')"
        >Broadcast incident</MButton
      >
      <MButton variant="outline" size="sm" @click="emit('notify-online')"
        >Notify when back online</MButton
      >
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
  color: var(--color-red-9, #f87171);
}

.signal-jammed-popover__icon {
  color: var(--color-red-9, #f87171);
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
  font-size: 9px;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mtv-color-foreground-muted);
}

.signal-jammed-popover__metric-value {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
}

.signal-jammed-popover__metric-value--critical {
  color: var(--color-red-9, #f87171);
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
</style>
