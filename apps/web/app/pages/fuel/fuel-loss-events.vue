<script setup lang="ts">
import FuelLossPanel from './panels/FuelLossPanel.vue'

definePageMeta({
  title: 'Fuel Loss Events',
  moduleName: 'Fuel',
})

useRightPanel(FuelLossPanel)

const {
  filteredEvents,
  filterSearch,
  filterMinDropPct,
  filterStatus,
  hasActiveFilters,
  selectedEvent,
  selectEvent,
  clearFilters,
  exportCsv,
} = useFuelLossData()
</script>

<template>
  <div class="fl-page">
    <FuelLossFilterBar
      :search="filterSearch"
      :min-drop-pct="filterMinDropPct"
      :status-filter="filterStatus"
      :has-active-filters="hasActiveFilters"
      @update:search="filterSearch = $event"
      @update:min-drop-pct="filterMinDropPct = $event"
      @update:status-filter="filterStatus = $event"
      @clear="clearFilters"
      @export="exportCsv"
    />

    <div class="fl-page__content">
      <FuelLossTable
        :events="filteredEvents"
        :selected-id="selectedEvent?.id"
        @select="selectEvent"
      />
    </div>
  </div>
</template>

<style scoped>
.fl-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1.5rem 1.5rem;
  overflow: hidden;
}

.fl-page__content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
