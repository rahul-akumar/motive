<script setup lang="ts">
const { activeAlerts } = useAlerts()
const alertCount = computed(() => activeAlerts.value.length)

const themeModalOpen = ref(false)
const sidebarOpen = ref(false)
const route = useRoute()

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

// Close sidebar on route change (mobile nav)
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  },
)
</script>

<template>
  <div class="dashboard-shell">
    <!-- Mobile overlay backdrop -->
    <Transition name="overlay">
      <div v-if="sidebarOpen" class="sidebar-overlay" aria-hidden="true" @click="closeSidebar" />
    </Transition>

    <LayoutAppSidebar
      :is-open="sidebarOpen"
      @open-settings="themeModalOpen = true"
      @close="closeSidebar"
    />

    <div class="dashboard-main">
      <LayoutAppTopBar
        :title="route.meta.title as string"
        :module-name="route.meta.moduleName as string"
        :alert-count="alertCount"
        @toggle-sidebar="toggleSidebar"
      />
      <main class="dashboard-content bg-dot-grid" id="main-content">
        <div
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, ease: 'easeOut' } }"
        >
          <slot />
        </div>
      </main>
    </div>

    <!-- Theme Settings Modal -->
    <LayoutThemeModal :open="themeModalOpen" @close="themeModalOpen = false" />
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-base);
  transition: background-color 0.25s ease;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.dashboard-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
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

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard-content {
    padding: 0.75rem;
  }
}
</style>
