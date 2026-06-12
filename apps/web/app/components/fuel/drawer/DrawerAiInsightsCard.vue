<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import { getDriverInsight } from '~/mocks/driver-insights'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

const { allRows } = useFuelEventsData()

const insight = computed(() => {
  const data = getDriverInsight(props.event.driverId, allRows.value)
  if (!data) return null
  return {
    ...data,
    message: `${data.eventsThisMonth}${getSuffix(data.eventsThisMonth)} event this month. Total fuel loss value $${data.totalLossValue.toLocaleString()}. This driver has ${data.fleetAvgMultiplier}x fleet average.`,
  }
})

function getSuffix(n: number): string {
  if (n === 1) return 'st'
  if (n === 2) return 'nd'
  if (n === 3) return 'rd'
  return 'th'
}
</script>

<template>
  <div v-if="insight" class="drawer-ai">
    <div class="drawer-ai__header">
      <MIcon :icon="Sparkles" :size="14" />
      <span class="drawer-ai__title">Insights</span>
    </div>
    <p class="drawer-ai__message">{{ insight.message }}</p>
  </div>
</template>

<style scoped>
.drawer-ai {
  padding: 0.75rem;
  background: oklch(96.253% 0.02262 229.265);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drawer-ai__header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: oklch(0.35 0.08 240);
}

.drawer-ai__title {
  font-size: var(--font-size-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.drawer-ai__message {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: oklch(0.25 0.06 240);
  line-height: 1.4;
  margin: 0;
}
</style>
