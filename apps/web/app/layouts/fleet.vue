<script setup lang="ts">
const { activeAlerts } = useAlerts()
const alertCount = computed(() => activeAlerts.value.length)

const themeModalOpen = ref(false)
const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

const route = useRoute()
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  },
)
</script>

<template>
  <div class="fleet-shell">
    <!-- Mobile overlay backdrop -->
    <Transition name="overlay">
      <div v-if="sidebarOpen" class="sidebar-overlay" aria-hidden="true" @click="closeSidebar" />
    </Transition>

    <LayoutAppSidebar
      :is-open="sidebarOpen"
      @open-settings="themeModalOpen = true"
      @close="closeSidebar"
    />

    <div class="fleet-main">
      <LayoutAppTopBar
        :title="route.meta.title as string"
        :module-name="route.meta.moduleName as string"
        :alert-count="alertCount"
        @toggle-sidebar="toggleSidebar"
      />
      <!-- No padding, no overflow — map fills this area directly -->
      <main class="fleet-content" id="main-content">
        <slot />
      </main>
    </div>

    <LayoutThemeModal :open="themeModalOpen" @close="themeModalOpen = false" />
  </div>
</template>

<style scoped>
.fleet-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-base);
  transition: background-color 0.25s ease;
}

.fleet-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  height: 100vh;
}

/* No padding, no overflow-y — the map fills this completely */
.fleet-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Nuxt wraps the page slot in a div — make it fill the flex container */
.fleet-content :deep(> div) {
  flex: 1;
  position: relative;
  min-height: 0;
  height: 100%;
}

/* Mobile overlay backdrop */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  z-index: 40;
  backdrop-filter: blur(1px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
