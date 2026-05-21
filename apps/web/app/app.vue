<script setup lang="ts">
const { loadSavedTheme } = useTheme()
const { loadSavedLocale } = useLocalePreferences()
const { loadSavedRegion } = useRegion()
const { loadSavedFormatPreferences } = useFormatPreferences()

onMounted(() => {
  loadSavedTheme()
  loadSavedLocale()
  loadSavedRegion()
  loadSavedFormatPreferences()
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
