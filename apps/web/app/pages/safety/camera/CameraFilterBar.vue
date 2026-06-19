<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { MInput, MSelect } from '@motive/ui'
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
      <MInput
        :model-value="search"
        type="search"
        size="sm"
        :leading-icon="Search"
        :clearable="true"
        placeholder="Search vehicles..."
        aria-label="Search vehicles"
        @update:model-value="(v) => emit('update:search', v)"
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
  margin-left: auto;
  width: 220px;
}
</style>
