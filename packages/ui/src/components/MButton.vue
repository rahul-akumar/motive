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
@reference "@motive/tailwind-config/theme.css";

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
  background-color: var(--mtv-color-brand-default);
  color: var(--mtv-color-foreground-on-accent);
  --tw-ring-color: var(--mtv-color-brand-ring);
}
.m-button--primary:hover {
  background-color: var(--mtv-color-brand-hover);
}

.m-button--secondary {
  background-color: var(--mtv-color-surface-raised);
  color: var(--mtv-color-foreground-default);
  border: 1px solid var(--mtv-color-border-default);
  --tw-ring-color: var(--mtv-color-brand-ring);
}
.m-button--secondary:hover {
  background-color: var(--mtv-color-surface-overlay);
}

.m-button--outline {
  background-color: transparent;
  color: var(--mtv-color-foreground-default);
  border: 1px solid var(--mtv-color-border-default);
  --tw-ring-color: var(--mtv-color-brand-ring);
}
.m-button--outline:hover {
  background-color: var(--mtv-color-surface-accent);
  border-color: var(--mtv-color-border-strong);
}

.m-button--ghost {
  background-color: transparent;
  color: var(--mtv-color-foreground-default);
  --tw-ring-color: var(--mtv-color-brand-ring);
}
.m-button--ghost:hover {
  background-color: var(--mtv-color-surface-accent);
}

.m-button--danger {
  background-color: var(--mtv-color-status-critical);
  color: var(--mtv-color-foreground-on-accent);
  --tw-ring-color: var(--mtv-color-status-critical);
}
.m-button--danger:hover {
  background-color: color-mix(in srgb, var(--mtv-color-status-critical) 85%, transparent);
}

/* Loading spinner */
.m-button__spinner {
  @apply h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent;
}

.m-button--loading {
  @apply cursor-wait;
}
</style>
