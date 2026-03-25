<script setup lang="ts">
import { MTable, MBadge, type MTableColumn } from '@motive/ui'
import type { FuelLossEvent, FuelDropStatus } from '@motive/shared'

const props = defineProps<{
  events: FuelLossEvent[]
  selectedId?: string
}>()

const emit = defineEmits<{
  select: [event: FuelLossEvent]
}>()

// ── Sort state ───────────────────────────────────────────
type SortKey = 'vehicleName' | 'startTime' | 'fuelStart' | 'fuelEnd' | 'fuelDrop' | 'status'

const sortKey = ref<SortKey>('startTime')
const sortDir = ref<'asc' | 'desc'>('desc') // most recent first by default
const page = ref(1)

// Reset page on data or sort changes
watch(
  () => props.events,
  () => {
    page.value = 1
  },
)
watch([sortKey, sortDir], () => {
  page.value = 1
})

// ── Columns ──────────────────────────────────────────────
const columns: MTableColumn[] = [
  { key: 'vehicleName', label: 'Vehicle', sortable: true, minWidth: '130px' },
  { key: 'startTime', label: 'Time Window', sortable: true, minWidth: '200px' },
  { key: 'location', label: 'Location', minWidth: '180px' },
  { key: 'fuelStart', label: 'Fuel Start', sortable: true, align: 'right', width: '96px' },
  { key: 'fuelEnd', label: 'Fuel End', sortable: true, align: 'right', width: '88px' },
  { key: 'fuelDrop', label: 'Drop', sortable: true, align: 'right', width: '78px' },
  { key: 'status', label: 'Status', sortable: true, align: 'center', width: '100px' },
]

// ── Sorted rows ──────────────────────────────────────────
const sorted = computed<FuelLossEvent[]>(() => {
  return [...props.events].sort((a, b) => {
    let cmp = 0
    switch (sortKey.value) {
      case 'vehicleName':
        cmp = a.vehicleName.localeCompare(b.vehicleName)
        break
      case 'startTime':
        cmp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        break
      case 'fuelStart':
        cmp = a.fuelStart - b.fuelStart
        break
      case 'fuelEnd':
        cmp = a.fuelEnd - b.fuelEnd
        break
      case 'fuelDrop':
        cmp = a.fuelDrop - b.fuelDrop
        break
      case 'status': {
        const order: Record<string, number> = { open: 0, reviewed: 1, dismissed: 2 }
        cmp = (order[a.status] ?? 0) - (order[b.status] ?? 0)
        break
      }
    }
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

// ── Handlers ─────────────────────────────────────────────
function handleSort(key: string, dir: 'asc' | 'desc') {
  sortKey.value = key as SortKey
  sortDir.value = dir
}

// ── Formatting helpers ───────────────────────────────────
function formatTimeWindow(event: FuelLossEvent): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }
  const start = new Date(event.startTime).toLocaleString('en-US', opts)
  const endTime = new Date(event.endTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return `${start} – ${endTime}`
}

function formatLocation(event: FuelLossEvent): string {
  // Show only city/state portion (last two comma‑separated parts)
  const parts = event.location.address.split(',')
  return parts.slice(-2).join(',').trim()
}

const STATUS_BADGE: Record<
  FuelDropStatus,
  { color: 'warning' | 'success' | 'default'; label: string }
> = {
  open: { color: 'warning', label: 'Open' },
  reviewed: { color: 'success', label: 'Reviewed' },
  dismissed: { color: 'default', label: 'Dismissed' },
}

function dropColor(drop: number): string {
  if (drop >= 10) return 'oklch(0.711 0.166 22.2)'
  if (drop >= 5) return 'oklch(0.837 0.164 84.4)'
  return 'var(--mtv-color-foreground-muted)'
}
</script>

<template>
  <MTable
    :columns="columns"
    :rows="sorted"
    :sort-key="sortKey"
    :sort-dir="sortDir"
    :page="page"
    :page-size="8"
    row-key="id"
    :selected-key="selectedId"
    @sort="handleSort"
    @update:page="page = $event"
    @row-click="emit('select', $event)"
  >
    <!-- Time window -->
    <template #cell-startTime="{ row }">
      <span class="flt-cell-mono">{{ formatTimeWindow(row) }}</span>
    </template>

    <!-- Location -->
    <template #cell-location="{ row }">
      <span class="flt-cell-location" :title="row.location.address">
        {{ formatLocation(row) }}
      </span>
    </template>

    <!-- Fuel start -->
    <template #cell-fuelStart="{ row }">
      <span class="flt-cell-mono">{{ row.fuelStart }}%</span>
    </template>

    <!-- Fuel end -->
    <template #cell-fuelEnd="{ row }">
      <span class="flt-cell-mono">{{ row.fuelEnd }}%</span>
    </template>

    <!-- Fuel drop — color coded -->
    <template #cell-fuelDrop="{ row }">
      <span class="flt-cell-drop" :style="{ color: dropColor(row.fuelDrop) }">
        −{{ row.fuelDrop }}%
      </span>
    </template>

    <!-- Status badge -->
    <template #cell-status="{ row }">
      <MBadge :color="STATUS_BADGE[row.status as FuelDropStatus].color" size="sm">
        {{ STATUS_BADGE[row.status as FuelDropStatus].label }}
      </MBadge>
    </template>

    <!-- Empty state -->
    <template #empty>
      <div class="flt-empty">
        <span class="flt-empty__title">No fuel loss events match your filters.</span>
        <span class="flt-empty__sub">Try adjusting the drop threshold or status filter.</span>
      </div>
    </template>
  </MTable>
</template>

<style scoped>
.flt-cell-mono {
  font-size: var(--font-size-sm);
}

.flt-cell-location {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  display: block;
}

.flt-cell-drop {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.flt-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.flt-empty__title {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}

.flt-empty__sub {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}
</style>
