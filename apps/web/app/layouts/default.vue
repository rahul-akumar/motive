<script setup lang="ts">
const route = useRoute()
useHead({
  title: () => {
    const { title, moduleName } = route.meta
    const pageTitle = title === 'Overview' ? undefined : title
    return [pageTitle, moduleName, 'Motive'].filter(Boolean).join(' - ')
  },
})

const { activePanel } = provideRightPanel()

const preferencesModalOpen = ref(false)
const preferencesInitialSection = ref('notifications')
const sidebarOpen = ref(false)

watch(
  () => useRoute().path,
  () => {
    sidebarOpen.value = false
  },
)

function closeSidebar() {
  sidebarOpen.value = false
}

function openPreferences(section?: string) {
  preferencesInitialSection.value = section ?? 'notifications'
  preferencesModalOpen.value = true
}
</script>

<template>
  <div class="app-shell">
    <Transition name="overlay">
      <div v-if="sidebarOpen" class="sidebar-overlay" aria-hidden="true" @click="closeSidebar" />
    </Transition>

    <LayoutAppSidebar
      :is-open="sidebarOpen"
      @open-preferences="openPreferences"
      @close="closeSidebar"
    />

    <LayoutAppMain>
      <slot />
    </LayoutAppMain>

    <LayoutAppRightPanel :active-panel="activePanel" />

    <LayoutAppPreferencesModal
      :open="preferencesModalOpen"
      :initial-section="preferencesInitialSection"
      @close="preferencesModalOpen = false"
    />

    <LayoutToastContainer />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: row;
  height: 100vh;
  background-color: var(--mtv-color-surface-base);
  transition: background-color 0.25s ease;
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
