<script setup lang="ts">
import { X, TriangleAlert, CheckCircle2, Info, Siren } from 'lucide-vue-next'
import type { Component } from 'vue'
import MButton from './MButton.vue'
import MIcon from './MIcon.vue'

export type MToastVariant = 'critical' | 'warning' | 'info' | 'success'

export interface MToastProps {
  message: string
  subtext?: string
  variant?: MToastVariant
  duration?: number
  dismissible?: boolean
  actionLabel?: string
  onAction?: () => void
}

const props = withDefaults(defineProps<MToastProps>(), {
  variant: 'info',
  duration: 0,
  dismissible: true,
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
    icon: Siren,
    bg: 'var(--mtv-color-surface-critical)',
    border: 'var(--mtv-color-border-critical)',
    iconColor: 'var(--mtv-color-foreground-critical)',
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

const isHovered = ref(false)

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
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="m-toast__content">
      <MIcon
        class="m-toast__icon"
        :icon="config.icon"
        :size="18"
        :stroke-width="1.75"
        :style="{ color: config.iconColor }"
      />

      <div class="m-toast__body">
        <span class="m-toast__message">{{ message }}</span>
        <span v-if="subtext" class="m-toast__subtext">{{ subtext }}</span>
      </div>
    </div>

    <div class="m-toast__actions px-8">
      <MButton
        v-if="actionLabel"
        variant="link"
        size="sm"
        :style="{ color: config.actionColor }"
        @click="handleAction"
      >
        {{ actionLabel }}
      </MButton>
      <MButton
        v-if="dismissible && duration === 0"
        variant="ghost"
        size="sm"
        icon-only
        aria-label="Dismiss notification"
        @click="emit('dismiss')"
      >
        <X :size="13" :stroke-width="2" />
      </MButton>
    </div>

    <div
      v-if="duration > 0"
      class="m-toast__timer-bar"
      :style="{
        animationDuration: `${duration}ms`,
        animationPlayState: isHovered ? 'paused' : 'running',
        backgroundColor: config.iconColor,
      }"
      @animationend="emit('dismiss')"
    />
  </div>
</template>

<style scoped>
.m-toast {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 300px;
  max-width: 500px;
  padding: 0.75rem 0.875rem;
  border: 1px solid;
  border-radius: var(--mtv-border-radius);
  backdrop-filter: blur(8px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.28),
    0 1px 4px rgba(0, 0, 0, 0.12);
  pointer-events: all;
  position: relative;
  overflow: hidden;
}

.m-toast__content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.m-toast__icon {
  flex-shrink: 0;
}

.m-toast__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.m-toast__message {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  line-height: var(--leading-tight);
}

.m-toast__subtext {
  font-size: var(--font-size-xsm);
  color: var(--mtv-color-foreground-muted);
  line-height: var(--leading-tight);
}

.m-toast__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  margin-left: auto;
}

.m-toast__timer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  transform-origin: left center;
  opacity: 0.55;
  animation: m-timer-shrink linear forwards;
}

@keyframes m-timer-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
