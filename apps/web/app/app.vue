<script setup lang="ts">
const { loadSavedTheme } = useTheme()

onMounted(() => {
  loadSavedTheme()
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
