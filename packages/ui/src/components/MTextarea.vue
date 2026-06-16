<script setup lang="ts">
export interface MTextareaProps {
  /** Current text value of the textarea. @default '' */
  modelValue?: string
  /** Placeholder text shown when empty. @default '' */
  placeholder?: string
  /** Number of visible text rows. @default 3 */
  rows?: number
  /** Disables interaction with the textarea. @default false */
  disabled?: boolean
  /** Directions in which the user can resize the textarea. @default 'none' */
  resize?: 'none' | 'vertical' | 'both'
}

withDefaults(defineProps<MTextareaProps>(), {
  modelValue: '',
  placeholder: '',
  rows: 3,
  disabled: false,
  resize: 'none',
})

defineEmits<{
  /** Fired on input as the text value changes. */
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea
    :class="['m-textarea', `m-textarea--resize-${resize}`]"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.m-textarea {
  @apply w-full rounded text-sm font-normal transition-colors;
  padding: 0.5rem 0.625rem;
  color: var(--mtv-color-foreground-default);
  background: var(--mtv-color-background-card);
  border: 1px solid var(--mtv-color-border-default);
  outline: none;
}

.m-textarea::placeholder {
  color: var(--mtv-color-foreground-muted);
}

.m-textarea:focus {
  border-color: var(--mtv-color-brand-default);
  box-shadow: 0 0 0 1px var(--mtv-color-brand-default);
}

.m-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.m-textarea--resize-none {
  resize: none;
}

.m-textarea--resize-vertical {
  resize: vertical;
}

.m-textarea--resize-both {
  resize: both;
}
</style>
