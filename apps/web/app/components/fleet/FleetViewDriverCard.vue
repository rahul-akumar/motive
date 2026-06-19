<script setup lang="ts">
import type { FleetDriver } from '@motive/shared'
import { FLEET_STATUS_COLORS, FLEET_STATUS_LABELS, hosBarColor } from '~/composables/useFleetStatus'

const props = defineProps<{
  driver: FleetDriver
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const hosPercent = computed(() => {
  const max = 11
  return Math.max(0, Math.min(100, (props.driver.hos.driveRemaining / max) * 100))
})

const hosColor = computed(() => {
  const h = props.driver.hos.driveRemaining
  return hosBarColor((h / 11) * 100, props.driver.hos.hasViolation)
})

const statusColor = computed(() => FLEET_STATUS_COLORS[props.driver.status])
const statusLabel = computed(() => FLEET_STATUS_LABELS[props.driver.status])
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
          <template v-else>{{ driver.hos.driveRemaining.toFixed(1) }}h</template>
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.fv-driver-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem var(--page-gutter);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--mtv-color-border-default);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--mtv-duration-fast) var(--mtv-ease-standard);
  overflow: hidden;
}

.fv-driver-card:hover {
  background-color: var(--mtv-color-surface-accent-subtle);
}

.fv-driver-card--selected {
  background-color: var(--mtv-color-surface-accent);
}

/* Left accent bar */
.fv-driver-card__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  opacity: 0;
  transition: opacity var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.fv-driver-card--selected .fv-driver-card__accent {
  opacity: 1;
}

/* Avatar */
.fv-driver-card__avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  border: 1.5px solid;
  display: none;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  background: var(--mtv-color-surface-raised);
  flex-shrink: 0;
  letter-spacing: var(--tracking-wide);
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
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fv-driver-card__status {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
  flex-shrink: 0;
}

.fv-driver-card__location {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  background: var(--mtv-color-surface-accent);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.fv-driver-card__hos-bar-fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width var(--mtv-duration-base) var(--mtv-ease-standard);
}

.fv-driver-card__hos-label {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
  letter-spacing: var(--tracking-wide);
}
</style>
