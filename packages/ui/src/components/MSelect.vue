<script setup lang="ts" generic="T extends string | number">
import { ChevronDown, Check } from 'lucide-vue-next'

export interface MSelectOption<V extends string | number = string | number> {
  label: string
  value: V
  disabled?: boolean
}

export interface MSelectProps<V extends string | number = string | number> {
  modelValue: V
  options: MSelectOption<V>[]
  placeholder?: string
  size?: 'sm' | 'md'
  disabled?: boolean
  /** Accessible label — required if no visible label surrounds the component */
  ariaLabel?: string
}

const props = withDefaults(defineProps<MSelectProps<T>>(), {
  size: 'sm',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const open = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const listboxRef = ref<HTMLUListElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

const selectedOption = computed(
  () => props.options.find((o) => o.value === props.modelValue) ?? null,
)

// ── Positioning ──────────────────────────────────────────
async function openMenu() {
  if (props.disabled) return
  open.value = true
  await nextTick()
  positionMenu()
  // Focus first matching option
  const listEl = listboxRef.value
  if (listEl) {
    const active =
      listEl.querySelector<HTMLElement>('[aria-selected="true"]') ??
      listEl.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])')
    active?.focus()
  }
}

function positionMenu() {
  if (!triggerRef.value || !listboxRef.value) return
  const trigger = triggerRef.value.getBoundingClientRect()
  const list = listboxRef.value

  const vw = window.innerWidth
  const vh = window.innerHeight
  const lw = list.offsetWidth || 180
  const lh = list.offsetHeight || 200

  // Default: drop down, align left
  let top = trigger.bottom + 4
  let left = trigger.left

  // Flip up if not enough space below
  if (top + lh > vh - 8) top = trigger.top - lh - 4

  // Shift left if overflowing right edge
  if (left + lw > vw - 8) left = Math.max(8, vw - lw - 8)

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${trigger.width}px`,
  }
}

function selectOption(value: T) {
  emit('update:modelValue', value)
  open.value = false
  triggerRef.value?.focus()
}

function handleTriggerKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
    e.preventDefault()
    openMenu()
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function handleOptionKeydown(e: KeyboardEvent, value: T, index: number) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    selectOption(value)
  } else if (e.key === 'Escape') {
    open.value = false
    triggerRef.value?.focus()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusOption(index + 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (index === 0) {
      open.value = false
      triggerRef.value?.focus()
      return
    }
    focusOption(index - 1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    focusOption(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    focusOption(props.options.length - 1)
  }
}

function focusOption(index: number) {
  const list = listboxRef.value
  if (!list) return
  const items = list.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])')
  const clamped = Math.max(0, Math.min(items.length - 1, index))
  items[clamped]?.focus()
}

// Close on outside click or scroll
function handleClickOutside(e: MouseEvent) {
  if (
    triggerRef.value &&
    !triggerRef.value.contains(e.target as Node) &&
    listboxRef.value &&
    !listboxRef.value.contains(e.target as Node)
  ) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

// ── Trigger width animation on value change ──────────────
watch(
  selectedOption,
  async () => {
    const el = triggerRef.value
    if (!el) return

    // Capture current rendered width before Vue updates the label
    const fromWidth = el.offsetWidth

    await nextTick()

    const toWidth = el.offsetWidth
    if (fromWidth === toWidth) return

    // FLIP: disable transition, jump to old width, force reflow, then animate to new
    el.style.transition = 'none'
    el.style.width = `${fromWidth}px`
    el.getBoundingClientRect() // flush layout so browser registers fromWidth
    el.style.transition = ''
    el.style.width = `${toWidth}px`

    setTimeout(() => {
      el.style.width = ''
    }, 180)
  },
  { flush: 'pre' },
)
</script>

<template>
  <div class="m-select" :class="{ 'm-select--open': open, 'm-select--disabled': disabled }">
    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      role="combobox"
      :class="['m-select__trigger', `m-select__trigger--${size}`]"
      :aria-expanded="open"
      :aria-haspopup="'listbox'"
      :aria-label="ariaLabel"
      :aria-disabled="disabled || undefined"
      :disabled="disabled"
      @click="open ? (open = false) : openMenu()"
      @keydown="handleTriggerKeydown"
    >
      <span class="m-select__value" :class="{ 'm-select__value--placeholder': !selectedOption }">
        {{ selectedOption?.label ?? placeholder ?? 'Select…' }}
      </span>
      <ChevronDown :size="12" :stroke-width="2.25" class="m-select__chevron" aria-hidden="true" />
    </button>

    <!-- Listbox — teleported to body for correct z-index/overflow stacking -->
    <Teleport to="body">
      <Transition name="m-select-menu">
        <ul
          v-if="open"
          ref="listboxRef"
          role="listbox"
          class="m-select__listbox"
          :style="menuStyle"
          :aria-label="ariaLabel"
        >
          <li
            v-for="(opt, i) in options"
            :key="String(opt.value)"
            role="option"
            :tabindex="opt.disabled ? -1 : 0"
            :aria-selected="opt.value === modelValue"
            :aria-disabled="opt.disabled || undefined"
            :class="[
              'm-select__option',
              {
                'm-select__option--selected': opt.value === modelValue,
                'm-select__option--disabled': opt.disabled,
              },
            ]"
            @click="!opt.disabled && selectOption(opt.value as T)"
            @keydown="!opt.disabled && handleOptionKeydown($event, opt.value as T, i)"
          >
            <span class="m-select__option-label">{{ opt.label }}</span>
            <Check
              v-if="opt.value === modelValue"
              :size="12"
              :stroke-width="2.5"
              class="m-select__option-check"
              aria-hidden="true"
            />
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Container ───────────────────────────────────────────── */
.m-select {
  position: relative;
  display: inline-block;
}

/* ── Trigger ─────────────────────────────────────────────── */
.m-select__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 5px;
  color: var(--mtv-color-foreground-default);
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 120ms ease,
    background-color 120ms ease,
    width 150ms ease;
  outline: none;
  font-size: var(--font-size-sm);
  font-family: inherit;
}

.m-select__trigger--sm {
  height: 32px;
  padding: 0 0.625rem;
}

.m-select__trigger--md {
  height: 36px;
  padding: 0 0.75rem;
}

.m-select__trigger:hover:not(:disabled) {
  border-color: var(--mtv-color-border-strong);
}

.m-select__trigger:focus-visible {
  border-color: var(--mtv-color-brand-default);
  box-shadow: 0 0 0 2px var(--mtv-color-brand-default, oklch(0.6 0.2 260) / 0.25);
}

.m-select--open .m-select__trigger {
  border-color: var(--mtv-color-brand-default);
}

.m-select--disabled .m-select__trigger {
  opacity: 0.45;
  cursor: not-allowed;
}

.m-select__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.m-select__value--placeholder {
  color: var(--mtv-color-foreground-subtle);
}

.m-select__chevron {
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
  transition: transform 150ms ease;
}

.m-select--open .m-select__chevron {
  transform: rotate(180deg);
}

/* ── Listbox ─────────────────────────────────────────────── */
.m-select__listbox {
  position: fixed;
  z-index: 9000;
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  background-color: var(--mtv-color-surface-overlay);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 6px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.22),
    0 1px 4px rgba(0, 0, 0, 0.1);
  outline: none;
  overflow-y: auto;
  max-height: 260px;
}

/* ── Option ──────────────────────────────────────────────── */
.m-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4375rem 0.75rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  outline: none;
  transition:
    background-color 80ms ease,
    color 80ms ease;
  user-select: none;
}

.m-select__option:hover:not(.m-select__option--disabled),
.m-select__option:focus:not(.m-select__option--disabled) {
  background-color: var(--mtv-color-surface-hover);
  color: var(--mtv-color-foreground-default);
}

.m-select__option--selected {
  color: var(--mtv-color-foreground-default);
  font-weight: var(--font-weight-semibold);
}

.m-select__option--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.m-select__option-label {
  flex: 1;
  min-width: 0;
}

.m-select__option-check {
  color: var(--mtv-color-brand-default);
  flex-shrink: 0;
}

/* ── Animation ───────────────────────────────────────────── */
.m-select-menu-enter-active {
  transition:
    opacity 120ms ease,
    transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.m-select-menu-leave-active {
  transition:
    opacity 80ms ease,
    transform 80ms ease;
}

.m-select-menu-enter-from,
.m-select-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
