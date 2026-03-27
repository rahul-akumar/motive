<script setup lang="ts">
import { watch, nextTick, ref } from 'vue'

const FOCUSABLE_SEL = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface MModalProps {
  open: boolean
  maxWidth?: string
  /** Accessible name for the dialog. Use ariaLabel for a string or ariaLabelledby to reference a heading element inside the modal. */
  ariaLabel?: string
  ariaLabelledby?: string
}

const props = withDefaults(defineProps<MModalProps>(), {
  maxWidth: '520px',
})

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

watch(
  () => props.open,
  async (val) => {
    if (val) {
      previouslyFocused = document.activeElement as HTMLElement
      await nextTick()
      const focusable = panelRef.value?.querySelectorAll<HTMLElement>(FOCUSABLE_SEL)
      focusable?.[0]?.focus()
    } else {
      await nextTick()
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  },
)

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}

function handlePanelKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  if (e.key !== 'Tab') return

  const focusable = Array.from(panelRef.value?.querySelectorAll<HTMLElement>(FOCUSABLE_SEL) ?? [])
  if (focusable.length === 0) {
    e.preventDefault()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="m-modal-backdrop" @click="handleBackdropClick">
        <div
          ref="panelRef"
          class="m-modal-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :style="{ maxWidth: maxWidth }"
          @keydown="handlePanelKeydown"
        >
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
