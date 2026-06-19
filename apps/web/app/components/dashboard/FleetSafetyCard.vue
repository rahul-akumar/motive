<script setup lang="ts">
import { TrendingUp } from 'lucide-vue-next'
import { MButton, MIcon } from '@motive/ui'

const router = useRouter()

const actionItems = [
  { label: 'Events need review', count: 14, severity: 'warning', href: '/safety/events' },
  { label: 'Coaching pending', count: 3, severity: 'info', href: '/safety/drivers' },
  { label: 'Camera alerts', count: 2, severity: 'critical', href: '/safety/camera' },
]
</script>

<template>
  <DashboardCard title="Safety score" class="fleet-safety">
    <template #action>
      <MButton variant="link" size="sm" @click="router.push('/safety/overview')"
        >View details</MButton
      >
    </template>

    <div class="fleet-safety__score-wrap">
      <div class="fleet-safety__score font-mono-data">87</div>
      <div class="fleet-safety__trend">
        <MIcon :icon="TrendingUp" :size="14" aria-hidden="true" />
        +4 pts this week
      </div>
    </div>

    <nav class="fleet-safety__actions" aria-label="Safety action items">
      <NuxtLink
        v-for="item in actionItems"
        :key="item.href"
        :to="item.href"
        class="fleet-safety__action-row"
      >
        <span class="fleet-safety__action-label">{{ item.label }}</span>
        <span
          class="fleet-safety__action-count"
          :class="`fleet-safety__action-count--${item.severity}`"
        >
          {{ item.count }}
        </span>
      </NuxtLink>
    </nav>
  </DashboardCard>
</template>

<style scoped>
.fleet-safety__score-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.fleet-safety__score {
  font-family: var(--font-family-condensed);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  line-height: 1;
  letter-spacing: var(--tracking-tight);
}

.fleet-safety__trend {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  color: var(--fleet-severity-success);
  letter-spacing: var(--tracking-normal);
}

.fleet-safety__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fleet-safety__action-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  transition: opacity var(--mtv-duration-fast) var(--mtv-ease-standard);
}

.fleet-safety__action-row:hover {
  opacity: 0.75;
}

.fleet-safety__action-label {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-normal);
  flex: 1;
}

.fleet-safety__action-count {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-normal);
}

.fleet-safety__action-count--warning {
  color: var(--mtv-color-status-warning);
}

.fleet-safety__action-count--info {
  color: var(--mtv-color-foreground-subtle);
}

.fleet-safety__action-count--critical {
  color: var(--mtv-color-status-danger);
}
</style>
