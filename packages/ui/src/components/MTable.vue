<script setup lang="ts">
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'

export interface MTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  minWidth?: string
}

export interface MTableProps {
  columns: MTableColumn[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[]
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  rowKey?: string
  selectedKey?: string | number
  loading?: boolean
  stickyHeader?: boolean
}

const props = withDefaults(defineProps<MTableProps>(), {
  sortDir: 'asc',
  page: 1,
  pageSize: 8,
  rowKey: 'id',
  loading: false,
  stickyHeader: true,
})

const emit = defineEmits<{
  sort: [key: string, dir: 'asc' | 'desc']
  'update:page': [page: number]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'row-click': [row: any]
}>()

function handleSort(col: MTableColumn) {
  if (!col.sortable) return
  const newDir = props.sortKey === col.key && props.sortDir === 'asc' ? 'desc' : 'asc'
  emit('sort', col.key, newDir)
}

const totalPages = computed(() => Math.max(1, Math.ceil(props.rows.length / props.pageSize)))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paginated = computed<any[]>(() => {
  const start = (props.page - 1) * props.pageSize
  return props.rows.slice(start, start + props.pageSize)
})

const startItem = computed(() =>
  props.rows.length === 0 ? 0 : (props.page - 1) * props.pageSize + 1,
)
const endItem = computed(() => Math.min(props.page * props.pageSize, props.rows.length))

function prevPage() {
  if (props.page > 1) emit('update:page', props.page - 1)
}

function nextPage() {
  if (props.page < totalPages.value) emit('update:page', props.page + 1)
}
</script>

<template>
  <div class="m-table-wrapper">
    <!-- Optional header toolbar slot (e.g. export button) -->
    <div v-if="$slots.header" class="m-table__toolbar" role="toolbar">
      <slot name="header" />
    </div>

    <div class="m-table-scroll">
      <table class="m-table" role="grid">
        <thead :class="['m-table__head', { 'm-table__head--sticky': stickyHeader }]">
          <tr class="m-table__head-row" role="row">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'm-table__th',
                `m-table__th--${col.align ?? 'left'}`,
                {
                  'm-table__th--sortable': col.sortable,
                  'm-table__th--active': sortKey === col.key,
                },
              ]"
              :style="{
                ...(col.width ? { width: col.width } : {}),
                ...(col.minWidth ? { minWidth: col.minWidth } : {}),
              }"
              :aria-sort="
                col.sortable && sortKey === col.key
                  ? sortDir === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              "
              role="columnheader"
              @click="handleSort(col)"
            >
              <span class="m-table__th-inner">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="m-table__sort-icon" aria-hidden="true">
                  <component
                    :is="
                      sortKey === col.key
                        ? sortDir === 'asc'
                          ? ChevronUp
                          : ChevronDown
                        : ChevronsUpDown
                    "
                    :size="12"
                    :stroke-width="2"
                  />
                </span>
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="m-table__body">
          <template v-if="!loading && paginated.length > 0">
            <tr
              v-for="row in paginated"
              :key="String(row[rowKey] ?? row)"
              :class="[
                'm-table__row',
                { 'm-table__row--selected': selectedKey != null && row[rowKey] === selectedKey },
              ]"
              role="row"
              tabindex="0"
              @click="emit('row-click', row)"
              @keydown.enter="emit('row-click', row)"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                :class="['m-table__td', `m-table__td--${col.align ?? 'left'}`]"
                role="gridcell"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
          </template>

          <tr v-else-if="!loading">
            <td :colspan="columns.length" class="m-table__empty">
              <slot name="empty">
                <span class="m-table__empty-text">No results found.</span>
              </slot>
            </td>
          </tr>

          <tr v-else>
            <td :colspan="columns.length" class="m-table__empty">
              <slot name="loading">
                <span class="m-table__empty-text">Loading…</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination — only shown when rows exceed one page -->
    <div
      v-if="rows.length > pageSize"
      class="m-table__pagination"
      role="navigation"
      aria-label="Table pagination"
    >
      <span class="m-table__pagination-info"
        >{{ startItem }}–{{ endItem }} of {{ rows.length }}</span
      >
      <div class="m-table__pagination-controls">
        <button
          type="button"
          class="m-table__page-btn"
          :disabled="page <= 1"
          aria-label="Previous page"
          @click="prevPage"
        >
          <ChevronLeft :size="14" :stroke-width="2" />
        </button>
        <span class="m-table__page-label">{{ page }} / {{ totalPages }}</span>
        <button
          type="button"
          class="m-table__page-btn"
          :disabled="page >= totalPages"
          aria-label="Next page"
          @click="nextPage"
        >
          <ChevronRight :size="14" :stroke-width="2" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper ─────────────────────────────────────────────── */
.m-table-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 6px;
  overflow: hidden;
}

/* ── Toolbar ─────────────────────────────────────────────── */
.m-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.5rem 0.875rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  background-color: var(--mtv-color-surface-base);
  gap: 0.5rem;
  flex-shrink: 0;
}

/* ── Scroll container ────────────────────────────────────── */
.m-table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
}

/* ── Table ───────────────────────────────────────────────── */
.m-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

/* ── Head ────────────────────────────────────────────────── */
.m-table__head {
  background-color: var(--mtv-color-surface-base);
}

.m-table__head--sticky {
  position: sticky;
  top: 0;
  z-index: 1;
}

.m-table__head-row {
  border-bottom: 1px solid var(--mtv-color-border-default);
}

.m-table__th {
  padding: 0.625rem 1rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-subtle);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  user-select: none;
}

.m-table__th--left {
  text-align: left;
}
.m-table__th--center {
  text-align: center;
}
.m-table__th--right {
  text-align: right;
}

.m-table__th--sortable {
  cursor: pointer;
  transition: color 100ms ease;
}

.m-table__th--sortable:hover {
  color: var(--mtv-color-foreground-muted);
}

.m-table__th--active {
  color: var(--mtv-color-foreground-default);
}

.m-table__th-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.m-table__sort-icon {
  display: inline-flex;
  align-items: center;
  opacity: 0.45;
  transition: opacity 100ms ease;
}

.m-table__th--active .m-table__sort-icon {
  opacity: 1;
  color: var(--mtv-color-brand-default);
}

/* ── Body ────────────────────────────────────────────────── */
.m-table__row {
  border-bottom: 1px solid var(--mtv-color-border-default);
  cursor: pointer;
  transition: background-color 100ms ease;
  outline: none;
}

.m-table__row:last-child {
  border-bottom: none;
}

.m-table__row:hover {
  background-color: var(--mtv-color-surface-hover);
}

.m-table__row:focus-visible {
  background-color: var(--mtv-color-surface-hover);
  box-shadow: inset 2px 0 0 var(--mtv-color-brand-default);
}

.m-table__row--selected {
  background-color: var(--mtv-color-surface-hover);
  box-shadow: inset 2px 0 0 var(--mtv-color-brand-default);
}

.m-table__row--selected:hover {
  background-color: var(--mtv-color-surface-hover);
}

.m-table__td {
  padding: 0.6875rem 1rem;
  color: var(--mtv-color-foreground-default);
  vertical-align: middle;
}

.m-table__td--left {
  text-align: left;
}
.m-table__td--center {
  text-align: center;
}
.m-table__td--right {
  text-align: right;
}

/* ── Empty / Loading ─────────────────────────────────────── */
.m-table__empty {
  padding: 3.5rem 1rem;
  text-align: center;
}

.m-table__empty-text {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}

/* ── Pagination ──────────────────────────────────────────── */
.m-table__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5625rem 1rem;
  border-top: 1px solid var(--mtv-color-border-default);
  background-color: var(--mtv-color-surface-base);
  flex-shrink: 0;
}

.m-table__pagination-info {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  font-family: var(--font-family-mono);
}

.m-table__pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.m-table__page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 4px;
  background-color: transparent;
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  transition: all 100ms ease;
  padding: 0;
}

.m-table__page-btn:hover:not(:disabled) {
  background-color: var(--mtv-color-surface-raised);
  color: var(--mtv-color-foreground-default);
  border-color: var(--mtv-color-border-strong);
}

.m-table__page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.m-table__page-label {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  font-family: var(--font-family-mono);
  min-width: 3.5rem;
  text-align: center;
}
</style>
