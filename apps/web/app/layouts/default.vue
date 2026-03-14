<script setup lang="ts">
const { activeAlerts } = useAlerts()
const alertCount = computed(() => activeAlerts.value.length)

const themeModalOpen = ref(false)
const sidebarOpen = ref(false)
const route = useRoute()

const isMapMode = computed(() => route.meta.layoutMode === 'map')

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false
  },
)

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="app-shell">
    <LayoutAppTopBar :alert-count="alertCount" />

    <div class="app-body">
      <Transition name="overlay">
        <div v-if="sidebarOpen" class="sidebar-overlay" aria-hidden="true" @click="closeSidebar" />
      </Transition>

      <LayoutAppSidebar
        :is-open="sidebarOpen"
        @open-settings="themeModalOpen = true"
        @close="closeSidebar"
      />

      <div class="app-main">
        <!-- Page header: shown in standard mode only -->
        <div v-if="!isMapMode" class="app-page-header">
          <p class="app-page-module">{{ route.meta.moduleName as string }}</p>
          <h1 class="app-page-title font-condensed">{{ route.meta.title as string }}</h1>
        </div>

        <main
          :class="['app-content', { 'app-content--map': isMapMode, 'bg-dot-grid': !isMapMode }]"
          id="main-content"
        >
          <!-- Standard mode: entrance animation -->
          <div
            v-if="!isMapMode"
            v-motion
            :initial="{ opacity: 0, y: 8 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 300, ease: 'easeOut' } }"
          >
            <slot />
          </div>
          <!-- Map mode: slot fills container directly -->
          <slot v-else />
        </main>
      </div>
    </div>

    <LayoutThemeModal :open="themeModalOpen" @close="themeModalOpen = false" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-base);
  transition: background-color 0.25s ease;
}

.app-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  margin: 0rem 0.5rem 0.5rem 0;
  border-radius: var(--card-radius);
  background-color: var(--bg-main);
  border: 1px solid var(--border);
}

.app-page-header {
  padding: 1rem 1.25rem 0;
  flex-shrink: 0;
}

.app-page-module {
  font-size: 1.25rem;
  font-family: 'IBM Plex Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.app-page-title {
  font-size: 0rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.03em;
  line-height: 1;
  margin: 0;
}

.app-content {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-content--map {
  padding: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Nuxt wraps the page slot in a div in map mode — make it fill the flex container */
.app-content--map :deep(> div) {
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

@media (max-width: 768px) {
  .app-content:not(.app-content--map) {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .app-content:not(.app-content--map) {
    padding: 0.75rem;
  }
}
</style>
