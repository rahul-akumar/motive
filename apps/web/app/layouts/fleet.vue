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
    <LayoutAppTopBar :alert-count="alertCount" @toggle-sidebar="toggleSidebar" />

    <div class="fleet-body">
      <Transition name="overlay">
        <div v-if="sidebarOpen" class="sidebar-overlay" aria-hidden="true" @click="closeSidebar" />
      </Transition>

      <LayoutAppSidebar
        :is-open="sidebarOpen"
        @open-settings="themeModalOpen = true"
        @close="closeSidebar"
      />

      <div class="fleet-main">
        <!-- No padding, no overflow — map fills this area directly -->
        <main class="fleet-content" id="main-content">
          <slot />
        </main>
      </div>
    </div>

    <LayoutThemeModal :open="themeModalOpen" @close="themeModalOpen = false" />
  </div>
</template>

<style scoped>
.fleet-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-base);
  transition: background-color 0.25s ease;
}

.fleet-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
}

.fleet-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  margin: 0 0.5rem 0.5rem 0;
  border-radius: 10px;
  background-color: var(--bg-main);
  border: 1px solid var(--border);
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
