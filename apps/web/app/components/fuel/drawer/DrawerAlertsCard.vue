<script setup lang="ts">
import { Bell } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

const { formatTime, formatDate } = useFormatters()

// Realistic alert tied to event detection time
const alert = computed(() => {
  const detectionTime = new Date(props.event.startTime)
  // Alert fires ~2 minutes after event start (detection latency)
  const alertTime = new Date(detectionTime.getTime() + 2 * 60_000)
  // Deterministic recipient from event id
  const hash = props.event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const recipients = ['fleet-ops@company.com', 'dispatch@company.com', 'safety-team@company.com']
  const recipient = recipients[hash % recipients.length]

  return {
    type: 'Fuel Loss Detected',
    time: alertTime,
    channel: 'Email',
    recipient,
  }
})
</script>

<template>
  <div class="drawer-alerts">
    <span class="drawer-alerts__label">ALERT</span>
    <div class="drawer-alerts__item">
      <MIcon :icon="Bell" :size="14" class="drawer-alerts__icon" />
      <div class="drawer-alerts__content">
        <span class="drawer-alerts__type">{{ alert.type }}</span>
        <span class="drawer-alerts__meta"> {{ alert.channel }} sent to {{ alert.recipient }} </span>
        <span class="drawer-alerts__time">
          {{ formatDate(alert.time) }} at {{ formatTime(alert.time) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-alerts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--mtv-color-surface-sunken);
  border-radius: var(--radius);
}

.drawer-alerts__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.drawer-alerts__item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.drawer-alerts__icon {
  color: var(--mtv-color-status-danger);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.drawer-alerts__content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.drawer-alerts__type {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.drawer-alerts__meta {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.drawer-alerts__time {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}
</style>
