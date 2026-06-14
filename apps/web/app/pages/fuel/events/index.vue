<script setup lang="ts">
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import {
  MTable,
  MTableCell,
  MButton,
  MBadge,
  MSelect,
  MIcon,
  MDrawer,
  type MSelectOption,
  type MTableColumn,
} from '@motive/ui'
import { NuxtLinkLocale } from '#components'
import type { FuelEventType, FuelDropStatus } from '@motive/shared'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

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
  updateEventStatus,
} = useFuelEventsData()

// ── Sort state ───────────────────────────────────────────────
type SortKey = 'type' | 'driverName' | 'vehicleId' | 'startTime' | 'status'
const sortKey = ref<SortKey>('startTime')
const sortDir = ref<'asc' | 'desc'>('desc')

// All columns hug their content; Status takes width:100% so it absorbs the
// remaining width (the table is width:100%, table-layout:auto).
const columns: MTableColumn[] = [
  { key: 'type', label: 'Behavior', sortable: true },
  { key: 'driverName', label: 'Driver Name / ID', sortable: true },
  { key: 'vehicleId', label: 'Vehicle ID / MMY', sortable: true },
  { key: 'startTime', label: 'Date / Location / Geofence', sortable: true },
  { key: 'status', label: 'Status', sortable: true, width: '100%' },
  { key: 'actions', label: '', align: 'right' },
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

// ── Drawer state ─────────────────────────────────────────────
const selectedEvent = ref<FuelEventRow | null>(null)
const drawerOpen = ref(false)

const selectedIndex = computed(() => {
  if (!selectedEvent.value) return -1
  return sorted.value.findIndex((r) => r.id === selectedEvent.value!.id)
})

const canGoPrev = computed(() => selectedIndex.value > 0)
const canGoNext = computed(
  () => selectedIndex.value < sorted.value.length - 1 && selectedIndex.value >= 0,
)

function goToPrev() {
  if (canGoPrev.value) {
    selectedEvent.value = sorted.value[selectedIndex.value - 1] ?? null
  }
}

function goToNext() {
  if (canGoNext.value) {
    selectedEvent.value = sorted.value[selectedIndex.value + 1] ?? null
  }
}

function handleRowClick(row: unknown) {
  selectedEvent.value = row as FuelEventRow
  drawerOpen.value = true
}

function handleStatusChange(v: string | number | null) {
  if (!selectedEvent.value || !v) return
  updateEventStatus(selectedEvent.value.id, v as FuelDropStatus)
  selectedEvent.value = { ...selectedEvent.value, status: v as FuelDropStatus }
}

function goToEventDetail() {
  if (!selectedEvent.value) return
  drawerOpen.value = false
  navigateTo(`/fuel/events/${selectedEvent.value.id}`)
}

// ── Row actions ──────────────────────────────────────────────
// The row itself opens the drawer (handleRowClick); the explicit
// "View Details" button navigates to the full detail page instead.
function viewDetails(id: string) {
  navigateTo(`/fuel/events/${id}`)
}

// ── Template cast helper (avoids inline `as` breaking syntax highlight) ──
function row(r: unknown): FuelEventRow {
  return r as FuelEventRow
}

function handleSearchInput(e: Event) {
  filterSearch.value = (e.target as HTMLInputElement).value
}

function setFilterEventType(v: string | number | null) {
  filterEventType.value = v as FuelEventType | null
}

function setFilterVehicle(v: string | number | null) {
  filterVehicle.value = v as string | null
}

function setFilterDriver(v: string | number | null) {
  filterDriver.value = v as string | null
}

function setFilterStatus(v: string | number | null) {
  filterStatus.value = v as FuelDropStatus | null
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
          <MIcon :icon="Search" :size="14" class="fe-page__search-icon" />
          <input
            :value="filterSearch"
            type="text"
            class="fe-page__search-input"
            placeholder="Search vehicle or driver…"
            aria-label="Search vehicle or driver"
            @input="handleSearchInput"
          />
          <button
            v-if="filterSearch"
            type="button"
            class="fe-page__search-clear"
            aria-label="Clear search"
            @click="filterSearch = ''"
          >
            <MIcon :icon="X" :size="12" :stroke-width="2.5" />
          </button>
        </div>

        <!-- Event type filter -->
        <MSelect
          :model-value="filterEventType"
          :options="EVENT_TYPE_OPTIONS"
          label="Behavior"
          :clearable="true"
          aria-label="Filter by event type"
          @update:model-value="setFilterEventType"
        />

        <!-- Vehicle filter -->
        <MSelect
          :model-value="filterVehicle"
          :options="VEHICLE_OPTIONS"
          label="Vehicle"
          :clearable="true"
          aria-label="Filter by vehicle"
          @update:model-value="setFilterVehicle"
        />

        <!-- Driver filter -->
        <MSelect
          :model-value="filterDriver"
          :options="DRIVER_OPTIONS"
          label="Driver"
          :clearable="true"
          aria-label="Filter by driver"
          @update:model-value="setFilterDriver"
        />

        <!-- Status filter -->
        <MSelect
          :model-value="filterStatus"
          :options="STATUS_OPTIONS"
          label="Status"
          :clearable="true"
          aria-label="Filter by status"
          @update:model-value="setFilterStatus"
        />

        <!-- Clear filters -->
        <MButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="fe-filter-clear"
          @click="clearFilters"
        >
          <MIcon :icon="X" :size="12" :stroke-width="2.5" />
          Clear
        </MButton>
      </div>
    </div>

    <!-- Table -->
    <div class="fe-page__content">
      <MTable
        :columns="columns"
        :rows="sorted as unknown as Record<string, unknown>[]"
        :sort-key="sortKey"
        :sort-dir="sortDir"
        :infinite="true"
        row-key="id"
        :selected-key="selectedEvent?.id"
        @sort="handleSort"
        @row-click="handleRowClick"
      >
        <!-- Behavior -->
        <template #cell-type="{ row: r }">
          <MTableCell>{{ TYPE_LABEL[row(r).type] }}</MTableCell>
        </template>

        <!-- Driver Name / ID -->
        <template #cell-driverName="{ row: r }">
          <template v-if="row(r).driverName">
            <MTableCell variant="link">{{ row(r).driverName }}</MTableCell>
            <MTableCell variant="secondary">{{ row(r).driverId }}</MTableCell>
          </template>
          <MTableCell v-else variant="muted">—</MTableCell>
        </template>

        <!-- Vehicle ID / MMY -->
        <template #cell-vehicleId="{ row: r }">
          <MTableCell
            variant="link"
            :tag="NuxtLinkLocale"
            :to="`/fleet/vehicles/${row(r).vehicleId}/live`"
            @click.stop
          >
            {{ row(r).vehicleName }}
          </MTableCell>
          <MTableCell variant="secondary">{{ row(r).vehicleMMY }}</MTableCell>
        </template>

        <!-- Date / Location / Geofence -->
        <template #cell-startTime="{ row: r }">
          <div class="fe-cell-stack">
            <MTableCell>{{ formatDateLine(row(r)) }}</MTableCell>
            <MTableCell variant="secondary" class="fe-cell-location" :title="row(r).location">
              {{ row(r).location }}
            </MTableCell>
          </div>
        </template>

        <!-- Status badge -->
        <template #cell-status="{ row: r }">
          <MBadge :color="STATUS_BADGE[row(r).status].color" size="sm">
            {{ STATUS_BADGE[row(r).status].label }}
          </MBadge>
        </template>

        <!-- Actions — explicit "View Details" navigates to the detail page
             (row-click opens the drawer; this button must not). -->
        <template #cell-actions="{ row: r }">
          <MButton variant="ghost" size="sm" @click.stop="viewDetails(row(r).id)">
            View details
          </MButton>
        </template>

        <!-- Empty state -->
        <template #empty>
          <div class="fe-empty">
            <span class="fe-empty__title">No events match your filters.</span>
            <span class="fe-empty__sub">Try adjusting the event type or status filter.</span>
          </div>
        </template>
      </MTable>
    </div>

    <!-- Event detail drawer -->
    <MDrawer
      v-model:open="drawerOpen"
      persistent
      :aria-label="selectedEvent ? `${selectedEvent.type} event details` : 'Event details'"
    >
      <template #header>
        <span class="fe-drawer-title">
          {{ selectedEvent?.type === 'fuel-loss' ? 'Fuel loss event' : 'Idling event' }}
        </span>
        <div class="fe-drawer-nav">
          <MButton
            variant="ghost"
            size="sm"
            icon-only
            :disabled="!canGoPrev"
            aria-label="Previous event"
            @click="goToPrev"
          >
            <MIcon :icon="ChevronLeft" />
          </MButton>
          <MButton
            variant="ghost"
            size="sm"
            icon-only
            :disabled="!canGoNext"
            aria-label="Next event"
            @click="goToNext"
          >
            <MIcon :icon="ChevronRight" />
          </MButton>
        </div>
      </template>

      <template v-if="selectedEvent" #subheader>
        <MSelect
          :model-value="selectedEvent.status"
          :options="STATUS_OPTIONS"
          label=""
          :clearable="false"
          class="fe-drawer-status-select"
          aria-label="Change event status"
          @update:model-value="handleStatusChange"
        />
        <MButton variant="link" size="sm" @click="goToEventDetail"> View details </MButton>
      </template>

      <FuelEventDrawer :event="selectedEvent" />
    </MDrawer>
  </div>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.fe-page {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  @apply h-8 rounded-sm border text-base pl-7 pr-7 w-52;
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

.fe-cell-location {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
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

/* Drawer title */
.fe-drawer-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fe-drawer-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.fe-drawer-status-select {
  max-width: 160px;
}

.fe-drawer-status-select :deep(.m-select__trigger) {
  background-color: var(--mtv-color-brand-default);
  border-color: var(--mtv-color-brand-default);
  color: var(--mtv-color-brand-foreground);
}

.fe-drawer-status-select :deep(.m-select__trigger:hover:not(:disabled)) {
  background-color: var(--mtv-color-brand-hover);
  border-color: var(--mtv-color-brand-hover);
}

.fe-drawer-status-select :deep(.m-select__chevron) {
  color: var(--mtv-color-brand-foreground);
}

.fe-drawer-status-select :deep(.m-select__value) {
  color: var(--mtv-color-brand-foreground);
}
</style>
