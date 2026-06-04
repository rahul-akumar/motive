<script setup lang="ts">
definePageMeta({
  title: 'Live',
  moduleName: 'Fleet',
})

await navigateTo('/fleet/live', { replace: true })
</script>
