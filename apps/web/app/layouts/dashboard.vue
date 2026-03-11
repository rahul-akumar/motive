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
    <LayoutAppTopBar :alert-count="alertCount" @toggle-sidebar="toggleSidebar" />

    <div class="dashboard-body">
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
        <div class="dashboard-page-header">
          <p class="dashboard-page-module">{{ route.meta.moduleName as string }}</p>
          <h1 class="dashboard-page-title font-condensed">{{ route.meta.title as string }}</h1>
        </div>
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
    </div>

    <!-- Theme Settings Modal -->
    <LayoutThemeModal :open="themeModalOpen" @close="themeModalOpen = false" />
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-base);
  transition: background-color 0.25s ease;
}

.dashboard-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  margin: 0rem 0.5rem 0.5rem 0;
  border-radius: 10px;
  background-color: var(--bg-main);
  border: 1px solid var(--border);
}

.dashboard-page-header {
  padding: 1rem 1.25rem 0.5rem;
  flex-shrink: 0;
}

.dashboard-page-module {
  font-size: 1.25rem;
  font-family: 'IBM Plex Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.dashboard-page-title {
  font-size: 0rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.03em;
  line-height: 1;
  margin: 0;
}

.dashboard-content {
  flex: 1;
  padding: 1.25rem;
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
