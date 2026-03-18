<script setup lang="ts">
const { loadSavedTheme } = useTheme()
const { loadSavedLocale } = useLocalePreferences()

onMounted(() => {
  loadSavedTheme()
  loadSavedLocale()
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
