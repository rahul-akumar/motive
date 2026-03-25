<script setup lang="ts">
import { MToast } from '@motive/ui'
import { useToast } from '~/composables/useToast'

const { toasts, dismissToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" role="region" aria-label="Notifications" aria-live="off">
      <TransitionGroup name="toast" tag="div" class="toast-container__list">
        <MToast
          v-for="toast in toasts"
          :key="toast.id"
          :message="toast.message"
          :subtext="toast.subtext"
          :variant="toast.variant"
          :action-label="toast.actionLabel"
          :on-action="toast.onAction"
          @dismiss="dismissToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-container__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

/* Enter: slide up + scale from slightly below */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Leave: fade + slide right */
.toast-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.94);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

/* Smooth reflow when items are added/removed */
.toast-move {
  transition: transform 0.25s ease;
}
</style>
