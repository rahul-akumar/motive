<script setup lang="ts">
const { loadSavedTheme } = useTheme()
const { loadSavedLocale } = useLocalePreferences()
const { loadSavedRegion } = useRegion()

onMounted(() => {
  loadSavedTheme()
  loadSavedLocale()
  loadSavedRegion()
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
