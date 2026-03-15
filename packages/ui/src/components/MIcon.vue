<script setup lang="ts">
import type { Component } from 'vue'

export interface MIconProps {
  icon: Component
  size?: number
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
