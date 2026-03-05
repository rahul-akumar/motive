<script setup lang="ts">
definePageMeta({
  layout: 'fleet',
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
  fitAllTrigger,
  fitAllTrucks,
} = useFleetView()

// Ref to the map component for zoom controls
const mapRef = ref<{ zoomIn: () => void; zoomOut: () => void; fitAllBounds: () => void } | null>(
  null,
)

function handleZoomIn() {
  mapRef.value?.zoomIn()
}

function handleZoomOut() {
  mapRef.value?.zoomOut()
}
</script>

<template>
  <div class="fv-page">
    <!-- Map fills the entire area -->
    <ClientOnly>
      <FleetViewMap
        ref="mapRef"
        :drivers="filteredDrivers"
        :selected-driver-id="selectedDriverId"
        :fit-all-trigger="fitAllTrigger"
        class="fv-page__map"
        @select-driver="selectDriver"
      />
      <template #fallback>
        <div class="fv-page__map fv-page__map-skeleton" aria-hidden="true" />
      </template>
    </ClientOnly>

    <!-- Left driver list panel (overlay) -->
    <FleetViewPanel
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

    <!-- Map controls (floating bottom-right) -->
    <FleetViewMapControls
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @fit-all="fitAllTrucks"
    />
  </div>
</template>

<style scoped>
/* The fleet layout provides a position:relative, overflow:hidden container.
   This page fills it completely. */
.fv-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Map sits at z-index 0 — panels overlay on top */
.fv-page__map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.fv-page__map-skeleton {
  background: var(--bg-base);
}
</style>
