<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'
import { MSkeleton, MEmptyState, MButton, AsyncBoundary } from '@motive/ui'

definePageMeta({
  title: 'Overview',
  moduleName: 'Dashboard',
})

const { fleetDrivers, status, refresh } = useFleetData()
const { metrics } = useKPIMetrics()
</script>

<template>
  <div class="dashboard-page">
    <!-- KPI Row -->
    <section class="kpi-row" aria-label="Key performance indicators">
      <DashboardKpiCard
        v-for="(metric, i) in metrics"
        :key="metric.id"
        :metric="metric"
        :index="i"
        :class="`animate-card-enter animate-card-enter-${i + 1}`"
      />
    </section>

    <!-- Charts Row -->
    <section class="charts-row" aria-label="Fleet analytics charts">
      <ClientOnly>
        <AsyncBoundary :status="status" @retry="refresh">
          <template #pending>
            <MSkeleton variant="block" height="280px" class="charts-row__map" />
          </template>
          <template #error="{ retry }">
            <div class="charts-row__map chart-error">
              <MEmptyState
                variant="error"
                :icon="TriangleAlert"
                title="Couldn’t load the fleet map"
                description="There was a problem loading live fleet data."
              >
                <template #action>
                  <MButton variant="secondary" size="sm" @click="retry">Try again</MButton>
                </template>
              </MEmptyState>
            </div>
          </template>
          <DashboardFleetMap
            :drivers="fleetDrivers"
            class="charts-row__map animate-card-enter animate-card-enter-5"
          />
        </AsyncBoundary>
        <template #fallback>
          <MSkeleton variant="block" height="280px" class="charts-row__map" />
        </template>
      </ClientOnly>

      <DashboardFleetSafetyCard
        class="charts-row__safety animate-card-enter animate-card-enter-6"
      />

      <DashboardFuelScoreCard class="charts-row__fuel animate-card-enter animate-card-enter-7" />
    </section>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* KPI Row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* Charts Row */
.charts-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.charts-row__map {
  grid-column: span 2;
  min-height: 280px;
}

.charts-row__safety {
  grid-column: span 1;
  min-height: 280px;
}

.charts-row__fuel {
  grid-column: span 1;
  min-height: 280px;
}

/* Fleet map error state — keeps the grid slot filled with a retriable card */
.chart-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  background-color: var(--mtv-color-surface-raised);
  border: 1px solid var(--mtv-color-border-default);
  border-radius: var(--card-radius);
}

/* Responsive */
@media (max-width: 1280px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .kpi-row {
    grid-template-columns: 1fr 1fr;
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
