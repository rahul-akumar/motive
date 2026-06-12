<script setup lang="ts">
import { Copy, MoreHorizontal } from 'lucide-vue-next'
import { MIcon, MButton } from '@motive/ui'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

// Mock coaching data (deterministic from event id)
const coachCount = computed(() => {
  const hash = props.event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 1 + (hash % 4)
})

const lastCoached = computed(() => {
  const hash = props.event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const daysAgo = 1 + (hash % 14)
  return `${daysAgo} days ago`
})
</script>

<template>
  <div class="drawer-coaching">
    <div class="drawer-coaching__header">
      <span class="drawer-coaching__label">COACHING</span>
      <div class="drawer-coaching__actions">
        <MButton variant="ghost" size="xs" icon-only aria-label="Copy">
          <MIcon :icon="Copy" :size="14" />
        </MButton>
        <MButton variant="ghost" size="xs" icon-only aria-label="More">
          <MIcon :icon="MoreHorizontal" :size="14" />
        </MButton>
      </div>
    </div>
    <span class="drawer-coaching__count">{{ coachCount }} Coaches</span>
    <span class="drawer-coaching__meta">Last coached {{ lastCoached }}</span>
  </div>
</template>

<style scoped>
.drawer-coaching {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.75rem;
  background: var(--mtv-color-surface-sunken);
  border-radius: var(--radius);
}

.drawer-coaching__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.drawer-coaching__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.drawer-coaching__actions {
  display: flex;
  gap: 0.25rem;
}

.drawer-coaching__count {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.drawer-coaching__meta {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}
</style>
