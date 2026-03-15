<script setup lang="ts">
definePageMeta({
  title: 'Fleet 3D',
  moduleName: 'Fleet 3D',
  mainVariant: 'globe',
})

const {
  drivers,
  filteredDrivers,
  statusCounts,
  activeFilters,
  isAllSelected,
  toggleFilter,
  setAllFilters,
  searchQuery,
  selectedDriverId,
  selectedDriver,
  selectedVehicle,
  selectDriver,
  isPanelOpen,
  togglePanel,
} = useFleetView()
</script>

<template>
  <div class="f3d-page">
    <!-- Globe fills entire area -->
    <ClientOnly>
      <Fleet3dGlobe
        :drivers="filteredDrivers"
        :selected-driver-id="selectedDriverId"
        class="f3d-page__globe"
        @select-driver="selectDriver"
      />
    </ClientOnly>

    <!-- Left driver list panel (overlay) -->
    <Fleet3dPanel
      :drivers="drivers"
      :filtered-drivers="filteredDrivers"
      :selected-driver-id="selectedDriverId"
      :active-filters="activeFilters"
      :is-all-selected="isAllSelected"
      :status-counts="statusCounts"
      :is-panel-open="isPanelOpen"
      :search-query="searchQuery"
      @select-driver="selectDriver"
      @toggle-filter="toggleFilter"
      @set-all-filters="setAllFilters"
      @toggle-panel="togglePanel"
      @update:search-query="(v) => (searchQuery = v)"
    />

    <!-- Right driver detail panel (overlay) -->
    <FleetViewDetailPanel
      :driver="selectedDriver"
      :vehicle="selectedVehicle"
      @close="selectDriver(null)"
    />
  </div>
</template>

<style scoped>
.f3d-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #0a0a0f;
}

.f3d-page__globe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
