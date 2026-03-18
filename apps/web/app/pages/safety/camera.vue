<script setup lang="ts">
import CameraPanel from './panels/CameraPanel.vue'
import CameraKpiStrip from './camera/CameraKpiStrip.vue'
import CameraFilterBar from './camera/CameraFilterBar.vue'
import CameraTable from './camera/CameraTable.vue'
import type { CameraType, KpiFilter } from '~/composables/useCameraData'

definePageMeta({
  title: 'Cameras',
  moduleName: 'Safety',
})

useRightPanel(CameraPanel)

const statusFilter = ref<KpiFilter | null>(null)
const typeFilter = ref<'all' | CameraType>('all')
const search = ref('')

function clearFilters() {
  statusFilter.value = null
  typeFilter.value = 'all'
  search.value = ''
}
</script>

<template>
  <div class="camera-page">
    <CameraKpiStrip :active="statusFilter" @select="statusFilter = $event" />
    <CameraFilterBar
      :type-filter="typeFilter"
      :status-filter="statusFilter"
      :search="search"
      @update:type-filter="typeFilter = $event"
      @update:status-filter="statusFilter = $event"
      @update:search="search = $event"
    />
    <CameraTable
      :type-filter="typeFilter"
      :status-filter="statusFilter"
      :search="search"
      @clear="clearFilters"
    />
  </div>
</template>

<style scoped>
.camera-page {
  display: flex;
  flex-direction: column;
}
</style>
