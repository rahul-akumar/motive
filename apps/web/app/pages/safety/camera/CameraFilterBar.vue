<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { MIcon, MSelect } from '@motive/ui'
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

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'dashcam', label: 'Dashcam' },
  { value: 'ai-omnicam', label: 'AI Omnicam' },
  { value: 'multi-cam-dvr', label: 'Multi-Cam DVR' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'pending', label: 'Pending Setup' },
  { value: 'issues', label: 'Issues' },
]
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__selects">
      <MSelect
        :model-value="typeFilter"
        :options="TYPE_OPTIONS"
        aria-label="Camera type"
        @update:model-value="(v) => emit('update:typeFilter', v as 'all' | CameraType)"
      />

      <MSelect
        :model-value="statusFilter ?? 'all'"
        :options="STATUS_OPTIONS"
        aria-label="Camera status"
        @update:model-value="
          (v) => emit('update:statusFilter', v == null || v === 'all' ? null : (v as KpiFilter))
        "
      />
    </div>

    <div class="filter-bar__search">
      <MIcon :icon="Search" :size="14" class="filter-bar__search-icon" />
      <!-- eslint-disable-next-line vue/no-restricted-html-elements -- native search input: MInput has no leading-icon slot; styling is tokenized -->
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

.filter-input {
  height: 32px;
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--radius);
  color: var(--mtv-color-foreground-default);
  font-size: var(--font-size-sm);
  font-family: inherit;
  outline: none;
  transition: border-color var(--mtv-duration-fast) var(--mtv-ease-standard);
  padding: 0 0.75rem 0 2rem;
  width: 220px;
}

.filter-input:focus {
  border-color: var(--mtv-color-foreground-subtle);
}

.filter-input::placeholder {
  color: var(--mtv-color-foreground-subtle);
}

/* Remove default search cancel button */
.filter-input::-webkit-search-cancel-button {
  display: none;
}
</style>
