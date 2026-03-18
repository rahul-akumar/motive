<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import type { Component } from 'vue'

defineProps<{
  icon: Component
  label: string
  href: string
}>()
</script>

<template>
  <a :href="href" class="panel-link-row">
    <MIcon :icon="icon" :size="14" class="panel-link-row__icon" />
    <span class="panel-link-row__label">{{ label }}</span>
    <MIcon :icon="ChevronRight" :size="14" class="panel-link-row__chevron" />
  </a>
</template>

<style scoped>
.panel-link-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.4375rem 1.25rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  transition:
    background-color 100ms ease,
    color 100ms ease;
}

.panel-link-row:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.panel-link-row__icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.panel-link-row__label {
  flex: 1;
}

.panel-link-row__chevron {
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>
