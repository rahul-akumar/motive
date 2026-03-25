<script setup lang="ts">
definePageMeta({
  title: 'Live 3D',
  moduleName: 'Fleet',
})

const {
  drivers,
  vehicles,
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
</script>

<template>
  <div class="f3d-page">
    <!-- Globe fills entire area -->
    <ClientOnly>
      <Fleet3dGlobe
        :drivers="filteredDrivers"
        :vehicles="vehicles"
        :selected-driver-id="selectedDriverId"
        :fit-all-trigger="fitAllTrigger"
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

    <!-- Fit All button -->
    <button class="f3d-fit-btn" @click="fitAllTrucks">⊡ Fit All</button>
  </div>
</template>

<style scoped>
.f3d-page {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: oklch(0.147 0.011 285);
}

.f3d-page__globe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.f3d-fit-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 10;
  background: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-strong);
  border-radius: 4px;
  color: var(--mtv-color-foreground-default);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  letter-spacing: var(--tracking-wider);
  padding: 6px 12px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition:
    background 0.15s,
    border-color 0.15s;
}

.f3d-fit-btn:hover {
  background: var(--mtv-color-surface-overlay);
  border-color: var(--mtv-color-border-accent);
}
</style>
