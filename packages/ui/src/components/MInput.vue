<script setup lang="ts">
export interface MInputProps {
  /** Current value of the input. @default '' */
  modelValue?: string
  /** Native input type. @default 'text' */
  type?: 'text' | 'search' | 'email' | 'password' | 'tel' | 'url' | 'number'
  /** Placeholder text shown when empty. @default '' */
  placeholder?: string
  /** Height/padding scale. @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg'
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
  disabled: false,
  readonly: false,
  invalid: false,
})

defineEmits<{
  /** Fired on input as the value changes. */
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :class="['m-input', `m-input--${size}`, { 'm-input--invalid': invalid }]"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :aria-invalid="invalid || undefined"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

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

.m-input:focus {
  border-color: var(--mtv-color-brand-default);
  box-shadow: 0 0 0 1px var(--mtv-color-brand-default);
}

.m-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.m-input:read-only {
  color: var(--mtv-color-foreground-muted);
}

.m-input--invalid {
  border-color: var(--mtv-color-status-critical);
}

.m-input--invalid:focus {
  box-shadow: 0 0 0 1px var(--mtv-color-status-critical);
}

/* Size scale — mirrors MButton's xs/sm/md/lg */
.m-input--xs {
  padding: 0.125rem 0.375rem;
  font-size: var(--font-size-xs);
}

.m-input--sm {
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-sm);
}

.m-input--md {
  padding: 0.375rem 0.625rem;
  font-size: var(--font-size-base);
}

.m-input--lg {
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size-md);
}
</style>
