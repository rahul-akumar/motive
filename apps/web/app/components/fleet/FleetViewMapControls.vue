<script setup lang="ts">
import { Plus, Minus, Maximize2, Layers } from 'lucide-vue-next'
import { Gauge, AlertTriangle, Globe } from 'lucide-vue-next'
import { MTooltip } from '@motive/ui'
import type { OverlayDef } from '~/composables/useTomTomOverlays'

const props = defineProps<{
  overlays: OverlayDef[]
  activeIds: Set<string>
}>()

const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
  fitAll: []
  toggle: [id: string]
}>()

const ICONS: Record<string, unknown> = { Gauge, AlertTriangle, Globe }
function iconComponent(name: string) {
  return ICONS[name]
}

const layersOpen = ref(false)

function toggleLayers() {
  layersOpen.value = !layersOpen.value
}

// Close dropdown when clicking outside
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.fv-controls__layers-wrap')) {
    layersOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>

<template>
  <div class="fv-controls" role="group" aria-label="Map controls">
    <!-- Main control bar -->
    <div class="fv-controls__bar fleet-card">
      <!-- Layers button with popup -->
      <div class="fv-controls__layers-wrap">
        <MTooltip content="Layers" placement="top">
          <button
            type="button"
            class="fv-controls__btn fv-controls__btn--layers"
            :class="{ 'fv-controls__btn--active': layersOpen || props.activeIds.size > 0 }"
            aria-label="Toggle map layers"
            @click.stop="toggleLayers"
          >
            <Layers :size="14" aria-hidden="true" />
          </button>
        </MTooltip>

        <!-- Layers dropdown (opens upward) -->
        <Transition name="fv-layers">
          <div v-if="layersOpen" class="fv-controls__layers-popup fleet-card" role="menu">
            <button
              v-for="overlay in props.overlays"
              :key="overlay.id"
              type="button"
              class="fv-controls__layer-item"
              :class="{ 'fv-controls__layer-item--active': props.activeIds.has(overlay.id) }"
              :aria-pressed="props.activeIds.has(overlay.id)"
              :title="overlay.label"
              role="menuitemcheckbox"
              :aria-checked="props.activeIds.has(overlay.id)"
              @click="emit('toggle', overlay.id)"
            >
              <component :is="iconComponent(overlay.icon)" :size="13" aria-hidden="true" />
              <span>{{ overlay.label }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <div class="fv-controls__divider" aria-hidden="true" />

      <!-- Zoom in -->
      <MTooltip content="Zoom in" placement="top">
        <button type="button" class="fv-controls__btn" aria-label="Zoom in" @click="emit('zoomIn')">
          <Plus :size="14" aria-hidden="true" />
        </button>
      </MTooltip>

      <div class="fv-controls__divider" aria-hidden="true" />

      <!-- Zoom out -->
      <MTooltip content="Zoom out" placement="top">
        <button
          type="button"
          class="fv-controls__btn"
          aria-label="Zoom out"
          @click="emit('zoomOut')"
        >
          <Minus :size="14" aria-hidden="true" />
        </button>
      </MTooltip>

      <div class="fv-controls__divider" aria-hidden="true" />

      <!-- Fit all trucks -->
      <MTooltip content="Fit all" placement="top">
        <button
          type="button"
          class="fv-controls__btn"
          aria-label="Fit all trucks in view"
          @click="emit('fitAll')"
        >
          <Maximize2 :size="13" aria-hidden="true" />
        </button>
      </MTooltip>
    </div>

    <!-- Live indicator -->
    <div class="fv-controls__live fleet-card" aria-label="Live data indicator">
      <span class="fv-controls__live-dot" aria-hidden="true" />
      <span class="fv-controls__live-label font-mono-data">LIVE</span>
    </div>
  </div>
</template>

<style scoped>
.fv-controls {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.fv-controls__bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: visible;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--bg-card) 95%, transparent);
}

.fv-controls__layers-wrap {
  position: relative;
}

.fv-controls__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
  flex-shrink: 0;
}

.fv-controls__btn--layers {
  width: 32px;
}

.fv-controls__btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.fv-controls__btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.fv-controls__btn--active {
  color: var(--accent, #4ade80);
}

.fv-controls__divider {
  width: 1px;
  height: 16px;
  background: var(--border);
  flex-shrink: 0;
}

/* Layers popup */
.fv-controls__layers-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 140px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--bg-card) 97%, transparent);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fv-controls__layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: 'Barlow', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 120ms ease,
    color 120ms ease;
  text-align: left;
}

.fv-controls__layer-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.fv-controls__layer-item--active {
  color: var(--accent, #4ade80);
}

.fv-controls__layer-item + .fv-controls__layer-item {
  border-top: 1px solid var(--border);
}

/* Layers popup transition */
.fv-layers-enter-active,
.fv-layers-leave-active {
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}

.fv-layers-enter-from,
.fv-layers-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

/* Live indicator */
.fv-controls__live {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.625rem;
  height: 32px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--bg-card) 95%, transparent);
}

.fv-controls__live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #4ade80;
  animation: fv-live-pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes fv-live-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.fv-controls__live-label {
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

@media (prefers-reduced-motion: reduce) {
  .fv-controls__live-dot {
    animation: none;
  }
}
</style>
