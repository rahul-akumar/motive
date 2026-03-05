<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { drivers, fleetStatus } = useFleetData()
const { metrics } = useKPIMetrics()
const { visibleEvents, hasMore, loadMore } = useActivityFeed()
const { activeAlerts, criticalCount, warningCount, dismiss, dismissAll } = useAlerts()
const { dailyMiles } = useMilesData()
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
        <DashboardFleetStatusDonut
          :status="fleetStatus"
          class="charts-row__donut animate-card-enter animate-card-enter-5"
        />
        <template #fallback>
          <div class="chart-skeleton fleet-card charts-row__donut" aria-hidden="true" />
        </template>
      </ClientOnly>

      <ClientOnly>
        <DashboardFleetMap
          :drivers="drivers"
          class="charts-row__map animate-card-enter animate-card-enter-6"
        />
        <template #fallback>
          <div class="chart-skeleton fleet-card charts-row__map" aria-hidden="true" />
        </template>
      </ClientOnly>

      <ClientOnly>
        <DashboardMilesChart
          :data="dailyMiles"
          class="charts-row__miles animate-card-enter animate-card-enter-6"
        />
        <template #fallback>
          <div class="chart-skeleton fleet-card charts-row__miles" aria-hidden="true" />
        </template>
      </ClientOnly>
    </section>

    <!-- HOS Compliance -->
    <section class="hos-row" aria-label="HOS compliance">
      <DashboardHosComplianceBar
        :drivers="drivers"
        class="animate-card-enter animate-card-enter-7"
      />
    </section>

    <!-- Bottom Row: Fleet Table + Activity/Alerts -->
    <section class="bottom-row" aria-label="Fleet table and activity">
      <DashboardFleetTable
        :drivers="drivers"
        class="bottom-row__table animate-card-enter animate-card-enter-7"
      />

      <div class="bottom-row__side">
        <DashboardAlertsPanel
          :alerts="activeAlerts"
          :critical-count="criticalCount"
          :warning-count="warningCount"
          class="animate-card-enter animate-card-enter-8"
          @dismiss="dismiss"
          @dismiss-all="dismissAll"
        />
        <DashboardActivityFeed
          :events="visibleEvents"
          :has-more="hasMore"
          class="animate-card-enter animate-card-enter-8"
          @load-more="loadMore"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1600px;
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
  grid-template-columns: 320px 1fr 1.5fr;
  gap: 1rem;
}

.charts-row__miles,
.charts-row__map {
  min-height: 280px;
}

.charts-row__donut {
  min-height: 280px;
}

/* HOS Row */
.hos-row {
  display: grid;
  grid-template-columns: 1fr;
}

/* Bottom Row */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1rem;
  align-items: start;
}

.bottom-row__side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Chart skeleton */
.chart-skeleton {
  height: 280px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.02) 25%,
    rgba(255, 255, 255, 0.04) 50%,
    rgba(255, 255, 255, 0.02) 75%
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
@media (max-width: 1400px) {
  .charts-row {
    grid-template-columns: 320px 1fr;
  }

  .charts-row__miles {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1280px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .charts-row__miles {
    grid-column: auto;
  }

  .bottom-row {
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

  .bottom-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
