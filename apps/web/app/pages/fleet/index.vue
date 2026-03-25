<script setup lang="ts">
definePageMeta({
  title: 'Live',
  moduleName: 'Fleet',
  mainVariant: 'map',
})

await navigateTo('/fleet/live', { replace: true })
</script>
