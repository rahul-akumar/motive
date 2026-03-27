<script setup lang="ts">
import { Construction } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'

defineProps<{
  moduleName?: string
}>()
</script>

<template>
  <div class="under-construction">
    <div class="under-construction__icon">
      <MIcon :icon="Construction" :size="40" />
    </div>
    <h2 class="under-construction__title">Coming Soon</h2>
    <p class="under-construction__subtitle">
      <template v-if="moduleName">
        The <strong>{{ moduleName }}</strong> module is
      </template>
      <template v-else>This page is</template>
      currently under construction.
    </p>
    <p class="under-construction__hint">Check back soon for updates.</p>
  </div>
</template>

<style scoped>
.under-construction {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 0.5rem;
  text-align: center;
  padding: 2rem;
}

.under-construction__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: color-mix(in oklch, var(--mtv-color-accent) 12%, transparent);
  color: var(--mtv-color-accent);
  margin-bottom: 0.25rem;
}

.under-construction__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-text-primary);
  margin: 0;
}

.under-construction__subtitle {
  font-size: var(--font-size-base);
  color: var(--mtv-color-text-secondary, oklch(70% 0 0));
  margin: 0;
  max-width: 360px;
}

.under-construction__hint {
  font-size: var(--font-size-base);
  color: var(--mtv-color-text-tertiary, oklch(55% 0 0));
  margin: 0;
}
</style>
