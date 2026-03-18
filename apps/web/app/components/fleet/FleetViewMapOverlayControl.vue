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
  background: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-subtle);
  border-radius: 4px;
  color: var(--mtv-color-foreground-muted);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition:
    background 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
  white-space: nowrap;
}

.fv-overlay-ctrl__btn:hover {
  background: var(--mtv-color-surface-hover);
  color: var(--mtv-color-foreground-default);
  border-color: var(--mtv-color-border-strong);
}

.fv-overlay-ctrl__btn--active {
  background: var(--mtv-color-brand-default);
  border-color: var(--mtv-color-brand-default);
  color: #000;
}

.fv-overlay-ctrl__btn--active:hover {
  background: var(--mtv-color-brand-hover);
  border-color: var(--mtv-color-brand-hover);
  color: #000;
}

.fv-overlay-ctrl__icon {
  flex-shrink: 0;
}

.fv-overlay-ctrl__label {
  line-height: var(--leading-none);
}
</style>
