<script setup lang="ts">
import { ChevronLeft, ChevronRight, Search, Truck } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import type { Driver, DriverStatus } from '@motive/shared'

const props = defineProps<{
  drivers: Driver[]
  filteredDrivers: Driver[]
  selectedDriverId: string | null
  activeFilters: Set<DriverStatus>
  isAllSelected: boolean
  statusCounts: Record<DriverStatus, number>
  isPanelOpen: boolean
  searchQuery: string
}>()

const emit = defineEmits<{
  selectDriver: [id: string | null]
  toggleFilter: [status: DriverStatus]
  setAllFilters: []
  togglePanel: []
  'update:searchQuery': [value: string]
}>()

const STATUS_COLORS: Record<DriverStatus, string> = {
  driving: 'oklch(0.800 0.182 151.7)',
  idle: 'oklch(0.837 0.164 84.4)',
  alert: 'oklch(0.711 0.166 22.2)',
  offline: 'oklch(0.439 0.000 0)',
  sleeper: 'oklch(0.709 0.159 293.5)',
}

const STATUS_LABELS: Record<DriverStatus, string> = {
  driving: 'Driving',
  idle: 'Idle',
  alert: 'Alert',
  offline: 'Offline',
  sleeper: 'Sleeper',
}

const FILTER_ORDER: DriverStatus[] = ['driving', 'idle', 'alert', 'offline', 'sleeper']

const localSearch = computed({
  get: () => props.searchQuery,
  set: (v) => emit('update:searchQuery', v),
})
</script>

<template>
  <!-- Collapsed toggle button -->
  <Transition name="fv-panel-toggle">
    <button
      v-if="!isPanelOpen"
      type="button"
      class="fv-panel-toggle"
      aria-label="Open driver list panel"
      @click="emit('togglePanel')"
    >
      <MIcon :icon="Truck" :size="14" />
      <span class="fv-panel-toggle__count">{{ drivers.length }}</span>
      <MIcon :icon="ChevronRight" :size="12" />
    </button>
  </Transition>

  <!-- Main panel -->
  <Transition name="fv-panel">
    <aside v-if="isPanelOpen" class="fv-panel fleet-card" aria-label="Driver list panel">
      <!-- Header -->
      <div class="fv-panel__header">
        <div class="fv-panel__header-left">
          <MIcon :icon="Truck" :size="14" class="fv-panel__header-icon" />
          <span class="fv-panel__title font-condensed">Fleet</span>
          <span class="fv-panel__count font-mono-data">{{ drivers.length }}</span>
        </div>
        <button
          type="button"
          class="fv-panel__collapse-btn"
          aria-label="Collapse driver list panel"
          @click="emit('togglePanel')"
        >
          <MIcon :icon="ChevronLeft" :size="14" />
        </button>
      </div>

      <!-- Filter chips -->
      <div class="fv-panel__filters" role="group" aria-label="Filter by driver status">
        <button
          type="button"
          :class="['fv-filter-chip', { 'fv-filter-chip--active': isAllSelected }]"
          :aria-pressed="isAllSelected"
          @click="emit('setAllFilters')"
        >
          All
        </button>
        <button
          v-for="status in FILTER_ORDER"
          :key="status"
          type="button"
          :class="['fv-filter-chip', { 'fv-filter-chip--active': activeFilters.has(status) }]"
          :style="
            activeFilters.has(status)
              ? { borderColor: STATUS_COLORS[status], color: STATUS_COLORS[status] }
              : {}
          "
          :aria-pressed="activeFilters.has(status)"
          @click="emit('toggleFilter', status)"
        >
          <span
            class="fv-filter-chip__dot"
            :style="{ backgroundColor: STATUS_COLORS[status] }"
            aria-hidden="true"
          />
          {{ STATUS_LABELS[status] }}
          <span class="fv-filter-chip__count">{{ statusCounts[status] }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="fv-panel__search">
        <MIcon :icon="Search" :size="12" class="fv-panel__search-icon" />
        <input
          v-model="localSearch"
          type="search"
          class="fv-panel__search-input font-mono-data"
          placeholder="Search drivers..."
          aria-label="Search drivers by name"
        />
      </div>

      <!-- Driver list -->
      <div class="fv-panel__list" role="list" aria-label="Driver list">
        <div v-if="filteredDrivers.length === 0" class="fv-panel__empty">
          <span class="font-mono-data">No drivers match filters</span>
        </div>
        <div v-for="driver in filteredDrivers" :key="driver.id" role="listitem">
          <FleetViewDriverCard
            :driver="driver"
            :is-selected="driver.id === selectedDriverId"
            @select="emit('selectDriver', $event)"
          />
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
/* ── Collapsed toggle button ─────────────────────────────────── */
.fv-panel-toggle {
  position: absolute;
  top: 1rem;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.625rem 0.5rem 0.5rem;
  background: var(--mtv-color-surface-default);
  border: 1px solid var(--mtv-color-border-default);
  border-left: none;
  border-radius: 0 2px 2px 0;
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.fv-panel-toggle:hover {
  background: var(--mtv-color-surface-raised);
  color: var(--mtv-color-foreground-default);
}

.fv-panel-toggle__count {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
}

/* ── Main panel ──────────────────────────────────────────────── */
.fv-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--mtv-color-surface-default) 96%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-right: 1px solid var(--mtv-color-border-default);
  border-top: none;
  border-bottom: none;
  border-left: none;
  border-radius: 0;
  overflow: hidden;
}

/* Header */
.fv-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.75rem 0.75rem 0.875rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.fv-panel__header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fv-panel__header-icon {
  color: var(--mtv-color-foreground-subtle);
}

.fv-panel__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.fv-panel__count {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-subtle);
  background: oklch(1 0 0 / 0.06);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 2px;
  padding: 1px 5px;
  letter-spacing: var(--tracking-wide);
}

.fv-panel__collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 2px;
  color: var(--mtv-color-foreground-subtle);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.fv-panel__collapse-btn:hover {
  background: oklch(1 0 0 / 0.06);
  color: var(--mtv-color-foreground-default);
}

/* Filter chips */
.fv-panel__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.fv-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  background: transparent;
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 2px;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wider);
  color: var(--mtv-color-foreground-subtle);
  cursor: pointer;
  transition: all 120ms ease;
}

.fv-filter-chip:hover {
  border-color: var(--mtv-color-border-strong);
  color: var(--mtv-color-foreground-muted);
}

.fv-filter-chip--active {
  background: oklch(1 0 0 / 0.04);
  color: var(--mtv-color-foreground-default);
}

.fv-filter-chip__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.fv-filter-chip__count {
  color: var(--mtv-color-foreground-subtle);
  font-size: var(--font-size-2xs);
}

/* Search */
.fv-panel__search {
  position: relative;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.fv-panel__search-icon {
  position: absolute;
  left: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--mtv-color-foreground-subtle);
  pointer-events: none;
}

.fv-panel__search-input {
  width: 100%;
  padding: 0.375rem 0.5rem 0.375rem 1.75rem;
  background: oklch(1 0 0 / 0.04);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 2px;
  font-size: var(--font-size-md);
  color: var(--mtv-color-foreground-default);
  outline: none;
  transition: border-color 120ms ease;
}

.fv-panel__search-input::placeholder {
  color: var(--mtv-color-foreground-subtle);
}

.fv-panel__search-input:focus {
  border-color: var(--mtv-color-border-strong);
}

/* Driver list */
.fv-panel__list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.fv-panel__empty {
  padding: 2rem 1rem;
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
}

/* ── Transitions ─────────────────────────────────────────────── */
.fv-panel-enter-active,
.fv-panel-leave-active {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.fv-panel-enter-from,
.fv-panel-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.fv-panel-toggle-enter-active,
.fv-panel-toggle-leave-active {
  transition: opacity 150ms ease;
}

.fv-panel-toggle-enter-from,
.fv-panel-toggle-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fv-panel-enter-active,
  .fv-panel-leave-active,
  .fv-panel-toggle-enter-active,
  .fv-panel-toggle-leave-active {
    transition: none;
  }
}

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .fv-panel {
    width: 100%;
    max-width: 320px;
  }
}
</style>
