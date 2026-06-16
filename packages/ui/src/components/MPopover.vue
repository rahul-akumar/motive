<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

export interface MPopoverProps {
  /** Controls whether the popover is shown. */
  open: boolean
  /** Element the popover is positioned relative to. */
  anchorEl?: HTMLElement | null
  /** Preferred placement relative to the anchor; flips if it would overflow. @default 'top' */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** Renders a pointing arrow toward the anchor. @default true */
  arrow?: boolean
  /** Gap in pixels between the anchor and the popover. @default 8 */
  offset?: number
  /** Maximum width of the popover (any CSS length). @default 'none' */
  maxWidth?: string
  /** When true, the popover stays open on click-outside. @default false */
  persistent?: boolean
  /** Accessible label for the popover when no visible title is referenced. */
  ariaLabel?: string
  /** ID of an element that labels the popover for assistive tech. */
  ariaLabelledby?: string
}

const props = withDefaults(defineProps<MPopoverProps>(), {
  placement: 'top',
  arrow: true,
  offset: 8,
  maxWidth: 'none',
  persistent: false,
})

const emit = defineEmits<{
  /** Fired when the popover requests to open or close. */
  'update:open': [value: boolean]
}>()

const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({})
const currentPlacement = ref(props.placement)

const ARROW_SIZE = 6

let previousFocus: HTMLElement | null = null

function positionPopover() {
  if (!props.anchorEl || !popoverRef.value) return

  const rect = props.anchorEl.getBoundingClientRect()
  const pw = popoverRef.value.offsetWidth
  const ph = popoverRef.value.offsetHeight
  const arrowOffset = props.arrow ? ARROW_SIZE : 0
  const gap = props.offset + arrowOffset

  const vh = window.innerHeight
  const vw = window.innerWidth
  const margin = 8

  let left = 0
  let top = 0
  let resolvedPlacement = props.placement

  switch (props.placement) {
    case 'top':
      left = rect.left + rect.width / 2 - pw / 2
      top = rect.top - gap - ph
      if (top < margin) {
        resolvedPlacement = 'bottom'
        top = rect.bottom + gap
      }
      break
    case 'bottom':
      left = rect.left + rect.width / 2 - pw / 2
      top = rect.bottom + gap
      if (top + ph > vh - margin) {
        resolvedPlacement = 'top'
        top = rect.top - gap - ph
      }
      break
    case 'left':
      left = rect.left - gap - pw
      top = rect.top + rect.height / 2 - ph / 2
      if (left < margin) {
        resolvedPlacement = 'right'
        left = rect.right + gap
      }
      break
    case 'right':
      left = rect.right + gap
      top = rect.top + rect.height / 2 - ph / 2
      if (left + pw > vw - margin) {
        resolvedPlacement = 'left'
        left = rect.left - gap - pw
      }
      break
  }

  // Clamp to viewport
  left = Math.max(margin, Math.min(left, vw - pw - margin))
  top = Math.max(margin, Math.min(top, vh - ph - margin))

  currentPlacement.value = resolvedPlacement
  popoverStyle.value = { top: `${top}px`, left: `${left}px` }
}

watch(
  () => props.open,
  async (val) => {
    if (!val) {
      if (previousFocus) {
        previousFocus.focus()
        previousFocus = null
      }
      return
    }
    previousFocus = document.activeElement as HTMLElement | null
    await nextTick()
    positionPopover()
    await nextTick()
    const firstFocusable = popoverRef.value?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()
  },
)

function reposition() {
  if (props.open) positionPopover()
}

function handleClickOutside(e: MouseEvent) {
  if (!props.open || props.persistent) return
  const target = e.target as Node
  if (
    (!popoverRef.value || !popoverRef.value.contains(target)) &&
    (!props.anchorEl || !props.anchorEl.contains(target))
  ) {
    emit('update:open', false)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    emit('update:open', false)
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

defineExpose({ reposition })
</script>

<template>
  <Teleport to="body">
    <Transition name="m-popover">
      <div
        v-if="open"
        ref="popoverRef"
        :class="['m-popover', `m-popover--${currentPlacement}`, { 'm-popover--arrow': arrow }]"
        :style="[popoverStyle, maxWidth !== 'none' ? { maxWidth } : {}]"
        role="dialog"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.m-popover {
  position: fixed;
  z-index: 9999;
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 8px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.25),
    0 1px 4px rgba(0, 0, 0, 0.15);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}

/* ── Arrow via ::before pseudo-element ── */
.m-popover--arrow::before {
  content: '';
  position: absolute;
  border: 6px solid transparent;
}

/* top: arrow points down, sits on the bottom edge */
.m-popover--arrow.m-popover--top::before {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--mtv-color-surface-raised);
}

/* bottom: arrow points up, sits on the top edge */
.m-popover--arrow.m-popover--bottom::before {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--mtv-color-surface-raised);
}

/* left: arrow points right, sits on the right edge */
.m-popover--arrow.m-popover--left::before {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--mtv-color-surface-raised);
}

/* right: arrow points left, sits on the left edge */
.m-popover--arrow.m-popover--right::before {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--mtv-color-surface-raised);
}

/* ── Transitions ── */
.m-popover-enter-active,
.m-popover-leave-active {
  transition:
    opacity 120ms ease-out,
    transform 120ms ease-out;
}

.m-popover-enter-from,
.m-popover-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(4px);
}
</style>
