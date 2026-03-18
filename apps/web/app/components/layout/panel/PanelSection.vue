<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="panel-section">
    <div class="panel-section__header">
      <span class="panel-section__title">{{ title }}</span>
      <slot name="action" />
    </div>
    <slot />
  </section>
</template>

<style scoped>
.panel-section {
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.panel-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.625rem;
}

.panel-section__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}
</style>
