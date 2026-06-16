<script setup lang="ts">
import type { Component } from 'vue'

export interface MIconProps {
  /** Icon component to render (e.g. a lucide-vue-next icon). */
  icon: Component
  /** Width and height of the icon in pixels. @default 16 */
  size?: number
  /** Stroke thickness of the icon paths. @default 1.5 */
  strokeWidth?: number
}

const props = withDefaults(defineProps<MIconProps>(), {
  size: 16,
  strokeWidth: 1.5,
})
</script>

<template>
  <component
    :is="props.icon"
    :size="props.size"
    :stroke-width="props.strokeWidth"
    aria-hidden="true"
    v-bind="$attrs"
  />
</template>
