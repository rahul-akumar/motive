<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import type { CameraType, KpiFilter } from '~/composables/useCameraData'

export interface CameraFilterBarProps {
  typeFilter: 'all' | CameraType
  statusFilter: KpiFilter | null
  search: string
}

defineProps<CameraFilterBarProps>()

const emit = defineEmits<{
  'update:typeFilter': [value: 'all' | CameraType]
  'update:statusFilter': [value: KpiFilter | null]
  'update:search': [value: string]
}>()
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__selects">
      <select
        class="filter-select"
        :value="typeFilter"
        @change="
          emit(
            'update:typeFilter',
            ($event.target as HTMLSelectElement).value as 'all' | CameraType,
          )
        "
      >
        <option value="all">All Types</option>
        <option value="dashcam">Dashcam</option>
        <option value="ai-omnicam">AI Omnicam</option>
        <option value="multi-cam-dvr">Multi-Cam DVR</option>
      </select>

      <select
        class="filter-select"
        :value="statusFilter ?? 'all'"
        @change="
          emit(
            'update:statusFilter',
            ($event.target as HTMLSelectElement).value === 'all'
              ? null
              : (($event.target as HTMLSelectElement).value as KpiFilter),
          )
        "
      >
        <option value="all">All Statuses</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
        <option value="pending">Pending Setup</option>
        <option value="issues">Issues</option>
      </select>
    </div>

    <div class="filter-bar__search">
      <Search class="filter-bar__search-icon" :size="14" aria-hidden="true" />
      <input
        class="filter-input"
        type="search"
        placeholder="Search vehicles..."
        :value="search"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-bar__selects {
  display: flex;
  gap: 0.5rem;
}

.filter-bar__search {
  position: relative;
  margin-left: auto;
}

.filter-bar__search-icon {
  position: absolute;
  left: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--mtv-color-foreground-subtle);
  pointer-events: none;
}

.filter-select,
.filter-input {
  height: 32px;
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 5px;
  color: var(--mtv-color-foreground-default);
  font-size: var(--font-size-sm);
  font-family: inherit;
  outline: none;
  transition: border-color 120ms ease;
}

.filter-select:focus,
.filter-input:focus {
  border-color: var(--mtv-color-foreground-subtle);
}

.filter-select {
  padding: 0 2rem 0 0.625rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
}

.filter-input {
  padding: 0 0.75rem 0 2rem;
  width: 220px;
}

.filter-input::placeholder {
  color: var(--mtv-color-foreground-subtle);
}

/* Remove default search cancel button */
.filter-input::-webkit-search-cancel-button {
  display: none;
}
</style>
