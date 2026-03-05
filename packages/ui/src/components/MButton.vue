<script setup lang="ts">
export interface MButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<MButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :class="[
      'm-button',
      `m-button--${variant}`,
      `m-button--${size}`,
      { 'm-button--loading': loading },
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="m-button__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.m-button {
  @apply inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50;
}

/* Sizes */
.m-button--sm {
  @apply h-8 px-3 text-sm;
}

.m-button--md {
  @apply h-10 px-4 text-sm;
}

.m-button--lg {
  @apply h-12 px-6 text-base;
}

/* Variants */
.m-button--primary {
  @apply bg-motive-primary text-white hover:bg-motive-primary/90 focus-visible:ring-motive-primary;
}

.m-button--secondary {
  @apply bg-motive-secondary text-white hover:bg-motive-secondary/90 focus-visible:ring-motive-secondary;
}

.m-button--outline {
  @apply border border-motive-border bg-transparent hover:bg-motive-muted focus-visible:ring-motive-primary;
}

.m-button--ghost {
  @apply bg-transparent hover:bg-motive-muted focus-visible:ring-motive-primary;
}

.m-button--danger {
  @apply bg-motive-danger text-white hover:bg-motive-danger/90 focus-visible:ring-motive-danger;
}

/* Loading spinner */
.m-button__spinner {
  @apply h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent;
}

.m-button--loading {
  @apply cursor-wait;
}
</style>
