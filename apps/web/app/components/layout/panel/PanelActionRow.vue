<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import type { Component } from 'vue'

defineProps<{
  icon: Component
  label: string
  count: number
  severity: 'critical' | 'warning' | 'info'
  href: string
}>()
</script>

<template>
  <NuxtLinkLocale :to="href" class="panel-action-row">
    <span :class="['panel-action-row__icon', `panel-action-row__icon--${severity}`]">
      <MIcon :icon="icon" :size="13" />
    </span>
    <span class="panel-action-row__label">{{ label }}</span>
    <span :class="['panel-action-row__count', `panel-action-row__count--${severity}`]">{{
      count
    }}</span>
    <MIcon :icon="ChevronRight" :size="14" class="panel-action-row__chevron" />
  </NuxtLinkLocale>
</template>

<style scoped>
.panel-action-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.4375rem 1.25rem;
  text-decoration: none;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-base);
  transition:
    background-color 100ms ease,
    color 100ms ease;
}

.panel-action-row:hover {
  background-color: var(--mtv-color-surface-hover);
  color: var(--mtv-color-foreground-default);
}

.panel-action-row__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  flex-shrink: 0;
}

.panel-action-row__icon--critical {
  background-color: oklch(0.577 0.215 27.3 / 0.1);
  color: oklch(0.577 0.215 27.3);
}
.panel-action-row__icon--warning {
  background-color: oklch(0.666 0.157 58.3 / 0.1);
  color: oklch(0.666 0.157 58.3);
}
.panel-action-row__icon--info {
  background-color: oklch(1 0 0 / 0.06);
  color: var(--mtv-color-foreground-subtle);
}

.panel-action-row__label {
  flex: 1;
  min-width: 0;
}

.panel-action-row__count {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: 2px;
  padding: 0 0.3rem;
  line-height: var(--leading-relaxed);
  flex-shrink: 0;
}

.panel-action-row__count--critical {
  background-color: oklch(0.577 0.215 27.3 / 0.1);
  color: oklch(0.577 0.215 27.3);
}
.panel-action-row__count--warning {
  background-color: oklch(0.666 0.157 58.3 / 0.1);
  color: oklch(0.666 0.157 58.3);
}
.panel-action-row__count--info {
  background-color: oklch(1 0 0 / 0.06);
  color: var(--mtv-color-foreground-subtle);
}

.panel-action-row__chevron {
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
}
</style>
