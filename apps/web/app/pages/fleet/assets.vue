<script setup lang="ts">
import { Search, X, MoreVertical, Eye, Link, Wrench } from 'lucide-vue-next'
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
import type {
  FleetAsset,
  FleetAssetAvailability,
  FleetAssetSource,
  FleetAssetType,
} from '@motive/shared'
import { useAssetsTable } from '~/composables/useAssetsTable'

definePageMeta({
  title: 'Assets',
  moduleName: 'Fleet',
})

const {
  assets,
  loading,
  sortKey,
  sortDir,
  searchQuery,
  availabilityFilter,
  typeFilter,
  hasActiveFilters,
  handleSort,
  clearFilters,
} = useAssetsTable()

// ── Filter options ──────────────────────────────────────
const AVAILABILITY_OPTIONS: MSelectOption<FleetAssetAvailability>[] = [
  { label: 'In Use', value: 'in-use' },
  { label: 'Available', value: 'available' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Decommissioned', value: 'decommissioned' },
]

const TYPE_OPTIONS: MSelectOption<FleetAssetType>[] = [
  { label: 'Trailer', value: 'trailer' },
  { label: 'Container', value: 'container' },
  { label: 'Generator', value: 'generator' },
]

// ── Columns ─────────────────────────────────────────────
const columns: MTableColumn[] = [
  { key: 'name', label: 'Asset ID', sortable: true, width: '120px' },
  { key: 'type', label: 'Type', sortable: true, width: '100px' },
  { key: 'driverName', label: 'Driver', sortable: true, minWidth: '140px' },
  { key: 'vehicleUnitNumber', label: 'Vehicle', sortable: true, width: '110px' },
  { key: 'location', label: 'Location', sortable: true, minWidth: '140px' },
  { key: 'source', label: 'Source', sortable: true, align: 'center', width: '90px' },
  { key: 'availability', label: 'Availability', sortable: true, width: '140px' },
  { key: 'cameras', label: 'Camera', sortable: true, align: 'center', width: '80px' },
  { key: 'actions', label: '', width: '50px' },
]

// ── Availability badge mapping ──────────────────────────
const AVAILABILITY_BADGE: Record<
  FleetAssetAvailability,
  { color: 'success' | 'info' | 'warning' | 'default'; label: string }
> = {
  'in-use': { color: 'info', label: 'In Use' },
  available: { color: 'success', label: 'Available' },
  maintenance: { color: 'warning', label: 'Maintenance' },
  decommissioned: { color: 'default', label: 'Decommissioned' },
}

// ── Source badge mapping ────────────────────────────────
const SOURCE_BADGE: Record<
  FleetAssetSource,
  { color: 'default' | 'info' | 'success' | 'warning'; label: string }
> = {
  GPS: { color: 'info', label: 'GPS' },
  ELD: { color: 'success', label: 'ELD' },
  Manual: { color: 'default', label: 'Manual' },
  BLE: { color: 'warning', label: 'BLE' },
}

// ── Type display ────────────────────────────────────────
function formatType(asset: FleetAsset): string {
  const typeLabel = asset.type.charAt(0).toUpperCase() + asset.type.slice(1)
  const subtypeLabel = asset.subtype.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return `${typeLabel} · ${subtypeLabel}`
}

// ── Actions dropdown ────────────────────────────────────
const openMenuIndex = ref<string | null>(null)
const menuAnchor = ref<HTMLElement | null>(null)

const actionItems: MDropdownItem[] = [
  { label: 'View Details', icon: Eye },
  { label: 'Link to Vehicle', icon: Link },
  { divider: true, label: '' },
  { label: 'Schedule Maintenance', icon: Wrench },
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
            placeholder="Search asset, driver…"
            aria-label="Search assets"
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
          :model-value="availabilityFilter"
          :options="AVAILABILITY_OPTIONS"
          label="Availability"
          :clearable="true"
          aria-label="Filter by availability"
          @update:model-value="availabilityFilter = $event as FleetAssetAvailability | null"
        />

        <MSelect
          :model-value="typeFilter"
          :options="TYPE_OPTIONS"
          label="Type"
          :clearable="true"
          aria-label="Filter by type"
          @update:model-value="typeFilter = $event as FleetAssetType | null"
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
        :rows="assets"
        :sort-key="sortKey"
        :sort-dir="sortDir"
        row-key="id"
        :loading="loading"
        infinite
        @sort="handleSort"
      >
        <!-- Asset Name -->
        <template #cell-name="{ row }">
          <span class="cell-mono">{{ (row as FleetAsset).name }}</span>
        </template>

        <!-- Type -->
        <template #cell-type="{ row }">
          <span class="cell-primary">{{ formatType(row as FleetAsset) }}</span>
        </template>

        <!-- Driver -->
        <template #cell-driverName="{ row }">
          <span v-if="(row as FleetAsset).driverName" class="cell-primary">
            {{ (row as FleetAsset).driverName }}
          </span>
          <span v-else class="cell-muted">—</span>
        </template>

        <!-- Vehicle -->
        <template #cell-vehicleUnitNumber="{ row }">
          <span v-if="(row as FleetAsset).vehicleUnitNumber" class="cell-mono">
            {{ (row as FleetAsset).vehicleUnitNumber }}
          </span>
          <span v-else class="cell-muted">—</span>
        </template>

        <!-- Location -->
        <template #cell-location="{ row }">
          <span class="cell-primary">{{ (row as FleetAsset).currentLocation.city }}</span>
          <span class="cell-sub">{{ (row as FleetAsset).currentLocation.state }}</span>
        </template>

        <!-- Source -->
        <template #cell-source="{ row }">
          <MBadge
            :label="SOURCE_BADGE[(row as FleetAsset).source].label"
            :color="SOURCE_BADGE[(row as FleetAsset).source].color"
            size="sm"
          />
        </template>

        <!-- Availability -->
        <template #cell-availability="{ row }">
          <MBadge
            :label="AVAILABILITY_BADGE[(row as FleetAsset).availability].label"
            :color="AVAILABILITY_BADGE[(row as FleetAsset).availability].color"
            size="sm"
          />
        </template>

        <!-- Cameras -->
        <template #cell-cameras="{ row }">
          <span class="cell-mono">{{ (row as FleetAsset).cameras }}</span>
        </template>

        <!-- Actions -->
        <template #cell-actions="{ row }">
          <button
            class="action-btn"
            type="button"
            aria-label="Asset actions"
            @click.stop="openMenu((row as FleetAsset).id, $event.currentTarget as HTMLElement)"
          >
            <MIcon :icon="MoreVertical" :size="16" />
          </button>
        </template>

        <template #empty>
          <div class="fleet-table-empty">
            <span class="fleet-table-empty__title">No assets match your filters.</span>
            <span class="fleet-table-empty__sub">Try adjusting the filters or search term.</span>
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
