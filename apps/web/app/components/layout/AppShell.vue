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

    <slot />

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
  /* Single source of truth for the page gutter — shared by every layout (AppMain,
     AppMainDetail) so headers and content keep one hard left alignment everywhere. */
  --page-gutter: 2rem;
  display: flex;
  flex-direction: row;
  height: 100vh;
  background-color: var(--mtv-color-surface-base);
  transition: background-color var(--mtv-duration-base) var(--mtv-ease-standard);
}

@media (max-width: 768px) {
  .app-shell {
    --page-gutter: 1rem;
  }
}

@media (max-width: 480px) {
  .app-shell {
    --page-gutter: 0.75rem;
  }
}

/* Mobile overlay backdrop */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--mtv-color-surface-scrim);
  z-index: var(--mtv-z-overlay);
  backdrop-filter: blur(1px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--mtv-duration-base) var(--mtv-ease-standard);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
