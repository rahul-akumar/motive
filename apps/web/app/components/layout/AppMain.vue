<script setup lang="ts">
const route = useRoute()
const variant = computed(() => route.meta.mainVariant ?? 'default')
const isDefault = computed(() => variant.value === 'default')
</script>

<template>
  <div :class="['app-main', `app-main--${variant}`]">
    <!-- Page header: shown in default mode only -->
    <div v-if="isDefault" class="app-page-header">
      <p class="app-page-module">{{ route.meta.moduleName as string }}</p>
      <h1 class="app-page-title font-condensed">{{ route.meta.title as string }}</h1>
    </div>

    <main
      :class="['app-content', `app-content--${variant}`, { 'bg-dot-grid': isDefault }]"
      id="main-content"
    >
      <!-- Default mode: entrance animation -->
      <div
        v-if="isDefault"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 300, ease: 'easeOut' } }"
      >
        <slot />
      </div>
      <!-- Map / Globe mode: slot fills container directly -->
      <slot v-else />
    </main>
  </div>
</template>

<style scoped>
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  margin: 0.5rem 0.5rem 0.5rem 0;
  border-radius: var(--card-radius);
  background-color: var(--bg-main);
  border: 1px solid var(--border);
}

.app-main--globe {
  background-color: #0a0a0f;
  border-color: #1a1a2e;
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

.app-content--map,
.app-content--globe {
  padding: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Nuxt wraps the page slot in a div in non-default modes — make it fill the flex container */
.app-content--map :deep(> div),
.app-content--globe :deep(> div) {
  flex: 1;
  position: relative;
  min-height: 0;
  height: 100%;
}

@media (max-width: 768px) {
  .app-content--default {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .app-content--default {
    padding: 0.75rem;
  }
}
</style>
