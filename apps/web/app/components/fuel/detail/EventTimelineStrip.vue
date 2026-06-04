<script setup lang="ts">
import { MBadge } from '@motive/ui'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

const { formatTime } = useFormatters()

const timeRange = computed(() => {
  const start = formatTime(props.event.startTime)
  const end = formatTime(props.event.endTime)
  return `${start} – ${end}`
})
</script>

<template>
  <div class="event-timeline">
    <MBadge color="default" size="sm"> {{ timeRange }} · 1 event </MBadge>
  </div>
</template>

<style scoped>
.event-timeline {
  padding: 0.5rem 0;
}
</style>
