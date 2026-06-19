<script setup lang="ts">
import { Search, X, MoreVertical, User, Truck, FileText } from 'lucide-vue-next'
import {
  MTable,
  MTableCell,
  MBadge,
  MButton,
  MSelect,
  MDropdown,
  MIcon,
  type MTableColumn,
  type MDropdownItem,
  type MSelectOption,
} from '@motive/ui'
import type { FleetDriver, FleetDriverStatus } from '@motive/shared'
import { useDriversTable } from '~/composables/useDriversTable'

definePageMeta({
  title: 'Drivers',
  moduleName: 'Fleet',
})

const {
  drivers,
  loading,
  sortKey,
  sortDir,
  searchQuery,
  statusFilter,
  hasActiveFilters,
  handleSort,
  clearFilters,
} = useDriversTable()

// ── Filter options ──────────────────────────────────────
const STATUS_OPTIONS: MSelectOption<FleetDriverStatus>[] = [
  { label: 'Driving', value: 'driving' },
  { label: 'Idle', value: 'idle' },
  { label: 'Alert', value: 'alert' },
  { label: 'Offline', value: 'offline' },
  { label: 'Sleeper', value: 'sleeper' },
]

// ── Columns ─────────────────────────────────────────────
const columns: MTableColumn[] = [
  { key: 'name', label: 'Driver Name', sortable: true, minWidth: '160px' },
  { key: 'vehicleUnitNumber', label: 'Vehicle', sortable: true, width: '110px' },
  { key: 'assetName', label: 'Asset', sortable: true, width: '110px' },
  { key: 'location', label: 'Location', sortable: true, minWidth: '140px' },
  { key: 'hos.breakRemaining', label: 'Break', sortable: true, align: 'center', width: '80px' },
  { key: 'hos.driveRemaining', label: 'Drive', sortable: true, align: 'center', width: '80px' },
  { key: 'hos.shiftRemaining', label: 'Shift', sortable: true, align: 'center', width: '80px' },
  { key: 'hos.cycleRemaining', label: 'Cycle', sortable: true, align: 'center', width: '80px' },
  { key: 'hos.hoursToday', label: 'Hrs Today', sortable: true, align: 'center', width: '90px' },
  { key: 'hos.hoursThisWeek', label: 'Hrs/Week', sortable: true, align: 'center', width: '90px' },
  { key: 'actions', label: '', width: '50px' },
]

// ── Status badge mapping ────────────────────────────────
const STATUS_BADGE: Record<
  FleetDriverStatus,
  { color: 'success' | 'warning' | 'danger' | 'default' | 'info'; label: string }
> = {
  driving: { color: 'success', label: 'Driving' },
  idle: { color: 'warning', label: 'Idle' },
  alert: { color: 'danger', label: 'Alert' },
  offline: { color: 'default', label: 'Offline' },
  sleeper: { color: 'info', label: 'Sleeper' },
}

// ── HOS color helpers ───────────────────────────────────
function hosColor(hours: number): string {
  if (hours <= 1) return 'var(--mtv-color-status-danger)'
  if (hours <= 4) return 'var(--mtv-color-status-warning)'
  return 'var(--mtv-color-status-success)'
}

// ── Actions dropdown ────────────────────────────────────
const openMenuIndex = ref<string | null>(null)
const menuAnchor = ref<HTMLElement | null>(null)

const actionItems: MDropdownItem[] = [
  { label: 'View Profile', icon: User },
  { label: 'Assign Vehicle', icon: Truck },
  { divider: true, label: '' },
  { label: 'HOS Logs', icon: FileText },
]

function openMenu(id: string, el: HTMLElement) {
  if (openMenuIndex.value === id) {
    openMenuIndex.value = null
    menuAnchor.value = null
  } else {
    openMenuIndex.value = id
    menuAnchor.value = el
  }
}
</script>

<template>
  <div class="fleet-table-page">
    <!-- Filter bar -->
    <div class="fleet-filter-bar">
      <div class="fleet-filter-bar__left">
        <div class="fleet-filter-bar__search">
          <MIcon :icon="Search" :size="14" class="fleet-filter-bar__search-icon" />
          <input
            :value="searchQuery"
            type="text"
            class="fleet-filter-bar__input"
            placeholder="Search driver, vehicle…"
            aria-label="Search drivers"
            @input="searchQuery = ($event.target as HTMLInputElement).value"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="fleet-filter-bar__clear-input"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <MIcon :icon="X" :size="12" :stroke-width="2.5" />
          </button>
        </div>

        <MSelect
          :model-value="statusFilter"
          :options="STATUS_OPTIONS"
          label="Status"
          :clearable="true"
          aria-label="Filter by status"
          @update:model-value="statusFilter = $event as FleetDriverStatus | null"
        />

        <MButton v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearFilters">
          <MIcon :icon="X" :size="13" :stroke-width="2" />
          Clear
        </MButton>
      </div>
    </div>

    <!-- Table -->
    <div class="fleet-table-page__content">
      <MTable
        :columns="columns"
        :rows="drivers"
        :sort-key="sortKey"
        :sort-dir="sortDir"
        row-key="id"
        :loading="loading"
        infinite
        @sort="handleSort"
      >
        <!-- Driver Name + Status -->
        <template #cell-name="{ row }">
          <div class="cell-name-group">
            <MTableCell>{{ (row as FleetDriver).name }}</MTableCell>
            <MBadge
              :label="STATUS_BADGE[(row as FleetDriver).status].label"
              :color="STATUS_BADGE[(row as FleetDriver).status].color"
              size="sm"
            />
          </div>
        </template>

        <!-- Vehicle -->
        <template #cell-vehicleUnitNumber="{ row }">
          <MTableCell v-if="(row as FleetDriver).vehicleUnitNumber" variant="mono">
            {{ (row as FleetDriver).vehicleUnitNumber }}
          </MTableCell>
          <MTableCell v-else variant="muted">—</MTableCell>
        </template>

        <!-- Asset -->
        <template #cell-assetName="{ row }">
          <MTableCell v-if="(row as FleetDriver).assetName" variant="mono">
            {{ (row as FleetDriver).assetName }}
          </MTableCell>
          <MTableCell v-else variant="muted">—</MTableCell>
        </template>

        <!-- Location -->
        <template #cell-location="{ row }">
          <MTableCell>{{ (row as FleetDriver).currentLocation.city }}</MTableCell>
          <MTableCell variant="secondary">{{
            (row as FleetDriver).currentLocation.state
          }}</MTableCell>
        </template>

        <!-- Break -->
        <template #[`cell-hos.breakRemaining`]="{ row }">
          <MTableCell
            variant="mono"
            class="cell-hos"
            :style="{ color: hosColor((row as FleetDriver).hos.breakRemaining) }"
          >
            {{ (row as FleetDriver).hos.breakRemaining.toFixed(1) }}h
          </MTableCell>
        </template>

        <!-- Drive -->
        <template #[`cell-hos.driveRemaining`]="{ row }">
          <MTableCell
            variant="mono"
            class="cell-hos"
            :style="{ color: hosColor((row as FleetDriver).hos.driveRemaining) }"
          >
            {{ (row as FleetDriver).hos.driveRemaining.toFixed(1) }}h
          </MTableCell>
        </template>

        <!-- Shift -->
        <template #[`cell-hos.shiftRemaining`]="{ row }">
          <MTableCell
            variant="mono"
            class="cell-hos"
            :style="{ color: hosColor((row as FleetDriver).hos.shiftRemaining) }"
          >
            {{ (row as FleetDriver).hos.shiftRemaining.toFixed(1) }}h
          </MTableCell>
        </template>

        <!-- Cycle -->
        <template #[`cell-hos.cycleRemaining`]="{ row }">
          <MTableCell
            variant="mono"
            class="cell-hos"
            :style="{ color: hosColor((row as FleetDriver).hos.cycleRemaining) }"
          >
            {{ (row as FleetDriver).hos.cycleRemaining.toFixed(1) }}h
          </MTableCell>
        </template>

        <!-- Hrs Today -->
        <template #[`cell-hos.hoursToday`]="{ row }">
          <MTableCell variant="mono"
            >{{ (row as FleetDriver).hos.hoursToday.toFixed(1) }}h</MTableCell
          >
        </template>

        <!-- Hrs This Week -->
        <template #[`cell-hos.hoursThisWeek`]="{ row }">
          <MTableCell variant="mono"
            >{{ (row as FleetDriver).hos.hoursThisWeek.toFixed(1) }}h</MTableCell
          >
        </template>

        <!-- Actions -->
        <template #cell-actions="{ row }">
          <button
            class="action-btn"
            type="button"
            aria-label="Driver actions"
            @click.stop="openMenu((row as FleetDriver).id, $event.currentTarget as HTMLElement)"
          >
            <MIcon :icon="MoreVertical" :size="16" />
          </button>
        </template>

        <template #empty>
          <div class="fleet-table-empty">
            <span class="fleet-table-empty__title">No drivers match your filters.</span>
            <span class="fleet-table-empty__sub"
              >Try adjusting the status filter or search term.</span
            >
          </div>
        </template>
      </MTable>
    </div>

    <!-- Actions dropdown -->
    <MDropdown
      :items="actionItems"
      :open="openMenuIndex !== null"
      :anchor-el="menuAnchor"
      placement="right"
      @update:open="
        (v) => {
          if (!v) openMenuIndex = null
        }
      "
    />
  </div>
</template>

<style scoped>
.fleet-table-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.fleet-table-page__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* ── Filter bar ──────────────────────────────────────────── */
.fleet-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
  padding: 0.875rem 0;
  flex-wrap: wrap;
}

.fleet-filter-bar__left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.fleet-filter-bar__search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.fleet-filter-bar__search-icon {
  position: absolute;
  left: 0.625rem;
  color: var(--mtv-color-foreground-subtle);
  pointer-events: none;
}

.fleet-filter-bar__input {
  width: 100%;
  height: 32px;
  padding: 0 2rem 0 2rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--radius);
  outline: none;
  transition: border-color var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.fleet-filter-bar__input::placeholder {
  color: var(--mtv-color-foreground-subtle);
}

.fleet-filter-bar__input:focus {
  border-color: var(--mtv-color-brand-default);
}

.fleet-filter-bar__clear-input {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--mtv-color-foreground-subtle);
  border-radius: var(--radius-sm);
  padding: 0;
  transition: all var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.fleet-filter-bar__clear-input:hover {
  color: var(--mtv-color-foreground-default);
  background-color: var(--mtv-color-surface-hover);
}

/* ── Cell styles ─────────────────────────────────────────── */
.cell-name-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Layered onto MTableCell's mono variant — adds weight, color comes inline */
.cell-hos {
  font-weight: 600;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  transition: background-color var(--mtv-duration-fast);
}

.action-btn:hover {
  background: var(--mtv-color-surface-hover);
  color: var(--mtv-color-foreground-default);
}

/* ── Empty state ─────────────────────────────────────────── */
.fleet-table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.fleet-table-empty__title {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}

.fleet-table-empty__sub {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}
</style>
