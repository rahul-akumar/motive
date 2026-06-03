<script setup lang="ts">
import { Search, X, MoreVertical } from 'lucide-vue-next'
import {
  MTable,
  MButton,
  MBadge,
  MSelect,
  MIcon,
  MDropdown,
  type MSelectOption,
  type MTableColumn,
  type MDropdownItem,
} from '@motive/ui'
import type { FuelEventType, FuelDropStatus } from '@motive/shared'
import type { FuelEventRow } from '~/composables/useFuelEventsData'

definePageMeta({
  title: 'Events',
  moduleName: 'Fuel',
})

const {
  filteredRows,
  filterSearch,
  filterEventType,
  filterStatus,
  filterVehicle,
  filterDriver,
  vehicleOptions,
  driverOptions,
  hasActiveFilters,
  clearFilters,
} = useFuelEventsData()

// ── Sort state ───────────────────────────────────────────────
type SortKey = 'type' | 'driverName' | 'vehicleId' | 'startTime' | 'status'
const sortKey = ref<SortKey>('startTime')
const sortDir = ref<'asc' | 'desc'>('desc')

const columns: MTableColumn[] = [
  { key: 'type', label: 'Behavior', sortable: true, width: '120px' },
  { key: 'driverName', label: 'Driver Name / ID', sortable: true, minWidth: '160px' },
  { key: 'vehicleId', label: 'Vehicle ID / MMY', sortable: true, minWidth: '180px' },
  { key: 'startTime', label: 'Date / Location / Geofence', sortable: true, minWidth: '220px' },
  { key: 'status', label: 'Status', sortable: true, align: 'center', width: '140px' },
  { key: 'actions', label: '', width: '50px' },
]

// ── Sorted rows ──────────────────────────────────────────────
const sorted = computed<FuelEventRow[]>(() => {
  return [...filteredRows.value].sort((a, b) => {
    let cmp = 0
    switch (sortKey.value) {
      case 'type':
        cmp = a.type.localeCompare(b.type)
        break
      case 'driverName':
        cmp = (a.driverName ?? '').localeCompare(b.driverName ?? '')
        break
      case 'vehicleId':
        cmp = a.vehicleName.localeCompare(b.vehicleName)
        break
      case 'startTime':
        cmp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        break
      case 'status': {
        const order: Record<string, number> = {
          'pending-review': 0,
          coachable: 1,
          coached: 2,
          dismissed: 3,
        }
        cmp = (order[a.status] ?? 0) - (order[b.status] ?? 0)
        break
      }
    }
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function handleSort(key: string, dir: 'asc' | 'desc') {
  sortKey.value = key as SortKey
  sortDir.value = dir
}

// ── Actions menu ─────────────────────────────────────────────
const openMenuId = ref<string | null>(null)
const menuAnchor = ref<HTMLElement | null>(null)

function getActionItems(_id: string): MDropdownItem[] {
  return [
    {
      label: 'View Details',
      action: () => {
        openMenuId.value = null
      },
    },
    {
      label: 'Mark Reviewed',
      action: () => {
        openMenuId.value = null
      },
    },
    { divider: true, label: '' },
    {
      label: 'Dismiss',
      action: () => {
        openMenuId.value = null
      },
    },
  ]
}

const actionItems = computed(() => (openMenuId.value ? getActionItems(openMenuId.value) : []))

function openMenu(id: string, el: HTMLElement) {
  if (openMenuId.value === id) {
    openMenuId.value = null
    menuAnchor.value = null
  } else {
    openMenuId.value = id
    menuAnchor.value = el
  }
}

// ── Filter options ───────────────────────────────────────────
const EVENT_TYPE_OPTIONS: MSelectOption<FuelEventType>[] = [
  { label: 'Fuel Loss', value: 'fuel-loss' },
  { label: 'Idling', value: 'idling' },
]

const VEHICLE_OPTIONS = computed<MSelectOption<string>[]>(() => [...vehicleOptions.value])

const DRIVER_OPTIONS = computed<MSelectOption<string>[]>(() => [...driverOptions.value])

const STATUS_OPTIONS: MSelectOption<FuelDropStatus>[] = [
  { label: 'Pending review', value: 'pending-review' },
  { label: 'Coachable', value: 'coachable' },
  { label: 'Coached', value: 'coached' },
  { label: 'Dismissed', value: 'dismissed' },
]

// ── Formatting helpers ───────────────────────────────────────
const { formatDate, formatTime } = useFormatters()

function formatDateLine(row: FuelEventRow): string {
  return `${formatDate(row.startTime)} ${formatTime(row.startTime)} EDT`
}

const TYPE_LABEL: Record<FuelEventType, string> = {
  'fuel-loss': 'Fuel Loss',
  idling: 'Idling',
}

const STATUS_BADGE: Record<
  FuelDropStatus,
  { color: 'warning' | 'success' | 'info' | 'default'; label: string }
> = {
  'pending-review': { color: 'warning', label: 'Pending review' },
  coachable: { color: 'info', label: 'Coachable' },
  coached: { color: 'success', label: 'Coached' },
  dismissed: { color: 'default', label: 'Dismissed' },
}
</script>

<template>
  <div class="fe-page">
    <!-- Filter bar -->
    <div class="fe-page__filters">
      <div class="fe-page__filters-left">
        <!-- Search -->
        <div class="fe-page__search">
          <Search :size="14" class="fe-page__search-icon" aria-hidden="true" />
          <input
            :value="filterSearch"
            type="text"
            class="fe-page__search-input"
            placeholder="Search vehicle or driver…"
            aria-label="Search vehicle or driver"
            @input="filterSearch = ($event.target as HTMLInputElement).value"
          />
          <button
            v-if="filterSearch"
            type="button"
            class="fe-page__search-clear"
            aria-label="Clear search"
            @click="filterSearch = ''"
          >
            <X :size="12" :stroke-width="2.5" />
          </button>
        </div>

        <!-- Event type filter -->
        <MSelect
          :model-value="filterEventType"
          :options="EVENT_TYPE_OPTIONS"
          label="Behavior"
          :clearable="true"
          aria-label="Filter by event type"
          @update:model-value="filterEventType = $event as FuelEventType | null"
        />

        <!-- Vehicle filter -->
        <MSelect
          :model-value="filterVehicle"
          :options="VEHICLE_OPTIONS"
          label="Vehicle"
          :clearable="true"
          aria-label="Filter by vehicle"
          @update:model-value="filterVehicle = $event as string | null"
        />

        <!-- Driver filter -->
        <MSelect
          :model-value="filterDriver"
          :options="DRIVER_OPTIONS"
          label="Driver"
          :clearable="true"
          aria-label="Filter by driver"
          @update:model-value="filterDriver = $event as string | null"
        />

        <!-- Status filter -->
        <MSelect
          :model-value="filterStatus"
          :options="STATUS_OPTIONS"
          label="Status"
          :clearable="true"
          aria-label="Filter by status"
          @update:model-value="filterStatus = $event as FuelDropStatus | null"
        />

        <!-- Clear filters -->
        <MButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="fe-filter-clear"
          @click="clearFilters"
        >
          <X :size="12" :stroke-width="2.5" />
          Clear
        </MButton>
      </div>
    </div>

    <!-- Table -->
    <div class="fe-page__content">
      <MTable
        :columns="columns"
        :rows="sorted as any"
        :sort-key="sortKey"
        :sort-dir="sortDir"
        :infinite="true"
        row-key="id"
        @sort="handleSort"
      >
        <!-- Behavior -->
        <template #cell-type="{ row: r }">
          <span class="fe-cell-primary">{{ TYPE_LABEL[(r as FuelEventRow).type] }}</span>
        </template>

        <!-- Driver Name / ID -->
        <template #cell-driverName="{ row: r }">
          <template v-if="(r as FuelEventRow).driverName">
            <span class="fe-cell-link">{{ (r as FuelEventRow).driverName }}</span>
            <span class="fe-cell-secondary">{{ (r as FuelEventRow).driverId }}</span>
          </template>
          <span v-else class="fe-cell-muted">—</span>
        </template>

        <!-- Vehicle ID / MMY -->
        <template #cell-vehicleId="{ row: r }">
          <NuxtLinkLocale
            :to="`/fleet/vehicles/${(r as FuelEventRow).vehicleId}/live`"
            class="fe-cell-link"
            @click.stop
          >
            {{ (r as FuelEventRow).vehicleName }}
          </NuxtLinkLocale>
          <span class="fe-cell-secondary">{{ (r as FuelEventRow).vehicleMMY }}</span>
        </template>

        <!-- Date / Location / Geofence -->
        <template #cell-startTime="{ row: r }">
          <div class="fe-cell-stack">
            <span class="fe-cell-primary">{{ formatDateLine(r as FuelEventRow) }}</span>
            <span class="fe-cell-secondary fe-cell-location" :title="(r as FuelEventRow).location">
              {{ (r as FuelEventRow).location }}
            </span>
          </div>
        </template>

        <!-- Status badge -->
        <template #cell-status="{ row: r }">
          <MBadge :color="STATUS_BADGE[(r as FuelEventRow).status].color" size="sm">
            {{ STATUS_BADGE[(r as FuelEventRow).status].label }}
          </MBadge>
        </template>

        <!-- Actions (kebab) -->
        <template #cell-actions="{ row: r }">
          <button
            class="fe-action-btn"
            type="button"
            aria-label="Event actions"
            @click.stop="openMenu((r as FuelEventRow).id, $event.currentTarget as HTMLElement)"
          >
            <MIcon :icon="MoreVertical" :size="16" />
          </button>
        </template>

        <!-- Empty state -->
        <template #empty>
          <div class="fe-empty">
            <span class="fe-empty__title">No events match your filters.</span>
            <span class="fe-empty__sub">Try adjusting the event type or status filter.</span>
          </div>
        </template>
      </MTable>

      <!-- Actions dropdown -->
      <MDropdown
        :items="actionItems"
        :open="openMenuId !== null"
        :anchor-el="menuAnchor"
        placement="right"
        @update:open="
          (v: boolean) => {
            if (!v) openMenuId = null
          }
        "
      />
    </div>
  </div>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.fe-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1.5rem 1.5rem;
  overflow: hidden;
}

.fe-page__filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  gap: 0.75rem;
}

.fe-page__filters-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fe-page__search {
  position: relative;
  display: flex;
  align-items: center;
}

.fe-page__search-icon {
  position: absolute;
  left: 0.5rem;
  color: var(--mtv-color-foreground-muted);
  pointer-events: none;
}

.fe-page__search-input {
  @apply h-8 rounded-sm border text-sm pl-7 pr-7 w-52;
  background: var(--mtv-color-background-card);
  border-color: var(--mtv-color-border-default);
  color: var(--mtv-color-foreground-default);
  outline: none;
  transition: border-color 0.15s;
}

.fe-page__search-input:focus {
  border-color: var(--mtv-color-brand-default);
}

.fe-page__search-input::placeholder {
  color: var(--mtv-color-foreground-muted);
}

.fe-page__search-clear {
  position: absolute;
  right: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  transition: background 0.15s;
}

.fe-page__search-clear:hover {
  background: var(--mtv-color-background-hover);
}

.fe-page__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* Cell styles */
.fe-cell-stack {
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.3;
}

.fe-cell-link {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-brand-default);
  cursor: pointer;
  text-decoration: none;
}

.fe-cell-link:hover {
  text-decoration: underline;
}

.fe-cell-muted {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}

.fe-cell-primary {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}

.fe-cell-secondary {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.fe-cell-location {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* Action button */
.fe-action-btn {
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

.fe-action-btn:hover {
  background: var(--mtv-color-background-hover);
  color: var(--mtv-color-foreground-default);
}

/* Empty state */
.fe-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.fe-empty__title {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}

.fe-empty__sub {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
}
</style>
