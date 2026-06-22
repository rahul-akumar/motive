<script setup lang="ts">
import { Search, X, MoreVertical, Eye, Link, Wrench } from 'lucide-vue-next'
import {
  MTable,
  MTableCell,
  MBadge,
  MButton,
  MSelect,
  MInput,
  MDropdown,
  MIcon,
  AsyncBoundary,
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

const { t } = useI18n()

const {
  assets,
  loading,
  status,
  refresh,
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
const AVAILABILITY_OPTIONS = computed<MSelectOption<FleetAssetAvailability>[]>(() => [
  { label: t('fleet.assets.availability.inUse'), value: 'in-use' },
  { label: t('fleet.assets.availability.available'), value: 'available' },
  { label: t('fleet.assets.availability.maintenance'), value: 'maintenance' },
  { label: t('fleet.assets.availability.decommissioned'), value: 'decommissioned' },
])

const TYPE_OPTIONS = computed<MSelectOption<FleetAssetType>[]>(() => [
  { label: t('fleet.assets.type.trailer'), value: 'trailer' },
  { label: t('fleet.assets.type.container'), value: 'container' },
  { label: t('fleet.assets.type.generator'), value: 'generator' },
])

// ── Columns ─────────────────────────────────────────────
const columns = computed<MTableColumn[]>(() => [
  { key: 'name', label: t('fleet.assets.columns.assetId'), sortable: true, width: '120px' },
  { key: 'type', label: t('fleet.assets.columns.type'), sortable: true, width: '100px' },
  { key: 'driverName', label: t('fleet.assets.columns.driver'), sortable: true, minWidth: '140px' },
  {
    key: 'vehicleUnitNumber',
    label: t('fleet.assets.columns.vehicle'),
    sortable: true,
    width: '110px',
  },
  { key: 'location', label: t('fleet.assets.columns.location'), sortable: true, minWidth: '140px' },
  {
    key: 'source',
    label: t('fleet.assets.columns.source'),
    sortable: true,
    align: 'center',
    width: '90px',
  },
  {
    key: 'availability',
    label: t('fleet.assets.columns.availability'),
    sortable: true,
    width: '140px',
  },
  {
    key: 'cameras',
    label: t('fleet.assets.columns.camera'),
    sortable: true,
    align: 'center',
    width: '80px',
  },
  { key: 'actions', label: '', width: '50px' },
])

// ── Availability badge mapping ──────────────────────────
const AVAILABILITY_BADGE = computed<
  Record<
    FleetAssetAvailability,
    { color: 'success' | 'info' | 'warning' | 'default'; label: string }
  >
>(() => ({
  'in-use': { color: 'info', label: t('fleet.assets.availability.inUse') },
  available: { color: 'success', label: t('fleet.assets.availability.available') },
  maintenance: { color: 'warning', label: t('fleet.assets.availability.maintenance') },
  decommissioned: { color: 'default', label: t('fleet.assets.availability.decommissioned') },
}))

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

const actionItems = computed<MDropdownItem[]>(() => [
  { label: t('fleet.assets.actions.viewDetails'), icon: Eye },
  { label: t('fleet.assets.actions.linkToVehicle'), icon: Link },
  { divider: true, label: '' },
  { label: t('fleet.assets.actions.scheduleMaintenance'), icon: Wrench },
])

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
        <MInput
          :model-value="searchQuery"
          type="search"
          size="sm"
          :leading-icon="Search"
          :clearable="true"
          :placeholder="t('fleet.assets.search.placeholder')"
          :aria-label="t('fleet.assets.search.aria')"
          class="fleet-filter-bar__search"
          @update:model-value="(v) => (searchQuery = v)"
        />

        <MSelect
          :model-value="availabilityFilter"
          :options="AVAILABILITY_OPTIONS"
          :label="t('fleet.filters.availability')"
          :clearable="true"
          :aria-label="t('fleet.filters.filterByAvailability')"
          @update:model-value="availabilityFilter = $event as FleetAssetAvailability | null"
        />

        <MSelect
          :model-value="typeFilter"
          :options="TYPE_OPTIONS"
          :label="t('fleet.filters.type')"
          :clearable="true"
          :aria-label="t('fleet.filters.filterByType')"
          @update:model-value="typeFilter = $event as FleetAssetType | null"
        />

        <MButton v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearFilters">
          <MIcon :icon="X" :size="13" :stroke-width="2" />
          {{ t('fleet.filters.clear') }}
        </MButton>
      </div>
    </div>

    <!-- Table -->
    <div class="fleet-table-page__content">
      <AsyncBoundary
        :status="status === 'error' ? 'error' : 'success'"
        error-title="Couldn’t load assets"
        error-description="There was a problem loading your assets. Please try again."
        @retry="refresh"
      >
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
            <MTableCell variant="mono">{{ (row as FleetAsset).name }}</MTableCell>
          </template>

          <!-- Type -->
          <template #cell-type="{ row }">
            <MTableCell>{{ formatType(row as FleetAsset) }}</MTableCell>
          </template>

          <!-- Driver -->
          <template #cell-driverName="{ row }">
            <MTableCell v-if="(row as FleetAsset).driverName">
              {{ (row as FleetAsset).driverName }}
            </MTableCell>
            <MTableCell v-else variant="muted">—</MTableCell>
          </template>

          <!-- Vehicle -->
          <template #cell-vehicleUnitNumber="{ row }">
            <MTableCell v-if="(row as FleetAsset).vehicleUnitNumber" variant="mono">
              {{ (row as FleetAsset).vehicleUnitNumber }}
            </MTableCell>
            <MTableCell v-else variant="muted">—</MTableCell>
          </template>

          <!-- Location -->
          <template #cell-location="{ row }">
            <MTableCell>{{ (row as FleetAsset).currentLocation.city }}</MTableCell>
            <MTableCell variant="secondary">{{
              (row as FleetAsset).currentLocation.state
            }}</MTableCell>
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
            <MTableCell variant="mono">{{ (row as FleetAsset).cameras }}</MTableCell>
          </template>

          <!-- Actions -->
          <template #cell-actions="{ row }">
            <button
              class="action-btn"
              type="button"
              :aria-label="t('fleet.assets.actions.menuAria')"
              @click.stop="openMenu((row as FleetAsset).id, $event.currentTarget as HTMLElement)"
            >
              <MIcon :icon="MoreVertical" :size="16" />
            </button>
          </template>

          <template #empty>
            <div class="fleet-table-empty">
              <span class="fleet-table-empty__title">{{ t('fleet.assets.empty.title') }}</span>
              <span class="fleet-table-empty__sub">{{ t('fleet.assets.empty.sub') }}</span>
            </div>
          </template>
        </MTable>
      </AsyncBoundary>
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
  flex: 1;
  min-width: 200px;
  max-width: 320px;
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
