<script setup lang="ts">
import { Gauge, AlertTriangle, Globe } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import type { Component } from 'vue'
import type { OverlayDef } from '~/composables/useTomTomOverlays'

const props = defineProps<{
  overlays: OverlayDef[]
  activeIds: Set<string>
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()

const ICONS: Record<string, Component> = { Gauge, AlertTriangle, Globe }

function iconComponent(name: string): Component {
  return ICONS[name] ?? Gauge
}
</script>

<template>
  <div class="fv-overlay-ctrl" role="group" aria-label="Map overlay controls">
    <button
      v-for="overlay in props.overlays"
      :key="overlay.id"
      class="fv-overlay-ctrl__btn"
      :class="{ 'fv-overlay-ctrl__btn--active': props.activeIds.has(overlay.id) }"
      :aria-pressed="props.activeIds.has(overlay.id)"
      :title="overlay.label"
      @click="emit('toggle', overlay.id)"
    >
      <MIcon :icon="iconComponent(overlay.icon)" :size="16" class="fv-overlay-ctrl__icon" />
      <span class="fv-overlay-ctrl__label">{{ overlay.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.fv-overlay-ctrl {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: row;
  gap: 4px;
}

.fv-overlay-ctrl__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  background: var(--bg-elevated, rgba(20, 20, 20, 0.92));
  border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
  border-radius: 4px;
  color: var(--text-secondary, #8a8a8a);
  font-family: 'Barlow', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
  white-space: nowrap;
}

.fv-overlay-ctrl__btn:hover {
  background: var(--bg-elevated-hover, rgba(40, 40, 40, 0.95));
  color: var(--text-primary, #e2e2e2);
  border-color: var(--border-strong, rgba(255, 255, 255, 0.2));
}

.fv-overlay-ctrl__btn--active {
  background: var(--accent, #4ade80);
  border-color: var(--accent, #4ade80);
  color: #000;
}

.fv-overlay-ctrl__btn--active:hover {
  background: var(--accent-hover, #22c55e);
  border-color: var(--accent-hover, #22c55e);
  color: #000;
}

.fv-overlay-ctrl__icon {
  flex-shrink: 0;
}

.fv-overlay-ctrl__label {
  line-height: 1;
}
</style>
