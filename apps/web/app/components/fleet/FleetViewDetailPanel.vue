<script setup lang="ts">
import { X, MapPin, Package, Clock, Truck, Fuel, AlertTriangle } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import type { Driver, Vehicle, DriverStatus } from '@motive/shared'
import { FLEET_STATUS_COLORS, FLEET_STATUS_LABELS, hosBarColor } from '~/composables/useFleetStatus'

const props = defineProps<{
  driver: Driver | null
  vehicle: Vehicle | null
}>()

const emit = defineEmits<{
  close: []
}>()

// HOS gauge calculations
const drivingPercent = computed(() => {
  if (!props.driver) return 0
  return Math.max(0, Math.min(100, (props.driver.hos.drivingRemaining / 11) * 100))
})

const onDutyPercent = computed(() => {
  if (!props.driver) return 0
  return Math.max(0, Math.min(100, (props.driver.hos.onDutyRemaining / 14) * 100))
})

const cyclePercent = computed(() => {
  if (!props.driver) return 0
  const total = props.driver.hos.cycleUsed + props.driver.hos.cycleRemaining
  if (total === 0) return 0
  return Math.max(0, Math.min(100, (props.driver.hos.cycleRemaining / total) * 100))
})

function formatLastUpdated(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

function formatMileage(miles: number): string {
  return miles.toLocaleString()
}

const statusColor = computed(() =>
  props.driver ? FLEET_STATUS_COLORS[props.driver.status] : 'var(--fleet-status-offline)',
)
const statusLabel = computed(() => (props.driver ? FLEET_STATUS_LABELS[props.driver.status] : ''))
</script>

<template>
  <Transition name="fv-detail">
    <aside
      v-if="driver"
      class="fv-detail fleet-card"
      role="complementary"
      aria-label="Driver details"
    >
      <!-- Header -->
      <div class="fv-detail__header">
        <div class="fv-detail__avatar" :style="{ borderColor: statusColor }" aria-hidden="true">
          {{ driver.initials }}
        </div>
        <div class="fv-detail__header-info">
          <div class="fv-detail__name">{{ driver.name }}</div>
          <div class="fv-detail__status" :style="{ color: statusColor }">
            <span
              class="fv-detail__status-dot"
              :style="{ backgroundColor: statusColor }"
              aria-hidden="true"
            />
            {{ statusLabel }}
          </div>
        </div>
        <button
          type="button"
          class="fv-detail__close"
          aria-label="Close driver details"
          @click="emit('close')"
        >
          <MIcon :icon="X" :size="18" />
        </button>
      </div>

      <!-- Scrollable content -->
      <div class="fv-detail__body">
        <!-- Location -->
        <section class="fv-detail__section">
          <div class="fv-detail__section-label">
            <MIcon :icon="MapPin" :size="18" />
            Location
          </div>
          <div class="fv-detail__value">
            {{ driver.currentLocation.city }}, {{ driver.currentLocation.state }}
          </div>
          <div class="fv-detail__meta">Updated {{ formatLastUpdated(driver.lastUpdated) }}</div>
        </section>

        <!-- HOS Violation Banner -->
        <div v-if="driver.hos.hasViolation" class="fv-detail__violation" role="alert">
          <MIcon :icon="AlertTriangle" :size="18" />
          <span>HOS Violation — Immediate action required</span>
        </div>

        <!-- HOS Gauges -->
        <section class="fv-detail__section">
          <div class="fv-detail__section-label">
            <MIcon :icon="Clock" :size="18" />
            Hours of Service
          </div>

          <!-- Driving remaining (11h rule) -->
          <div class="fv-detail__hos-item">
            <div class="fv-detail__hos-row">
              <span class="fv-detail__hos-name">Drive Remaining</span>
              <span
                class="fv-detail__hos-value font-mono-data"
                :style="{ color: hosBarColor(drivingPercent, driver.hos.hasViolation) }"
              >
                <template v-if="driver.hos.hasViolation || driver.hos.drivingRemaining <= 0">
                  VIOLATION
                </template>
                <template v-else> {{ driver.hos.drivingRemaining.toFixed(1) }}h / 11h </template>
              </span>
            </div>
            <div class="fv-detail__hos-track">
              <div
                class="fv-detail__hos-fill"
                :style="{
                  width: `${drivingPercent}%`,
                  backgroundColor: hosBarColor(drivingPercent, driver.hos.hasViolation),
                }"
              />
            </div>
          </div>

          <!-- On duty remaining (14h rule) -->
          <div class="fv-detail__hos-item">
            <div class="fv-detail__hos-row">
              <span class="fv-detail__hos-name">On Duty Remaining</span>
              <span
                class="fv-detail__hos-value font-mono-data"
                :style="{ color: hosBarColor(onDutyPercent, driver.hos.hasViolation) }"
              >
                <template v-if="driver.hos.hasViolation || driver.hos.onDutyRemaining <= 0">
                  VIOLATION
                </template>
                <template v-else> {{ driver.hos.onDutyRemaining.toFixed(1) }}h / 14h </template>
              </span>
            </div>
            <div class="fv-detail__hos-track">
              <div
                class="fv-detail__hos-fill"
                :style="{
                  width: `${onDutyPercent}%`,
                  backgroundColor: hosBarColor(onDutyPercent, driver.hos.hasViolation),
                }"
              />
            </div>
          </div>

          <!-- Cycle hours -->
          <div class="fv-detail__hos-item">
            <div class="fv-detail__hos-row">
              <span class="fv-detail__hos-name">70h Cycle Remaining</span>
              <span
                class="fv-detail__hos-value font-mono-data"
                :style="{ color: hosBarColor(cyclePercent, false) }"
              >
                {{ driver.hos.cycleRemaining.toFixed(0) }}h
              </span>
            </div>
            <div class="fv-detail__hos-track">
              <div
                class="fv-detail__hos-fill"
                :style="{
                  width: `${cyclePercent}%`,
                  backgroundColor: hosBarColor(cyclePercent, false),
                }"
              />
            </div>
          </div>

          <!-- Today breakdown -->
          <div class="fv-detail__hos-breakdown">
            <div class="fv-detail__hos-breakdown-item">
              <span class="fv-detail__hos-breakdown-label">Driving</span>
              <span class="fv-detail__hos-breakdown-val font-mono-data"
                >{{ driver.hos.drivingToday.toFixed(1) }}h</span
              >
            </div>
            <div class="fv-detail__hos-breakdown-item">
              <span class="fv-detail__hos-breakdown-label">On Duty</span>
              <span class="fv-detail__hos-breakdown-val font-mono-data"
                >{{ driver.hos.onDutyToday.toFixed(1) }}h</span
              >
            </div>
            <div class="fv-detail__hos-breakdown-item">
              <span class="fv-detail__hos-breakdown-label">Sleeper</span>
              <span class="fv-detail__hos-breakdown-val font-mono-data"
                >{{ driver.hos.sleeperToday.toFixed(1) }}h</span
              >
            </div>
            <div class="fv-detail__hos-breakdown-item">
              <span class="fv-detail__hos-breakdown-label">Off Duty</span>
              <span class="fv-detail__hos-breakdown-val font-mono-data"
                >{{ driver.hos.offDutyToday.toFixed(1) }}h</span
              >
            </div>
          </div>
        </section>

        <!-- Load & ETA -->
        <section v-if="driver.currentLoad || driver.etaNextStop" class="fv-detail__section">
          <div class="fv-detail__section-label">
            <MIcon :icon="Package" :size="16" />
            Current Load
          </div>
          <div v-if="driver.currentLoad" class="fv-detail__value">{{ driver.currentLoad }}</div>
          <div v-if="driver.etaNextStop" class="fv-detail__meta">
            ETA next stop: <span class="fv-detail__eta">{{ driver.etaNextStop }}</span>
          </div>
          <div class="fv-detail__meta">
            Miles today:
            <span class="fv-detail__eta">{{ driver.milesDrivenToday.toLocaleString() }} mi</span>
          </div>
        </section>

        <!-- Vehicle -->
        <section v-if="vehicle" class="fv-detail__section">
          <div class="fv-detail__section-label">
            <MIcon :icon="Truck" :size="18" />
            Vehicle
          </div>
          <div class="fv-detail__value">
            {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
          </div>
          <div class="fv-detail__meta">
            {{ vehicle.licensePlate }} · {{ formatMileage(vehicle.mileage) }} mi
          </div>

          <!-- Fuel level -->
          <div class="fv-detail__fuel">
            <div class="fv-detail__fuel-row">
              <MIcon :icon="Fuel" :size="18" class="fv-detail__fuel-icon" />
              <span class="fv-detail__fuel-label">Fuel</span>
              <span class="fv-detail__fuel-value font-mono-data">{{ vehicle.fuelLevel }}%</span>
            </div>
            <div class="fv-detail__fuel-track">
              <div
                class="fv-detail__fuel-fill"
                :style="{
                  width: `${vehicle.fuelLevel}%`,
                  backgroundColor:
                    vehicle.fuelLevel < 20
                      ? 'var(--fleet-status-alert)'
                      : vehicle.fuelLevel < 40
                        ? 'var(--fleet-status-idle)'
                        : 'var(--fleet-status-driving)',
                }"
              />
            </div>
          </div>
        </section>

        <!-- Driver info -->
        <section class="fv-detail__section fv-detail__section--last">
          <div class="fv-detail__section-label">Driver Info</div>
          <div class="fv-detail__info-row">
            <span class="fv-detail__info-key">CDL</span>
            <span class="fv-detail__info-val font-mono-data">{{ driver.licenseNumber }}</span>
          </div>
          <div class="fv-detail__info-row">
            <span class="fv-detail__info-key">Phone</span>
            <span class="fv-detail__info-val font-mono-data">{{ driver.phone }}</span>
          </div>
          <div class="fv-detail__info-row">
            <span class="fv-detail__info-key">Vehicle ID</span>
            <span class="fv-detail__info-val font-mono-data">{{ driver.vehicleId }}</span>
          </div>
        </section>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.fv-detail {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--mtv-color-surface-default) 95%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-left: 1px solid var(--mtv-color-border-default);
  border-top: none;
  border-bottom: none;
  border-right: none;
  border-radius: 0;
  overflow: hidden;
}

/* Header */
.fv-detail__header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  flex-shrink: 0;
}

.fv-detail__avatar {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  background: var(--mtv-color-surface-raised);
  flex-shrink: 0;
  letter-spacing: var(--tracking-wide);
}

.fv-detail__header-info {
  flex: 1;
  min-width: 0;
}

.fv-detail__name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-normal);
  color: var(--mtv-color-foreground-default);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fv-detail__status {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  letter-spacing: var(--tracking-loose);
  text-transform: uppercase;
  margin-top: 2px;
}

.fv-detail__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 25%;
  flex-shrink: 0;
}

.fv-detail__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 29px;
  background: transparent;
  border-radius: 2px;
  color: var(--mtv-color-foreground-subtle);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.fv-detail__close:hover {
  background: oklch(1 0 0 / 0.06);
  color: var(--mtv-color-foreground-default);
}

/* Body */
.fv-detail__body {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 2rem;
}

/* Sections */
.fv-detail__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
}

.fv-detail__section--last {
  border-bottom: none;
}

.fv-detail__section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: var(--leading-none);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-loose);
  text-transform: uppercase;
  color: var(--mtv-color-foreground-subtle);
  margin-bottom: 0.5rem;
}

.fv-detail__value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  margin-bottom: 2px;
}

.fv-detail__meta {
  font-size: var(--font-size-md);
  color: var(--mtv-color-foreground-muted);
}

.fv-detail__eta {
  color: var(--mtv-color-foreground-default);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-md);
}

/* Violation banner */
.fv-detail__violation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--mtv-color-status-critical-subtle);
  border-bottom: 1px solid oklch(from var(--fleet-status-alert) l c h / 0.2);
  color: var(--fleet-status-alert);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

/* HOS items */
.fv-detail__hos-item {
  margin-bottom: 1rem;
}

.fv-detail__hos-item:last-of-type {
  margin-bottom: 0;
}

.fv-detail__hos-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.fv-detail__hos-name {
  font-size: var(--font-size-md);
  color: var(--mtv-color-foreground-muted);
}

.fv-detail__hos-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wide);
}

.fv-detail__hos-track {
  height: 4px;
  background: oklch(1 0 0 / 0.08);
  border-radius: 1px;
  overflow: hidden;
}

.fv-detail__hos-fill {
  height: 100%;
  border-radius: 1px;
  transition: width 400ms ease;
}

/* HOS breakdown grid */
.fv-detail__hos-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem;
  margin-top: 1rem;
  padding-top: 1rem;
}

.fv-detail__hos-breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.fv-detail__hos-breakdown-label {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.fv-detail__hos-breakdown-val {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
}

/* Fuel */
.fv-detail__fuel {
  margin-top: 0.5rem;
}

.fv-detail__fuel-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 4px;
}

.fv-detail__fuel-icon {
  color: var(--mtv-color-foreground-subtle);
}

.fv-detail__fuel-label {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  flex: 1;
}

.fv-detail__fuel-value {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
}

.fv-detail__fuel-track {
  height: 4px;
  background: oklch(1 0 0 / 0.08);
  border-radius: 1px;
  overflow: hidden;
}

.fv-detail__fuel-fill {
  height: 100%;
  border-radius: 1px;
  transition: width 400ms ease;
}

/* Info rows */
.fv-detail__info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
}

.fv-detail__info-row:last-child {
  border-bottom: none;
}

.fv-detail__info-key {
  font-size: var(--font-size-md);
  color: var(--mtv-color-foreground-subtle);
}

.fv-detail__info-val {
  font-size: var(--font-size-md);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-tight);
}

/* ── Transition ───────────────────────────────────────────────── */
.fv-detail-enter-active,
.fv-detail-leave-active {
  transition:
    transform 250ms ease,
    opacity 250ms ease;
}

.fv-detail-enter-from,
.fv-detail-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fv-detail-enter-active,
  .fv-detail-leave-active {
    transition: none;
  }
}

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .fv-detail {
    width: 100%;
    max-width: 360px;
  }
}
</style>
