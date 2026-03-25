<script setup lang="ts">
import { X, TriangleAlert, CheckCircle2, Info } from 'lucide-vue-next'
import type { Component } from 'vue'

export type MToastVariant = 'critical' | 'warning' | 'info' | 'success'

export interface MToastProps {
  message: string
  subtext?: string
  variant?: MToastVariant
  actionLabel?: string
  onAction?: () => void
}

const props = withDefaults(defineProps<MToastProps>(), {
  variant: 'info',
})

const emit = defineEmits<{
  dismiss: []
}>()

interface VariantConfig {
  icon: Component
  bg: string
  border: string
  iconColor: string
  actionColor: string
}

const VARIANT_CONFIG: Record<MToastVariant, VariantConfig> = {
  critical: {
    icon: TriangleAlert,
    bg: 'oklch(0.577 0.215 27.3 / 0.08)',
    border: 'oklch(0.577 0.215 27.3 / 0.35)',
    iconColor: 'oklch(0.711 0.166 22.2)',
    actionColor: 'oklch(0.711 0.166 22.2)',
  },
  warning: {
    icon: TriangleAlert,
    bg: 'oklch(0.666 0.157 58.3 / 0.08)',
    border: 'oklch(0.666 0.157 58.3 / 0.35)',
    iconColor: 'oklch(0.837 0.164 84.4)',
    actionColor: 'oklch(0.837 0.164 84.4)',
  },
  info: {
    icon: Info,
    bg: 'oklch(0.623 0.214 259.8 / 0.08)',
    border: 'oklch(0.623 0.214 259.8 / 0.3)',
    iconColor: 'oklch(0.7 0.177 253)',
    actionColor: 'oklch(0.7 0.177 253)',
  },
  success: {
    icon: CheckCircle2,
    bg: 'oklch(0.696 0.149 162.5 / 0.08)',
    border: 'oklch(0.696 0.149 162.5 / 0.3)',
    iconColor: 'oklch(0.800 0.182 151.7)',
    actionColor: 'oklch(0.800 0.182 151.7)',
  },
}

const config = computed(() => VARIANT_CONFIG[props.variant])

function handleAction() {
  props.onAction?.()
  emit('dismiss')
}
</script>

<template>
  <div
    class="m-toast"
    role="alert"
    :aria-live="variant === 'critical' ? 'assertive' : 'polite'"
    :style="{ backgroundColor: config.bg, borderColor: config.border }"
  >
    <span class="m-toast__icon" :style="{ color: config.iconColor }" aria-hidden="true">
      <component :is="config.icon" :size="15" :stroke-width="1.75" />
    </span>

    <div class="m-toast__body">
      <span class="m-toast__message">{{ message }}</span>
      <span v-if="subtext" class="m-toast__subtext">{{ subtext }}</span>
    </div>

    <div class="m-toast__actions">
      <button
        v-if="actionLabel"
        type="button"
        class="m-toast__action-btn"
        :style="{ color: config.actionColor }"
        @click="handleAction"
      >
        {{ actionLabel }}
      </button>
      <button
        type="button"
        class="m-toast__dismiss"
        aria-label="Dismiss notification"
        @click="emit('dismiss')"
      >
        <X :size="13" :stroke-width="2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.m-toast {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  min-width: 300px;
  max-width: 400px;
  padding: 0.75rem 0.875rem;
  border: 1px solid;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.28),
    0 1px 4px rgba(0, 0, 0, 0.12);
  pointer-events: all;
}

.m-toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin-top: 1px;
}

.m-toast__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.m-toast__message {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  line-height: var(--leading-tight);
}

.m-toast__subtext {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  line-height: var(--leading-tight);
}

.m-toast__actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.m-toast__action-btn {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  white-space: nowrap;
  transition: opacity 100ms ease;
}

.m-toast__action-btn:hover {
  opacity: 0.75;
}

.m-toast__dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--mtv-color-foreground-subtle);
  border-radius: 3px;
  padding: 0;
  transition: all 100ms ease;
}

.m-toast__dismiss:hover {
  background-color: var(--mtv-color-surface-raised);
  color: var(--mtv-color-foreground-default);
}
</style>
