<script setup lang="ts">
import { Search, X, MoreVertical, Truck, UserCheck, Wrench } from 'lucide-vue-next'
import {
  MTable,
  MBadge,
  MButton,
  MSelect,
  MDropdown,
  MIcon,
  type MTableColumn,
  type MDropdownItem,
  type MSelectOption,
} from '@motive/ui'
import type { FleetVehicle, FleetVehicleStatus } from '@motive/shared'
import { useVehiclesTable } from '~/composables/useVehiclesTable'

definePageMeta({
  title: 'Vehicles',
  moduleName: 'Fleet',
  mainVariant: 'default',
})

const {
  vehicles,
  loading,
  sortKey,
  sortDir,
  searchQuery,
  statusFilter,
  hasActiveFilters,
  handleSort,
  clearFilters,
} = useVehiclesTable()

// ── Filter options ──────────────────────────────────────
const STATUS_OPTIONS: MSelectOption<FleetVehicleStatus>[] = [
  { label: 'Active', value: 'active' },
  { label: 'Idle', value: 'idle' },
  { label: 'Out of Service', value: 'out-of-service' },
  { label: 'Maintenance', value: 'maintenance' },
]

const { formatDate, formatTime } = useFormatters()

// ── Columns ─────────────────────────────────────────
const columns: MTableColumn[] = [
  { key: 'unitNumber', label: 'Vehicle ID / MMY', sortable: true, minWidth: '180px' },
  { key: 'driverName', label: 'Driver Name / ID', sortable: true, minWidth: '160px' },
  { key: 'assetName', label: 'Asset ID', sortable: true, minWidth: '120px' },
  { key: 'location', label: 'Location', sortable: true, minWidth: '200px' },
  { key: 'status', label: 'Availability', sortable: true, width: '140px' },
  { key: 'defects', label: 'Defects / Faults', sortable: true, align: 'center', width: '110px' },
  { key: 'cameras', label: 'Cameras', sortable: true, align: 'center', width: '90px' },
  { key: 'actions', label: '', width: '50px' },
]

// ── Status badge mapping ────────────────────────────────
const STATUS_BADGE: Record<
  FleetVehicleStatus,
  { color: 'success' | 'warning' | 'danger' | 'default'; label: string }
> = {
  active: { color: 'success', label: 'Active' },
  idle: { color: 'warning', label: 'Idle' },
  'out-of-service': { color: 'danger', label: 'Out of Service' },
  maintenance: { color: 'default', label: 'Maintenance' },
}

// ── Actions dropdown ────────────────────────────────────
const openMenuIndex = ref<string | null>(null)
const menuAnchor = ref<HTMLElement | null>(null)

function getActionItems(vehicleId: string): MDropdownItem[] {
  return [
    {
      label: 'View Details',
      icon: Truck,
      action: () => navigateTo(`/fleet/vehicles/${vehicleId}/live`),
    },
    { label: 'Assign Driver', icon: UserCheck },
    { divider: true, label: '' },
    { label: 'Service History', icon: Wrench },
  ]
}

const actionItems = computed(() => (openMenuIndex.value ? getActionItems(openMenuIndex.value) : []))

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
          <Search :size="14" class="fleet-filter-bar__search-icon" aria-hidden="true" />
          <input
            :value="searchQuery"
            type="text"
            class="fleet-filter-bar__input"
            placeholder="Search vehicle, driver…"
            aria-label="Search vehicles"
            @input="searchQuery = ($event.target as HTMLInputElement).value"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="fleet-filter-bar__clear-input"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <X :size="12" :stroke-width="2.5" />
          </button>
        </div>

        <MSelect
          :model-value="statusFilter"
          :options="STATUS_OPTIONS"
          label="Status"
          :clearable="true"
          aria-label="Filter by status"
          @update:model-value="statusFilter = $event as FleetVehicleStatus | null"
        />

        <MButton v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearFilters">
          <X :size="13" :stroke-width="2" />
          Clear
        </MButton>
      </div>
    </div>

    <!-- Table -->
    <div class="fleet-table-page__content">
      <MTable
        :columns="columns"
        :rows="vehicles"
        :sort-key="sortKey"
        :sort-dir="sortDir"
        row-key="id"
        :loading="loading"
        infinite
        @sort="handleSort"
      >
        <!-- Vehicle ID / MMY -->
        <template #cell-unitNumber="{ row }">
          <NuxtLinkLocale
            :to="`/fleet/vehicles/${(row as FleetVehicle).id}/live`"
            class="cell-link"
          >
            {{ (row as FleetVehicle).unitNumber }}
          </NuxtLinkLocale>
          <span class="cell-sub"
            >{{ (row as FleetVehicle).make }} · {{ (row as FleetVehicle).model }} ·
            {{ (row as FleetVehicle).year }}</span
          >
        </template>

        <!-- Driver Name / ID -->
        <template #cell-driverName="{ row }">
          <template v-if="(row as FleetVehicle).driverName">
            <span class="cell-link">{{ (row as FleetVehicle).driverName }}</span>
            <span class="cell-sub">{{ (row as FleetVehicle).driverId }}</span>
          </template>
          <span v-else class="cell-muted">—</span>
        </template>

        <!-- Asset ID -->
        <template #cell-assetName="{ row }">
          <span v-if="(row as FleetVehicle).assetName" class="cell-link">
            {{ (row as FleetVehicle).assetName }}
          </span>
          <span v-else class="cell-muted">—</span>
        </template>

        <!-- Location / Updated -->
        <template #cell-location="{ row }">
          <span class="cell-primary"
            >{{ (row as FleetVehicle).currentLocation.city }},
            {{ (row as FleetVehicle).currentLocation.state }}</span
          >
          <span class="cell-sub">{{ formatDate(new Date()) }} · {{ formatTime(new Date()) }}</span>
        </template>

        <!-- Availability -->
        <template #cell-status="{ row }">
          <MBadge
            :label="STATUS_BADGE[(row as FleetVehicle).status].label"
            :color="STATUS_BADGE[(row as FleetVehicle).status].color"
            size="sm"
          />
        </template>

        <!-- Defects / Faults -->
        <template #cell-defects="{ row }">
          <span :class="['cell-mono', { 'cell-danger': (row as FleetVehicle).defects > 0 }]">
            {{ (row as FleetVehicle).defects }}
          </span>
        </template>

        <!-- Cameras -->
        <template #cell-cameras="{ row }">
          <span class="cell-mono">{{ (row as FleetVehicle).cameras }}</span>
        </template>

        <!-- Actions -->
        <template #cell-actions="{ row }">
          <button
            class="action-btn"
            type="button"
            aria-label="Vehicle actions"
            @click.stop="openMenu((row as FleetVehicle).id, $event.currentTarget as HTMLElement)"
          >
            <MIcon :icon="MoreVertical" :size="16" />
          </button>
        </template>

        <template #empty>
          <div class="fleet-table-empty">
            <span class="fleet-table-empty__title">No vehicles match your filters.</span>
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
  padding: 0 1.5rem 1.5rem;
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
  border-radius: 5px;
  outline: none;
  transition: border-color 150ms ease;
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
  border-radius: 3px;
  padding: 0;
  transition: all 100ms ease;
}

.fleet-filter-bar__clear-input:hover {
  color: var(--mtv-color-foreground-default);
  background-color: var(--mtv-color-surface-hover);
}

/* ── Cell styles ─────────────────────────────────────────── */
.cell-link {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-brand-default);
  cursor: pointer;
}

.cell-link:hover {
  text-decoration: underline;
}

.cell-mono {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
}

.cell-primary {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}

.cell-sub {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.cell-muted {
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
}

.cell-danger {
  color: var(--mtv-color-status-danger);
  font-weight: 600;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  transition: background-color 0.15s;
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
