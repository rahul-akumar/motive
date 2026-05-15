<script setup lang="ts">
import { Construction } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'

defineProps<{
  tabName: string
}>()
</script>

<template>
  <div class="vehicle-placeholder">
    <MIcon :icon="Construction" :size="32" class="vehicle-placeholder__icon" />
    <p class="vehicle-placeholder__title">{{ tabName }}</p>
    <p class="vehicle-placeholder__sub">This tab is under development.</p>
  </div>
</template>

<style scoped>
.vehicle-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 4rem 2rem;
  text-align: center;
}

.vehicle-placeholder__icon {
  color: var(--mtv-color-foreground-subtle);
}

.vehicle-placeholder__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.vehicle-placeholder__sub {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}
</style>
