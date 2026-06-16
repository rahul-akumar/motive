<script setup lang="ts">
definePageMeta({
  title: 'Overview',
  moduleName: 'Dashboard',
})

const { fleetDrivers } = useFleetData()
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
        <DashboardFleetMap
          :drivers="fleetDrivers"
          class="charts-row__map animate-card-enter animate-card-enter-5"
        />
        <template #fallback>
          <div class="chart-skeleton fleet-card charts-row__map" aria-hidden="true" />
        </template>
      </ClientOnly>

      <DashboardFleetSafetyCard
        class="charts-row__safety animate-card-enter animate-card-enter-6"
      />
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
  grid-column: span 3;
  min-height: 280px;
}

.charts-row__safety {
  grid-column: span 1;
  min-height: 280px;
}

/* Chart skeleton */
.chart-skeleton {
  height: 280px;
  background: linear-gradient(
    90deg,
    var(--mtv-color-surface-accent-subtle) 25%,
    var(--mtv-color-surface-accent-subtle) 50%,
    var(--mtv-color-surface-accent-subtle) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
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
