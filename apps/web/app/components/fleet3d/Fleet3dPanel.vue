<script setup lang="ts">
import { ChevronLeft, ChevronRight, Globe, Search } from 'lucide-vue-next'
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
  driving: '#4ade80',
  idle: '#fbbf24',
  alert: '#f87171',
  offline: '#525252',
  sleeper: '#a78bfa',
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
  <Transition name="f3d-panel-toggle">
    <button
      v-if="!isPanelOpen"
      type="button"
      class="f3d-panel-toggle"
      aria-label="Open driver list panel"
      @click="emit('togglePanel')"
    >
      <MIcon :icon="Globe" :size="14" />
      <span class="f3d-panel-toggle__count">{{ drivers.length }}</span>
      <MIcon :icon="ChevronRight" :size="12" />
    </button>
  </Transition>

  <!-- Main panel -->
  <Transition name="f3d-panel">
    <aside v-if="isPanelOpen" class="f3d-panel fleet-card" aria-label="Driver list panel">
      <!-- Header -->
      <div class="f3d-panel__header">
        <div class="f3d-panel__header-left">
          <MIcon :icon="Globe" :size="14" class="f3d-panel__header-icon" />
          <span class="f3d-panel__title font-condensed">Fleet 3D</span>
          <span class="f3d-panel__count font-mono-data">{{ drivers.length }}</span>
        </div>
        <button
          type="button"
          class="f3d-panel__collapse-btn"
          aria-label="Collapse driver list panel"
          @click="emit('togglePanel')"
        >
          <MIcon :icon="ChevronLeft" :size="14" />
        </button>
      </div>

      <!-- Filter chips -->
      <div class="f3d-panel__filters" role="group" aria-label="Filter by driver status">
        <button
          type="button"
          :class="['f3d-filter-chip', { 'f3d-filter-chip--active': isAllSelected }]"
          :aria-pressed="isAllSelected"
          @click="emit('setAllFilters')"
        >
          All
        </button>
        <button
          v-for="status in FILTER_ORDER"
          :key="status"
          type="button"
          :class="['f3d-filter-chip', { 'f3d-filter-chip--active': activeFilters.has(status) }]"
          :style="
            activeFilters.has(status)
              ? { borderColor: STATUS_COLORS[status], color: STATUS_COLORS[status] }
              : {}
          "
          :aria-pressed="activeFilters.has(status)"
          @click="emit('toggleFilter', status)"
        >
          <span
            class="f3d-filter-chip__dot"
            :style="{ backgroundColor: STATUS_COLORS[status] }"
            aria-hidden="true"
          />
          {{ STATUS_LABELS[status] }}
          <span class="f3d-filter-chip__count">{{ statusCounts[status] }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="f3d-panel__search">
        <MIcon :icon="Search" :size="12" class="f3d-panel__search-icon" />
        <input
          v-model="localSearch"
          type="search"
          class="f3d-panel__search-input font-mono-data"
          placeholder="Search drivers..."
          aria-label="Search drivers by name"
        />
      </div>

      <!-- Driver list -->
      <div class="f3d-panel__list" role="list" aria-label="Driver list">
        <div v-if="filteredDrivers.length === 0" class="f3d-panel__empty">
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
.f3d-panel-toggle {
  position: absolute;
  top: 1rem;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.625rem 0.5rem 0.5rem;
  background: rgba(10, 10, 20, 0.85);
  border: 1px solid rgba(100, 130, 255, 0.2);
  border-left: none;
  border-radius: 0 2px 2px 0;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.f3d-panel-toggle:hover {
  background: rgba(20, 20, 40, 0.95);
  color: var(--text-primary);
}

.f3d-panel-toggle__count {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

/* ── Main panel ──────────────────────────────────────────────── */
.f3d-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, #0d0d1a 96%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 1px solid rgba(100, 130, 255, 0.15);
  border-top: none;
  border-bottom: none;
  border-left: none;
  border-radius: 0;
  overflow: hidden;
}

/* Header */
.f3d-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.75rem 0.75rem 0.875rem;
  border-bottom: 1px solid rgba(100, 130, 255, 0.12);
  flex-shrink: 0;
}

.f3d-panel__header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.f3d-panel__header-icon {
  color: #6482ff;
}

.f3d-panel__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.f3d-panel__count {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-muted);
  background: rgba(100, 130, 255, 0.08);
  border: 1px solid rgba(100, 130, 255, 0.2);
  border-radius: 2px;
  padding: 1px 5px;
  letter-spacing: var(--tracking-wide);
}

.f3d-panel__collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid rgba(100, 130, 255, 0.2);
  border-radius: 2px;
  color: var(--text-muted);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.f3d-panel__collapse-btn:hover {
  background: rgba(100, 130, 255, 0.1);
  color: var(--text-primary);
}

/* Filter chips */
.f3d-panel__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid rgba(100, 130, 255, 0.1);
  flex-shrink: 0;
}

.f3d-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wider);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 120ms ease;
}

.f3d-filter-chip:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-secondary);
}

.f3d-filter-chip--active {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}

.f3d-filter-chip__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.f3d-filter-chip__count {
  color: var(--text-muted);
  font-size: var(--font-size-2xs);
}

/* Search */
.f3d-panel__search {
  position: relative;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(100, 130, 255, 0.1);
  flex-shrink: 0;
}

.f3d-panel__search-icon {
  position: absolute;
  left: 1.125rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.f3d-panel__search-input {
  width: 100%;
  padding: 0.375rem 0.5rem 0.375rem 1.75rem;
  background: rgba(100, 130, 255, 0.05);
  border: 1px solid rgba(100, 130, 255, 0.15);
  border-radius: 2px;
  font-size: var(--font-size-md);
  color: var(--text-primary);
  outline: none;
  transition: border-color 120ms ease;
}

.f3d-panel__search-input::placeholder {
  color: var(--text-muted);
}

.f3d-panel__search-input:focus {
  border-color: rgba(100, 130, 255, 0.4);
}

/* Driver list */
.f3d-panel__list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.f3d-panel__empty {
  padding: 2rem 1rem;
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* ── Transitions ─────────────────────────────────────────────── */
.f3d-panel-enter-active,
.f3d-panel-leave-active {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.f3d-panel-enter-from,
.f3d-panel-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.f3d-panel-toggle-enter-active,
.f3d-panel-toggle-leave-active {
  transition: opacity 150ms ease;
}

.f3d-panel-toggle-enter-from,
.f3d-panel-toggle-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .f3d-panel-enter-active,
  .f3d-panel-leave-active,
  .f3d-panel-toggle-enter-active,
  .f3d-panel-toggle-leave-active {
    transition: none;
  }
}

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .f3d-panel {
    width: 100%;
    max-width: 320px;
  }
}
</style>
