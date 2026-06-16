<script setup lang="ts">
import { TrendingDown, TrendingUp } from 'lucide-vue-next'
import { MButton, MCard, MIcon } from '@motive/ui'
import { useFuelScore } from '~/composables/useFuelScore'

const router = useRouter()

const { score, trendDelta, openIdlingCount, openFuelLossCount, totalWaste, unit } = useFuelScore()

const trendIcon = computed(() => (trendDelta.value >= 0 ? TrendingUp : TrendingDown))
const trendColor = computed(() =>
  trendDelta.value >= 0 ? 'var(--fleet-delta-increase)' : 'var(--fleet-delta-decrease)',
)
const trendLabel = computed(() => {
  const sign = trendDelta.value >= 0 ? '+' : ''
  return `${sign}${trendDelta.value} pts this week`
})

const actionItems = computed(() => [
  { label: 'Idling events', count: openIdlingCount.value, severity: 'warning' },
  { label: 'Fuel loss flagged', count: openFuelLossCount.value, severity: 'critical' },
  {
    label: 'Total waste (7d)',
    count: `${totalWaste.value.toFixed(1)} ${unit.value}`,
    severity: 'info',
  },
])
</script>

<template>
  <MCard padding="lg" title="Fuel score" class="fuel-score">
    <template #action>
      <MButton variant="link" size="sm" @click="router.push('/fuel/overview')"
        >View details</MButton
      >
    </template>

    <div class="fuel-score__score-wrap">
      <div class="fuel-score__score font-mono-data">{{ score }}</div>
      <div class="fuel-score__trend" :style="{ color: trendColor }">
        <MIcon :icon="trendIcon" :size="14" :color="trendColor" aria-hidden="true" />
        {{ trendLabel }}
      </div>
    </div>

    <nav class="fuel-score__actions" aria-label="Fuel score action items">
      <NuxtLink
        v-for="item in actionItems"
        :key="item.label"
        to="/fuel/overview"
        class="fuel-score__action-row"
      >
        <span class="fuel-score__action-label">{{ item.label }}</span>
        <span
          class="fuel-score__action-count"
          :class="`fuel-score__action-count--${item.severity}`"
        >
          {{ item.count }}
        </span>
      </NuxtLink>
    </nav>
  </MCard>
</template>

<style scoped>
.fuel-score__score-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.fuel-score__score {
  font-family: var(--font-family-condensed);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  line-height: 1;
  letter-spacing: var(--tracking-tight);
}

.fuel-score__trend {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  letter-spacing: var(--tracking-normal);
}

.fuel-score__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fuel-score__action-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  transition: opacity 150ms ease;
}

.fuel-score__action-row:hover {
  opacity: 0.75;
}

.fuel-score__action-label {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-normal);
  flex: 1;
}

.fuel-score__action-count {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-normal);
}

.fuel-score__action-count--warning {
  color: var(--mtv-color-status-warning);
}

.fuel-score__action-count--info {
  color: var(--mtv-color-foreground-subtle);
}

.fuel-score__action-count--critical {
  color: var(--mtv-color-status-danger);
}
</style>
