<script setup lang="ts">
import { Search, X, Download } from 'lucide-vue-next'
import { MButton, MSelect, type MSelectOption } from '@motive/ui'
import type { FuelDropStatus } from '@motive/shared'

const props = defineProps<{
  search: string
  minDropPct: number
  statusFilter: FuelDropStatus | 'all'
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:minDropPct': [value: number]
  'update:statusFilter': [value: FuelDropStatus | 'all']
  clear: []
  export: []
}>()

const DROP_OPTIONS: MSelectOption<number>[] = [
  { label: 'Any drop %', value: 0 },
  { label: '≥ 3%', value: 3 },
  { label: '≥ 5%', value: 5 },
  { label: '≥ 10%', value: 10 },
  { label: '≥ 15%', value: 15 },
]

const STATUS_OPTIONS: MSelectOption<FuelDropStatus | 'all'>[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Dismissed', value: 'dismissed' },
]
</script>

<template>
  <div class="fl-filter-bar">
    <div class="fl-filter-bar__left">
      <!-- Search -->
      <div class="fl-filter-bar__search">
        <Search :size="14" class="fl-filter-bar__search-icon" aria-hidden="true" />
        <input
          :value="search"
          type="text"
          class="fl-filter-bar__input"
          placeholder="Search vehicle or driver…"
          aria-label="Search vehicle or driver"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="search"
          type="button"
          class="fl-filter-bar__clear-input"
          aria-label="Clear search"
          @click="emit('update:search', '')"
        >
          <X :size="12" :stroke-width="2.5" />
        </button>
      </div>

      <!-- Min drop % -->
      <MSelect
        :model-value="minDropPct"
        :options="DROP_OPTIONS"
        aria-label="Minimum fuel drop percentage"
        @update:model-value="emit('update:minDropPct', $event as number)"
      />

      <!-- Status -->
      <MSelect
        :model-value="statusFilter"
        :options="STATUS_OPTIONS"
        aria-label="Filter by status"
        @update:model-value="emit('update:statusFilter', $event as FuelDropStatus | 'all')"
      />

      <!-- Reset — only shown when filters are active -->
      <Transition name="fl-filter-clear">
        <MButton v-if="hasActiveFilters" variant="outline" size="sm" @click="emit('clear')">
          <X :size="13" :stroke-width="2" />
          Reset
        </MButton>
      </Transition>
    </div>

    <!-- Export — pinned to right edge -->
    <MButton variant="outline" size="sm" @click="emit('export')">
      <Download :size="13" :stroke-width="1.75" />
      Export CSV
    </MButton>
  </div>
</template>

<style scoped>
.fl-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.625rem;
  padding: 0.875rem 0;
  flex-wrap: wrap;
}

.fl-filter-bar__left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

/* ── Search input ────────────────────────────────────────── */
.fl-filter-bar__search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.fl-filter-bar__search-icon {
  position: absolute;
  left: 0.625rem;
  color: var(--mtv-color-foreground-subtle);
  pointer-events: none;
}

.fl-filter-bar__input {
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

.fl-filter-bar__input::placeholder {
  color: var(--mtv-color-foreground-subtle);
}

.fl-filter-bar__input:focus {
  border-color: var(--mtv-color-brand-default);
}

.fl-filter-bar__clear-input {
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

.fl-filter-bar__clear-input:hover {
  color: var(--mtv-color-foreground-default);
  background-color: var(--mtv-color-surface-hover);
}

/* ── Select — native styles removed, MSelect handles its own ── */

/* ── Clear filters transition ───────────────────────────── */
.fl-filter-clear-enter-active,
.fl-filter-clear-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.fl-filter-clear-enter-from,
.fl-filter-clear-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
