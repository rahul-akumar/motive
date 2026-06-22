<script setup lang="ts">
import { Search, X, MoreVertical, Truck, UserCheck, Wrench } from 'lucide-vue-next'
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
import { NuxtLinkLocale } from '#components'
import type { FleetVehicle, FleetVehicleStatus } from '@motive/shared'
import { useVehiclesTable } from '~/composables/useVehiclesTable'

definePageMeta({
  title: 'Vehicles',
  moduleName: 'Fleet',
})

const { t } = useI18n()

const {
  vehicles,
  loading,
  status,
  refresh,
  sortKey,
  sortDir,
  searchQuery,
  statusFilter,
  hasActiveFilters,
  handleSort,
  clearFilters,
} = useVehiclesTable()

// ── Filter options ──────────────────────────────────────
const STATUS_OPTIONS = computed<MSelectOption<FleetVehicleStatus>[]>(() => [
  { label: t('fleet.vehicles.status.active'), value: 'active' },
  { label: t('fleet.vehicles.status.idle'), value: 'idle' },
  { label: t('fleet.vehicles.status.outOfService'), value: 'out-of-service' },
  { label: t('fleet.vehicles.status.maintenance'), value: 'maintenance' },
])

const { formatDate, formatTime } = useFormatters()

// ── Columns ─────────────────────────────────────────
const columns = computed<MTableColumn[]>(() => [
  {
    key: 'unitNumber',
    label: t('fleet.vehicles.columns.vehicleIdMmy'),
    sortable: true,
    minWidth: '180px',
  },
  {
    key: 'driverName',
    label: t('fleet.vehicles.columns.driverNameId'),
    sortable: true,
    minWidth: '160px',
  },
  {
    key: 'assetName',
    label: t('fleet.vehicles.columns.assetId'),
    sortable: true,
    minWidth: '120px',
  },
  {
    key: 'location',
    label: t('fleet.vehicles.columns.location'),
    sortable: true,
    minWidth: '200px',
  },
  {
    key: 'status',
    label: t('fleet.vehicles.columns.availability'),
    sortable: true,
    width: '140px',
  },
  {
    key: 'defects',
    label: t('fleet.vehicles.columns.defectsFaults'),
    sortable: true,
    align: 'center',
    width: '110px',
  },
  {
    key: 'cameras',
    label: t('fleet.vehicles.columns.cameras'),
    sortable: true,
    align: 'center',
    width: '90px',
  },
  { key: 'actions', label: '', width: '50px' },
])

// ── Status badge mapping ────────────────────────────────
const STATUS_BADGE = computed<
  Record<FleetVehicleStatus, { color: 'success' | 'warning' | 'danger' | 'default'; label: string }>
>(() => ({
  active: { color: 'success', label: t('fleet.vehicles.status.active') },
  idle: { color: 'warning', label: t('fleet.vehicles.status.idle') },
  'out-of-service': { color: 'danger', label: t('fleet.vehicles.status.outOfService') },
  maintenance: { color: 'default', label: t('fleet.vehicles.status.maintenance') },
}))

// ── Actions dropdown ────────────────────────────────────
const openMenuIndex = ref<string | null>(null)
const menuAnchor = ref<HTMLElement | null>(null)

function getActionItems(vehicleId: string): MDropdownItem[] {
  return [
    {
      label: t('fleet.vehicles.actions.viewDetails'),
      icon: Truck,
      action: () => navigateTo(`/fleet/vehicles/${vehicleId}/live`),
    },
    { label: t('fleet.vehicles.actions.assignDriver'), icon: UserCheck },
    { divider: true, label: '' },
    { label: t('fleet.vehicles.actions.serviceHistory'), icon: Wrench },
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
        <MInput
          :model-value="searchQuery"
          type="search"
          size="sm"
          :leading-icon="Search"
          :clearable="true"
          :placeholder="t('fleet.vehicles.search.placeholder')"
          :aria-label="t('fleet.vehicles.search.aria')"
          class="fleet-filter-bar__search"
          @update:model-value="(v) => (searchQuery = v)"
        />

        <MSelect
          :model-value="statusFilter"
          :options="STATUS_OPTIONS"
          :label="t('fleet.filters.status')"
          :clearable="true"
          :aria-label="t('fleet.filters.filterByStatus')"
          @update:model-value="statusFilter = $event as FleetVehicleStatus | null"
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
        error-title="Couldn’t load vehicles"
        error-description="There was a problem loading your fleet. Please try again."
        @retry="refresh"
      >
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
            <MTableCell
              variant="link"
              :tag="NuxtLinkLocale"
              :to="`/fleet/vehicles/${(row as FleetVehicle).id}/live`"
            >
              {{ (row as FleetVehicle).unitNumber }}
            </MTableCell>
            <MTableCell variant="secondary"
              >{{ (row as FleetVehicle).make }} · {{ (row as FleetVehicle).model }} ·
              {{ (row as FleetVehicle).year }}</MTableCell
            >
          </template>

          <!-- Driver Name / ID -->
          <template #cell-driverName="{ row }">
            <template v-if="(row as FleetVehicle).driverName">
              <MTableCell variant="link">{{ (row as FleetVehicle).driverName }}</MTableCell>
              <MTableCell variant="secondary">{{ (row as FleetVehicle).driverId }}</MTableCell>
            </template>
            <MTableCell v-else variant="muted">—</MTableCell>
          </template>

          <!-- Asset ID -->
          <template #cell-assetName="{ row }">
            <MTableCell v-if="(row as FleetVehicle).assetName" variant="link">
              {{ (row as FleetVehicle).assetName }}
            </MTableCell>
            <MTableCell v-else variant="muted">—</MTableCell>
          </template>

          <!-- Location / Updated -->
          <template #cell-location="{ row }">
            <MTableCell
              >{{ (row as FleetVehicle).currentLocation.city }},
              {{ (row as FleetVehicle).currentLocation.state }}</MTableCell
            >
            <MTableCell variant="secondary"
              >{{ formatDate(new Date()) }} · {{ formatTime(new Date()) }}</MTableCell
            >
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
            <MTableCell
              variant="mono"
              :class="{ 'cell-danger': (row as FleetVehicle).defects > 0 }"
            >
              {{ (row as FleetVehicle).defects }}
            </MTableCell>
          </template>

          <!-- Cameras -->
          <template #cell-cameras="{ row }">
            <MTableCell variant="mono">{{ (row as FleetVehicle).cameras }}</MTableCell>
          </template>

          <!-- Actions -->
          <template #cell-actions="{ row }">
            <button
              class="action-btn"
              type="button"
              :aria-label="t('fleet.vehicles.actions.menuAria')"
              @click.stop="openMenu((row as FleetVehicle).id, $event.currentTarget as HTMLElement)"
            >
              <MIcon :icon="MoreVertical" :size="16" />
            </button>
          </template>

          <template #empty>
            <div class="fleet-table-empty">
              <span class="fleet-table-empty__title">{{ t('fleet.vehicles.empty.title') }}</span>
              <span class="fleet-table-empty__sub">{{ t('fleet.vehicles.empty.sub') }}</span>
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

/* ── Cell styles ─────────────────────────────────────────── */
/* Layered onto MTableCell's mono variant when defects > 0 */
.cell-danger {
  color: var(--mtv-color-status-critical);
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
