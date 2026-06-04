<script setup lang="ts">
export interface MCheckboxProps {
  modelValue?: boolean
  label?: string
  disabled?: boolean
}

withDefaults(defineProps<MCheckboxProps>(), {
  modelValue: false,
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label :class="['m-checkbox', { 'm-checkbox--disabled': disabled }]">
    <input
      type="checkbox"
      class="m-checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span v-if="label" class="m-checkbox__label">{{ label }}</span>
    <slot v-else />
  </label>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.m-checkbox {
  @apply inline-flex items-center gap-1.5 cursor-pointer text-xs;
  color: var(--mtv-color-foreground-muted);
}

.m-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.m-checkbox__input {
  @apply w-3.5 h-3.5 rounded-sm cursor-pointer;
  accent-color: var(--mtv-color-brand-default);
}

.m-checkbox__label {
  user-select: none;
}
</style>
