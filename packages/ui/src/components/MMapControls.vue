<script setup lang="ts">
import { Plus, Minus, Maximize2, Layers, ChevronRight } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MTooltip from './MTooltip.vue'
import MIcon from './MIcon.vue'
import type { Component } from 'vue'

export interface MMapControlsLayer {
  id: string
  label: string
  icon: Component
  color?: string
  children?: MMapControlsLayer[]
}

export interface MMapControlsProps {
  /** Selectable map layers, optionally grouped with children. @default [] */
  layers?: MMapControlsLayer[]
  /** Set of layer ids currently toggled on. @default empty Set */
  activeLayers?: Set<string>
  /** Shows the "fit all in view" button when true. @default false */
  showFitAll?: boolean
  /** Shows the pulsing live-data indicator when true. @default false */
  showLiveIndicator?: boolean
}

const props = withDefaults(defineProps<MMapControlsProps>(), {
  layers: () => [],
  activeLayers: () => new Set<string>(),
  showFitAll: false,
  showLiveIndicator: false,
})

const emit = defineEmits<{
  /** Fired when the zoom-in control is clicked. */
  zoomIn: []
  /** Fired when the zoom-out control is clicked. */
  zoomOut: []
  /** Fired when the fit-all control is clicked. */
  fitAll: []
  /** Fired when a layer is toggled; carries the layer id. */
  toggleLayer: [id: string]
}>()

const layersOpen = ref(false)
const expandedGroups = ref<Set<string>>(new Set())

const hasLayers = computed(() => props.layers.length > 0)

function toggleLayers() {
  layersOpen.value = !layersOpen.value
}

function toggleGroup(id: string) {
  const next = new Set(expandedGroups.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedGroups.value = next
}

function isParentActive(layer: MMapControlsLayer): boolean {
  if (!layer.children?.length) return props.activeLayers.has(layer.id)
  return layer.children.some((c) => props.activeLayers.has(c.id))
}

function isParentFullyActive(layer: MMapControlsLayer): boolean {
  if (!layer.children?.length) return props.activeLayers.has(layer.id)
  return layer.children.every((c) => props.activeLayers.has(c.id))
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.m-map-controls__layers-wrap')) {
    layersOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>

<template>
  <div class="m-map-controls" role="group" aria-label="Map controls">
    <div class="m-map-controls__bar fleet-card">
      <!-- Layers -->
      <template v-if="hasLayers">
        <div class="m-map-controls__layers-wrap">
          <MTooltip content="Layers" placement="top">
            <button
              type="button"
              class="m-map-controls__btn"
              :class="{ 'm-map-controls__btn--active': layersOpen || props.activeLayers.size > 0 }"
              aria-label="Toggle map layers"
              @click.stop="toggleLayers"
            >
              <MIcon :icon="Layers" :size="14" />
            </button>
          </MTooltip>

          <Transition name="m-map-layers">
            <div v-if="layersOpen" class="m-map-controls__layers-popup fleet-card" role="menu">
              <template v-for="layer in props.layers" :key="layer.id">
                <!-- Layer with children (group) -->
                <template v-if="layer.children?.length">
                  <div class="m-map-controls__layer-group">
                    <button
                      type="button"
                      class="m-map-controls__layer-item m-map-controls__layer-toggle"
                      :class="{ 'm-map-controls__layer-item--active': isParentActive(layer) }"
                      :aria-pressed="isParentFullyActive(layer)"
                      :title="layer.label"
                      role="menuitemcheckbox"
                      :aria-checked="isParentFullyActive(layer)"
                      @click="emit('toggleLayer', layer.id)"
                    >
                      <MIcon :icon="layer.icon" :size="13" />
                      <span class="m-map-controls__layer-label">{{ layer.label }}</span>
                    </button>
                    <button
                      type="button"
                      class="m-map-controls__layer-expand"
                      :aria-label="`${expandedGroups.has(layer.id) ? 'Collapse' : 'Expand'} ${layer.label}`"
                      :aria-expanded="expandedGroups.has(layer.id)"
                      @click.stop="toggleGroup(layer.id)"
                    >
                      <MIcon
                        :icon="ChevronRight"
                        :size="11"
                        class="m-map-controls__layer-chevron"
                        :class="{
                          'm-map-controls__layer-chevron--open': expandedGroups.has(layer.id),
                        }"
                      />
                    </button>
                  </div>

                  <!-- Children -->
                  <template v-if="expandedGroups.has(layer.id)">
                    <button
                      v-for="child in layer.children"
                      :key="child.id"
                      type="button"
                      class="m-map-controls__layer-item m-map-controls__layer-item--child"
                      :class="{
                        'm-map-controls__layer-item--active': props.activeLayers.has(child.id),
                      }"
                      :aria-pressed="props.activeLayers.has(child.id)"
                      :title="child.label"
                      role="menuitemcheckbox"
                      :aria-checked="props.activeLayers.has(child.id)"
                      @click="emit('toggleLayer', child.id)"
                    >
                      <span
                        class="m-map-controls__layer-dot"
                        :style="{ backgroundColor: child.color }"
                        aria-hidden="true"
                      />
                      <span>{{ child.label }}</span>
                    </button>
                  </template>
                </template>

                <!-- Simple layer (no children) -->
                <button
                  v-else
                  type="button"
                  class="m-map-controls__layer-item"
                  :class="{
                    'm-map-controls__layer-item--active': props.activeLayers.has(layer.id),
                  }"
                  :aria-pressed="props.activeLayers.has(layer.id)"
                  :title="layer.label"
                  role="menuitemcheckbox"
                  :aria-checked="props.activeLayers.has(layer.id)"
                  @click="emit('toggleLayer', layer.id)"
                >
                  <span
                    v-if="layer.color"
                    class="m-map-controls__layer-dot"
                    :style="{ backgroundColor: layer.color }"
                    aria-hidden="true"
                  />
                  <MIcon v-else :icon="layer.icon" :size="13" />
                  <span>{{ layer.label }}</span>
                </button>
              </template>
            </div>
          </Transition>
        </div>

        <div class="m-map-controls__divider" aria-hidden="true" />
      </template>

      <!-- Zoom in -->
      <MTooltip content="Zoom in" placement="top">
        <button
          type="button"
          class="m-map-controls__btn"
          aria-label="Zoom in"
          @click="emit('zoomIn')"
        >
          <MIcon :icon="Plus" :size="14" />
        </button>
      </MTooltip>

      <div class="m-map-controls__divider" aria-hidden="true" />

      <!-- Zoom out -->
      <MTooltip content="Zoom out" placement="top">
        <button
          type="button"
          class="m-map-controls__btn"
          aria-label="Zoom out"
          @click="emit('zoomOut')"
        >
          <MIcon :icon="Minus" :size="14" />
        </button>
      </MTooltip>

      <!-- Fit all -->
      <template v-if="showFitAll">
        <div class="m-map-controls__divider" aria-hidden="true" />

        <MTooltip content="Fit all" placement="top">
          <button
            type="button"
            class="m-map-controls__btn"
            aria-label="Fit all in view"
            @click="emit('fitAll')"
          >
            <MIcon :icon="Maximize2" :size="13" />
          </button>
        </MTooltip>
      </template>
    </div>

    <!-- Live indicator -->
    <div
      v-if="showLiveIndicator"
      class="m-map-controls__live fleet-card"
      aria-label="Live data indicator"
    >
      <span class="m-map-controls__live-dot" aria-hidden="true" />
      <span class="m-map-controls__live-label font-mono-data">LIVE</span>
    </div>
  </div>
</template>

<style scoped>
.m-map-controls {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.m-map-controls__bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: visible;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--mtv-color-surface-default) 95%, transparent);
}

.m-map-controls__layers-wrap {
  position: relative;
}

.m-map-controls__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
  flex-shrink: 0;
}

.m-map-controls__btn:hover {
  background: oklch(1 0 0 / 0.06);
  color: var(--mtv-color-foreground-default);
}

.m-map-controls__bar > :first-child .m-map-controls__btn,
.m-map-controls__bar > .m-map-controls__layers-wrap:first-child .m-map-controls__btn {
  border-radius: var(--card-radius, 8px) 0 0 var(--card-radius, 8px);
}

.m-map-controls__bar > :last-child > .m-map-controls__btn,
.m-map-controls__bar > .m-map-controls__btn:last-child {
  border-radius: 0 var(--card-radius, 8px) var(--card-radius, 8px) 0;
}

.m-map-controls__btn:focus-visible {
  outline: 2px solid var(--mtv-color-brand-default);
  outline-offset: -2px;
}

.m-map-controls__btn--active {
  color: var(--mtv-color-brand-default);
}

.m-map-controls__divider {
  width: 1px;
  height: 16px;
  background: var(--mtv-color-border-default);
  flex-shrink: 0;
}

/* Layers popup */
.m-map-controls__layers-popup {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 160px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--mtv-color-surface-default) 97%, transparent);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.m-map-controls__layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--mtv-color-foreground-muted);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 120ms ease,
    color 120ms ease;
  text-align: left;
}

.m-map-controls__layer-item:hover {
  background: oklch(1 0 0 / 0.06);
  color: var(--mtv-color-foreground-default);
}

.m-map-controls__layer-item--active {
  color: var(--mtv-color-brand-default);
}

.m-map-controls__layers-popup > * + * {
  border-top: 1px solid var(--mtv-color-border-default);
}

/* Group row: toggle button + expand button as siblings */
.m-map-controls__layer-group {
  display: flex;
  align-items: center;
}

.m-map-controls__layer-toggle {
  flex: 1;
  min-width: 0;
  padding-right: 4px;
}

.m-map-controls__layer-group .m-map-controls__layer-expand {
  margin-right: 6px;
}

/* Child layer items */
.m-map-controls__layer-item--child {
  padding-left: 24px;
}

.m-map-controls__layer-label {
  flex: 1;
}

/* Color dot swatch */
.m-map-controls__layer-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Expand/collapse chevron button */
.m-map-controls__layer-expand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: auto;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--mtv-color-foreground-subtle);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 120ms ease;
}

.m-map-controls__layer-expand:hover {
  background: oklch(1 0 0 / 0.08);
}

.m-map-controls__layer-chevron {
  transition: transform 150ms ease;
}

.m-map-controls__layer-chevron--open {
  transform: rotate(90deg);
}

/* Layers popup transition */
.m-map-layers-enter-active,
.m-map-layers-leave-active {
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}

.m-map-layers-enter-from,
.m-map-layers-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

/* Live indicator */
.m-map-controls__live {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.625rem;
  height: 32px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--mtv-color-surface-default) 95%, transparent);
}

.m-map-controls__live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: oklch(0.8 0.182 151.7);
  animation: m-map-live-pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes m-map-live-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

.m-map-controls__live-label {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-looser);
  color: var(--mtv-color-foreground-subtle);
}

@media (prefers-reduced-motion: reduce) {
  .m-map-controls__live-dot {
    animation: none;
  }
}
</style>
