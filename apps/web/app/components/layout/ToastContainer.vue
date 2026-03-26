<script setup lang="ts">
import { MToast } from '@motive/ui'
import { useToast } from '~/composables/useToast'

type Position =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

const props = withDefaults(defineProps<{ position?: Position }>(), {
  position: 'top-right',
})

const { toasts, dismissToast } = useToast()

const containerStyle = computed(() => {
  const [v, h] = props.position.split('-')
  const style: Record<string, string> = {}
  if (v === 'top') style.top = '1.5rem'
  else style.bottom = '1.5rem'
  if (h === 'right') style.right = '1.5rem'
  else if (h === 'left') style.left = '1.5rem'
  else {
    style.left = '50%'
    style.transform = 'translateX(-50%)'
  }
  return style
})

const listStyle = computed(() => {
  const [v, h] = props.position.split('-')
  return {
    flexDirection: v === 'top' ? 'column' : 'column-reverse',
    alignItems: h === 'right' ? 'flex-end' : h === 'left' ? 'flex-start' : 'center',
  }
})

const transitionName = computed(() => {
  const [, h] = props.position.split('-')
  if (h === 'right') return 'toast-right'
  if (h === 'left') return 'toast-left'
  return 'toast-center'
})
</script>

<template>
  <Teleport to="body">
    <div
      class="toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="off"
      :style="containerStyle"
    >
      <TransitionGroup
        :name="transitionName"
        tag="div"
        class="toast-container__list"
        :style="listStyle"
      >
        <MToast
          v-for="toast in toasts"
          :key="toast.id"
          :message="toast.message"
          :subtext="toast.subtext"
          :variant="toast.variant"
          :duration="toast.duration"
          :dismissible="toast.dismissible"
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
  z-index: 9999;
  pointer-events: none;
}

.toast-container__list {
  display: flex;
  gap: 0.5rem;
}

/* ── Right-side: slide in from right ── */
.toast-right-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-right-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}
.toast-right-enter-from {
  opacity: 0;
  transform: translateX(28px) scale(0.93);
}
.toast-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.toast-right-move {
  transition: transform 0.25s ease;
}

/* ── Left-side: slide in from left ── */
.toast-left-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-left-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}
.toast-left-enter-from {
  opacity: 0;
  transform: translateX(-28px) scale(0.93);
}
.toast-left-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
.toast-left-move {
  transition: transform 0.25s ease;
}

/* ── Center: slide in from top ── */
.toast-center-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-center-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}
.toast-center-enter-from {
  opacity: 0;
  transform: translateY(-14px) scale(0.93);
}
.toast-center-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-center-move {
  transition: transform 0.25s ease;
}
</style>
