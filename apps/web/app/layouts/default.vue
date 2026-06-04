<script setup lang="ts">
// Shell handles: sidebar, right panel, toasts, preferences, head title
</script>

<template>
  <LayoutAppShell>
    <LayoutAppMain>
      <slot />
    </LayoutAppMain>
  </LayoutAppShell>
</template>
