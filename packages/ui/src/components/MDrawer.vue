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
  /** Controls whether the drawer is shown. */
  open: boolean
  /** Edge of the screen the drawer slides in from. @default 'right' */
  placement?: 'left' | 'right'
  /** Width of the drawer panel (any CSS length). @default '420px' */
  width?: string
  /** Renders a modal backdrop and traps focus when true. @default false */
  overlay?: boolean
  /** When true, drawer stays open on click-outside (close only via Escape or close button) */
  persistent?: boolean
  /** Accessible label for the drawer when no visible title is referenced. */
  ariaLabel?: string
  /** ID of an element that labels the drawer for assistive tech. */
  ariaLabelledby?: string
}

const props = withDefaults(defineProps<MDrawerProps>(), {
  placement: 'right',
  width: '420px',
  overlay: false,
  persistent: false,
})

const emit = defineEmits<{
  /** Fired when the drawer requests to open or close. */
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
  if (!first || !last) return

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

            <div v-if="$slots.subheader" class="m-drawer__subheader">
              <slot name="subheader" />
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

        <div v-if="$slots.subheader" class="m-drawer__subheader">
          <slot name="subheader" />
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
  z-index: var(--mtv-z-drawer);
  background: var(--mtv-color-surface-scrim);
  display: flex;
}

.m-drawer-backdrop-enter-active,
.m-drawer-backdrop-leave-active {
  transition: opacity var(--mtv-duration-base) var(--mtv-ease-standard);
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
  z-index: var(--mtv-z-drawer);
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  background-color: var(--mtv-color-surface-default);
  border: 1px solid var(--mtv-color-border-default);
  box-shadow: var(--mtv-shadow-xl);
  overflow: hidden;
}

.m-drawer--right {
  right: 0;
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: var(--radius);
  border-right: none;
}

.m-drawer--left {
  left: 0;
  border-top-right-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
  border-left: none;
}

/* ── Header ──────────────────────────────────────────────── */
.m-drawer__header {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem 0rem;
  flex-shrink: 0;
  gap: 0.5rem;
}

/* ── Subheader ─────────────────────────────────────────── */
.m-drawer__subheader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
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
  transition: transform var(--mtv-duration-base) var(--mtv-ease-standard);
}

.m-drawer-slide-right-enter-from,
.m-drawer-slide-right-leave-to {
  transform: translateX(100%);
}

.m-drawer-slide-left-enter-active,
.m-drawer-slide-left-leave-active {
  transition: transform var(--mtv-duration-base) var(--mtv-ease-standard);
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
