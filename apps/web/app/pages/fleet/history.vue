<script setup lang="ts">
definePageMeta({
  title: 'History',
  moduleName: 'Fleet',
  mainVariant: 'default',
})
</script>

<template>
  <div class="page-placeholder">
    <p>History</p>
  </div>
</template>

<style scoped>
.page-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--mtv-color-foreground-muted);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}
</style>
