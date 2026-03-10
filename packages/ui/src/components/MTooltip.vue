<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

export interface MTooltipProps {
  content: string
  placement?: 'right' | 'top' | 'bottom' | 'left'
  arrow?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<MTooltipProps>(), {
  placement: 'right',
  arrow: true,
  disabled: false,
})

const visible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({ opacity: '0' })

// Arrow size in px — must match the CSS border-width below
const ARROW = 5
const GAP = 8

function getAnchorRect(): DOMRect | null {
  if (!wrapperRef.value) return null
  const el = (wrapperRef.value.firstElementChild as HTMLElement) ?? wrapperRef.value
  return el.getBoundingClientRect()
}

watch(visible, async (val) => {
  if (!val) return
  await nextTick()
  const r = getAnchorRect()
  if (!r || !tooltipRef.value) return

  const tw = tooltipRef.value.offsetWidth
  const th = tooltipRef.value.offsetHeight
  const arrowOffset = props.arrow ? ARROW : 0

  switch (props.placement) {
    case 'right':
      tooltipStyle.value = {
        left: `${r.right + GAP + arrowOffset}px`,
        top: `${r.top + r.height / 2 - th / 2}px`,
      }
      break
    case 'left':
      tooltipStyle.value = {
        left: `${r.left - GAP - arrowOffset - tw}px`,
        top: `${r.top + r.height / 2 - th / 2}px`,
      }
      break
    case 'top':
      tooltipStyle.value = {
        left: `${r.left + r.width / 2 - tw / 2}px`,
        top: `${r.top - GAP - arrowOffset - th}px`,
      }
      break
    case 'bottom':
      tooltipStyle.value = {
        left: `${r.left + r.width / 2 - tw / 2}px`,
        top: `${r.bottom + GAP + arrowOffset}px`,
      }
      break
  }
})

function show() {
  if (props.disabled) return
  tooltipStyle.value = { opacity: '0' }
  visible.value = true
}

function hide() {
  visible.value = false
}
</script>

<template>
  <div ref="wrapperRef" class="m-tooltip-wrapper" @mouseenter="show" @mouseleave="hide">
    <slot />
    <Teleport to="body">
      <div
        v-if="visible"
        ref="tooltipRef"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 120, ease: 'easeOut' } }"
        :class="['m-tooltip', `m-tooltip--${placement}`, { 'm-tooltip--arrow': arrow }]"
        :style="tooltipStyle"
        role="tooltip"
      >
        {{ content }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.m-tooltip-wrapper {
  display: contents;
}

.m-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  white-space: nowrap;
  /* High-contrast: white bg, dark text — reads clearly on any dark map/surface */
  background: #ffffff;
  color: #111111;
  font-size: 0.6875rem;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

/* ── Arrow via ::before pseudo-element ── */
.m-tooltip--arrow::before {
  content: '';
  position: absolute;
  border: 5px solid transparent;
}

/* right: arrow points left, sits on the left edge */
.m-tooltip--arrow.m-tooltip--right::before {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: #ffffff;
}

/* left: arrow points right, sits on the right edge */
.m-tooltip--arrow.m-tooltip--left::before {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: #ffffff;
}

/* top: arrow points down, sits on the bottom edge */
.m-tooltip--arrow.m-tooltip--top::before {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: #ffffff;
}

/* bottom: arrow points up, sits on the top edge */
.m-tooltip--arrow.m-tooltip--bottom::before {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: #ffffff;
}
</style>
