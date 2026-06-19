<script setup lang="ts">
import type { Component } from 'vue'
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import MIcon from './MIcon.vue'

export interface MInputProps {
  /** Current value of the input. @default '' */
  modelValue?: string
  /** Native input type. @default 'text' */
  type?: 'text' | 'search' | 'email' | 'password' | 'tel' | 'url' | 'number'
  /** Placeholder text shown when empty. @default '' */
  placeholder?: string
  /** Height/padding scale. @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Leading icon component (e.g. a lucide-vue-next icon), rendered via MIcon. */
  leadingIcon?: Component
  /** Shows a clear (✕) button when there is a value. @default false */
  clearable?: boolean
  /** Disables interaction with the input. @default false */
  disabled?: boolean
  /** Marks the field as read-only. @default false */
  readonly?: boolean
  /** Renders the invalid/error state styling. @default false */
  invalid?: boolean
}

withDefaults(defineProps<MInputProps>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  size: 'md',
  clearable: false,
  disabled: false,
  readonly: false,
  invalid: false,
})

const emit = defineEmits<{
  /** Fired on input as the value changes. */
  'update:modelValue': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

// Icon scales gently with the control size.
const ICON_SIZE: Record<NonNullable<MInputProps['size']>, number> = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
}

function clear() {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}
</script>

<template>
  <div
    class="m-input-wrap"
    :class="[
      `m-input-wrap--${size}`,
      { 'm-input-wrap--disabled': disabled, 'm-input-wrap--invalid': invalid },
    ]"
  >
    <MIcon
      v-if="leadingIcon"
      :icon="leadingIcon"
      :size="ICON_SIZE[size]"
      class="m-input__leading"
    />
    <input
      ref="inputRef"
      :class="[
        'm-input',
        `m-input--${size}`,
        {
          'm-input--invalid': invalid,
          'm-input--has-leading': leadingIcon,
          'm-input--has-clear': clearable && modelValue && !disabled,
        },
      ]"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="invalid || undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="clearable && modelValue && !disabled"
      type="button"
      class="m-input__clear"
      aria-label="Clear"
      tabindex="-1"
      @click="clear"
      @mousedown.prevent
    >
      <MIcon :icon="X" :size="ICON_SIZE[size]" :stroke-width="2.5" />
    </button>
  </div>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.m-input-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.m-input {
  @apply w-full font-normal;
  color: var(--mtv-color-foreground-default);
  background: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--radius);
  outline: none;
  transition:
    border-color var(--mtv-duration-fast) var(--mtv-ease-standard),
    box-shadow var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.m-input::placeholder {
  color: var(--mtv-color-foreground-muted);
}

/* Active/focus: a 1px brand border, matching MSelect's open trigger (no ring). */
.m-input:focus {
  border-color: var(--mtv-color-brand-default);
}

.m-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.m-input:read-only {
  color: var(--mtv-color-foreground-muted);
}

.m-input--invalid,
.m-input--invalid:focus {
  border-color: var(--mtv-color-status-critical);
}

/* Size scale — fixed heights matching MSelect's trigger (sm 32 / md 36) so the
   two controls line up when used side by side. Horizontal padding only. */
.m-input--xs {
  height: 28px;
  padding: 0 0.5rem;
  font-size: var(--font-size-xs);
}

.m-input--sm {
  height: 32px;
  padding: 0 0.625rem;
  font-size: var(--font-size-sm);
}

.m-input--md {
  height: 36px;
  padding: 0 0.75rem;
  font-size: var(--font-size-base);
}

.m-input--lg {
  height: 40px;
  padding: 0 0.875rem;
  font-size: var(--font-size-md);
}

/* Reserve room for the leading icon / clear button */
.m-input--has-leading.m-input--xs,
.m-input--has-leading.m-input--sm {
  padding-left: 1.625rem;
}

.m-input--has-leading.m-input--md,
.m-input--has-leading.m-input--lg {
  padding-left: 1.875rem;
}

.m-input--has-clear.m-input--xs,
.m-input--has-clear.m-input--sm {
  padding-right: 1.625rem;
}

.m-input--has-clear.m-input--md,
.m-input--has-clear.m-input--lg {
  padding-right: 1.875rem;
}

/* Leading icon (decorative — does not intercept clicks) */
.m-input__leading {
  position: absolute;
  left: 0.625rem;
  color: var(--mtv-color-foreground-subtle);
  pointer-events: none;
}

.m-input-wrap--disabled .m-input__leading {
  opacity: 0.5;
}

/* Clear button */
.m-input__clear {
  position: absolute;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  transition: color var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.m-input__clear:hover {
  color: var(--mtv-color-foreground-default);
}
</style>
