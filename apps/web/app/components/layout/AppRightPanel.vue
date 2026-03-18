<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  activePanel: Component | null
}>()
</script>

<template>
  <aside :class="['right-panel', { 'right-panel--open': !!activePanel }]">
    <div class="right-panel__inner">
      <component :is="activePanel" v-if="activePanel" />
    </div>
  </aside>
</template>

<style scoped>
.right-panel {
  width: 0;
  flex-shrink: 0;
  overflow: hidden;
  background-color: var(--mtv-color-surface-base);
  height: 100%;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.right-panel--open {
  width: 272px;
}

.right-panel__inner {
  width: 272px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>
