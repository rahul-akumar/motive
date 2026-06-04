<script setup lang="ts">
import { watch, nextTick, ref, onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'
import MButton from './MButton.vue'
import MIcon from './MIcon.vue'

const FOCUSABLE_SEL = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export interface MDrawerProps {
  open: boolean
  placement?: 'left' | 'right'
  width?: string
  overlay?: boolean
  /** When true, drawer stays open on click-outside (close only via Escape or close button) */
  persistent?: boolean
  ariaLabel?: string
  ariaLabelledby?: string
}

const props = withDefaults(defineProps<MDrawerProps>(), {
  placement: 'right',
  width: '420px',
  overlay: false,
  persistent: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
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

function close() {
  emit('update:open', false)
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

/** Close on click-outside for non-modal mode */
function handleDocumentMousedown(e: MouseEvent) {
  if (!props.open || props.overlay || props.persistent) return
  if (panelRef.value && !panelRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentMousedown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentMousedown)
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
    return
  }
  // Only trap focus in modal (overlay) mode
  if (!props.overlay || e.key !== 'Tab') return

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
    <!-- Modal mode: backdrop + panel inside -->
    <Transition v-if="overlay" name="m-drawer-backdrop">
      <div v-if="open" class="m-drawer-backdrop" @click="handleBackdropClick">
        <Transition :name="`m-drawer-slide-${placement}`" appear>
          <aside
            v-if="open"
            ref="panelRef"
            :class="['m-drawer', `m-drawer--${placement}`]"
            :style="{ width }"
            role="dialog"
            aria-modal="true"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledby"
            @keydown="handleKeydown"
          >
            <div v-if="$slots.header" class="m-drawer__header">
              <slot name="header" />
              <MButton variant="ghost" size="sm" icon-only aria-label="Close drawer" @click="close">
                <MIcon :icon="X" />
              </MButton>
            </div>

            <div class="m-drawer__body">
              <slot />
            </div>

            <div v-if="$slots.footer" class="m-drawer__footer">
              <slot name="footer" />
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>

    <!-- Non-modal mode: no backdrop, panel only -->
    <Transition v-else :name="`m-drawer-slide-${placement}`">
      <aside
        v-if="open"
        ref="panelRef"
        :class="['m-drawer', `m-drawer--${placement}`]"
        :style="{ width }"
        role="complementary"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        @keydown="handleKeydown"
      >
        <div v-if="$slots.header" class="m-drawer__header">
          <slot name="header" />
          <MButton variant="ghost" size="sm" icon-only aria-label="Close drawer" @click="close">
            <MIcon :icon="X" />
          </MButton>
        </div>

        <div class="m-drawer__body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="m-drawer__footer">
          <slot name="footer" />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop (modal mode only) ──────────────────────────── */
.m-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
}

.m-drawer-backdrop-enter-active,
.m-drawer-backdrop-leave-active {
  transition: opacity 200ms ease;
}

.m-drawer-backdrop-enter-from,
.m-drawer-backdrop-leave-to {
  opacity: 0;
}

/* ── Panel ───────────────────────────────────────────────── */
.m-drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  background-color: var(--mtv-color-surface-default);
  border: 1px solid var(--mtv-color-border-default);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.m-drawer--right {
  right: 0;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  border-right: none;
}

.m-drawer--left {
  left: 0;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  border-left: none;
}

/* ── Header ──────────────────────────────────────────────── */
.m-drawer__header {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
  gap: 0.5rem;
}

/* ── Body ────────────────────────────────────────────────── */
.m-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* ── Footer ──────────────────────────────────────────────── */
.m-drawer__footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

/* ── Slide transitions ───────────────────────────────────── */
.m-drawer-slide-right-enter-active,
.m-drawer-slide-right-leave-active {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.m-drawer-slide-right-enter-from,
.m-drawer-slide-right-leave-to {
  transform: translateX(100%);
}

.m-drawer-slide-left-enter-active,
.m-drawer-slide-left-leave-active {
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.m-drawer-slide-left-enter-from,
.m-drawer-slide-left-leave-to {
  transform: translateX(-100%);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .m-drawer {
    width: 100vw !important;
    border-radius: 0;
  }
}
</style>
