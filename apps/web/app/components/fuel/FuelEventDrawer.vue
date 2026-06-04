<script setup lang="ts">
import { MapPin, Clock, Fuel, Droplets, Truck, User } from 'lucide-vue-next'
import { MBadge, MButton, MIcon } from '@motive/ui'
import type { FuelEventRow } from '~/composables/useFuelEventsData'

const props = defineProps<{
  event: FuelEventRow | null
}>()

const emit = defineEmits<{
  'view-details': [id: string]
}>()

const { formatDate, formatTime } = useFormatters()

const TYPE_LABEL: Record<string, string> = {
  'fuel-loss': 'Fuel Loss',
  idling: 'Idling',
}

const TYPE_BADGE_COLOR: Record<string, 'danger' | 'warning'> = {
  'fuel-loss': 'danger',
  idling: 'warning',
}

const STATUS_BADGE: Record<
  string,
  { color: 'warning' | 'success' | 'default' | 'danger'; label: string }
> = {
  'pending-review': { color: 'warning', label: 'Pending Review' },
  coachable: { color: 'danger', label: 'Coachable' },
  coached: { color: 'success', label: 'Coached' },
  dismissed: { color: 'default', label: 'Dismissed' },
}
</script>

<template>
  <div v-if="event" class="fuel-event-drawer">
    <!-- Type & Status -->
    <div class="fuel-event-drawer__section">
      <div class="fuel-event-drawer__row">
        <MBadge :label="TYPE_LABEL[event.type]" :color="TYPE_BADGE_COLOR[event.type]" size="sm" />
        <MBadge
          :label="STATUS_BADGE[event.status].label"
          :color="STATUS_BADGE[event.status].color"
          size="sm"
        />
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="fuel-event-drawer__section">
      <h4 class="fuel-event-drawer__section-title">Metrics</h4>
      <div class="fuel-event-drawer__metrics">
        <template v-if="event.type === 'fuel-loss'">
          <div class="fuel-event-drawer__metric">
            <MIcon :icon="Droplets" :size="14" class="fuel-event-drawer__metric-icon" />
            <span class="fuel-event-drawer__metric-label">Fuel Drop</span>
            <span class="fuel-event-drawer__metric-value fuel-event-drawer__metric-value--danger">
              {{ event.fuelDrop }}%
            </span>
          </div>
          <div class="fuel-event-drawer__metric">
            <MIcon :icon="Fuel" :size="14" class="fuel-event-drawer__metric-icon" />
            <span class="fuel-event-drawer__metric-label">Start → End</span>
            <span class="fuel-event-drawer__metric-value">
              {{ event.fuelStart }}% → {{ event.fuelEnd }}%
            </span>
          </div>
        </template>
        <template v-else>
          <div class="fuel-event-drawer__metric">
            <MIcon :icon="Clock" :size="14" class="fuel-event-drawer__metric-icon" />
            <span class="fuel-event-drawer__metric-label">Duration</span>
            <span class="fuel-event-drawer__metric-value">{{ event.durationMins }} min</span>
          </div>
          <div class="fuel-event-drawer__metric">
            <MIcon :icon="Fuel" :size="14" class="fuel-event-drawer__metric-icon" />
            <span class="fuel-event-drawer__metric-label">Fuel Wasted</span>
            <span class="fuel-event-drawer__metric-value fuel-event-drawer__metric-value--danger">
              {{ event.fuelWasted }} gal
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Timeline -->
    <div class="fuel-event-drawer__section">
      <h4 class="fuel-event-drawer__section-title">Timeline</h4>
      <div class="fuel-event-drawer__detail">
        <span class="fuel-event-drawer__detail-label">Start</span>
        <span class="fuel-event-drawer__detail-value">
          {{ formatDate(event.startTime) }} · {{ formatTime(event.startTime) }}
        </span>
      </div>
      <div class="fuel-event-drawer__detail">
        <span class="fuel-event-drawer__detail-label">End</span>
        <span class="fuel-event-drawer__detail-value">
          {{ formatDate(event.endTime) }} · {{ formatTime(event.endTime) }}
        </span>
      </div>
    </div>

    <!-- Location -->
    <div class="fuel-event-drawer__section">
      <h4 class="fuel-event-drawer__section-title">Location</h4>
      <div class="fuel-event-drawer__detail">
        <MIcon :icon="MapPin" :size="13" class="fuel-event-drawer__detail-icon" />
        <span class="fuel-event-drawer__detail-value">{{ event.location }}</span>
      </div>
    </div>

    <!-- Vehicle & Driver -->
    <div class="fuel-event-drawer__section">
      <h4 class="fuel-event-drawer__section-title">Vehicle & Driver</h4>
      <div class="fuel-event-drawer__detail">
        <MIcon :icon="Truck" :size="13" class="fuel-event-drawer__detail-icon" />
        <span class="fuel-event-drawer__detail-value">
          {{ event.vehicleName }}
          <span v-if="event.vehicleMMY" class="fuel-event-drawer__sub">{{ event.vehicleMMY }}</span>
        </span>
      </div>
      <div class="fuel-event-drawer__detail">
        <MIcon :icon="User" :size="13" class="fuel-event-drawer__detail-icon" />
        <span v-if="event.driverName" class="fuel-event-drawer__detail-value">
          {{ event.driverName }}
        </span>
        <span v-else class="fuel-event-drawer__muted">Unassigned</span>
      </div>
    </div>

    <!-- Footer action -->
    <div class="fuel-event-drawer__footer-action">
      <MButton variant="primary" size="sm" @click="emit('view-details', event.id)">
        View Full Details
      </MButton>
    </div>
  </div>
</template>

<style scoped>
.fuel-event-drawer {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.fuel-event-drawer__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fuel-event-drawer__section-title {
  margin: 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-subtle);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fuel-event-drawer__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── Metrics ─────────────────────────────────────────────── */
.fuel-event-drawer__metrics {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.fuel-event-drawer__metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  background: var(--mtv-color-surface-raised);
  border-radius: 4px;
}

.fuel-event-drawer__metric-icon {
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
}

.fuel-event-drawer__metric-label {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  flex: 1;
}

.fuel-event-drawer__metric-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-mono);
  color: var(--mtv-color-foreground-default);
}

.fuel-event-drawer__metric-value--danger {
  color: var(--mtv-color-status-danger);
}

/* ── Details ─────────────────────────────────────────────── */
.fuel-event-drawer__detail {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.fuel-event-drawer__detail-icon {
  color: var(--mtv-color-foreground-subtle);
  margin-top: 2px;
  flex-shrink: 0;
}

.fuel-event-drawer__detail-label {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  min-width: 3rem;
}

.fuel-event-drawer__detail-value {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}

.fuel-event-drawer__sub {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.fuel-event-drawer__muted {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}

/* ── Footer action ───────────────────────────────────────── */
.fuel-event-drawer__footer-action {
  padding-top: 0.5rem;
  border-top: 1px solid var(--mtv-color-border-default);
}
</style>
