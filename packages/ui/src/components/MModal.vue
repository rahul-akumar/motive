<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

export interface MModalProps {
  open: boolean
  maxWidth?: string
}

withDefaults(defineProps<MModalProps>(), {
  maxWidth: '520px',
})

const emit = defineEmits<{
  close: []
}>()

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="m-modal-backdrop"
        role="dialog"
        aria-modal="true"
        @click="handleBackdropClick"
      >
        <div class="m-modal-panel" :style="{ maxWidth: maxWidth }">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.m-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.m-modal-panel {
  background-color: var(--mtv-color-surface-default);
  border: 1px solid var(--mtv-color-border-strong);
  border-radius: 2px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 150ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
