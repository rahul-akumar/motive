<script setup lang="ts">
import { Plus, Minus, Maximize2 } from 'lucide-vue-next'

const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
  fitAll: []
}>()
</script>

<template>
  <div class="fv-controls" role="group" aria-label="Map controls">
    <!-- Zoom controls -->
    <div class="fv-controls__group fleet-card">
      <button type="button" class="fv-controls__btn" aria-label="Zoom in" @click="emit('zoomIn')">
        <Plus :size="14" aria-hidden="true" />
      </button>
      <div class="fv-controls__divider" aria-hidden="true" />
      <button type="button" class="fv-controls__btn" aria-label="Zoom out" @click="emit('zoomOut')">
        <Minus :size="14" aria-hidden="true" />
      </button>
    </div>

    <!-- Fit all trucks -->
    <div class="fv-controls__group fleet-card">
      <button
        type="button"
        class="fv-controls__btn"
        aria-label="Fit all trucks in view"
        title="Fit all trucks"
        @click="emit('fitAll')"
      >
        <Maximize2 :size="13" aria-hidden="true" />
      </button>
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
  right: 1rem;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.fv-controls__group {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: color-mix(in srgb, var(--bg-card) 95%, transparent);
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
}

.fv-controls__btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.fv-controls__btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.fv-controls__divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

/* Live indicator */
.fv-controls__live {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.625rem;
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
