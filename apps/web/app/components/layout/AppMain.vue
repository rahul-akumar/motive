<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

type SubNavTab = { label: string; href: string }
// Values are either a flat tab array (no groups) or an array of groups (renders dividers between groups).
const subNavMap = computed<Record<string, SubNavTab[] | SubNavTab[][]>>(() => ({
  '/fleet': [
    [
      { label: t('pages.titles.live'), href: '/fleet/live' },
      {
        label: t('pages.titles.live'),
        href: '/fleet/live-3d',
        badge: { label: t('common.beta'), color: 'info' },
      },
      { label: t('pages.titles.history'), href: '/fleet/history' },
    ],
    [
      { label: t('pages.titles.vehicles'), href: '/fleet/vehicles' },
      { label: t('pages.titles.drivers'), href: '/fleet/drivers' },
      { label: t('pages.titles.assets'), href: '/fleet/assets' },
    ],
    [{ label: t('pages.titles.trips'), href: '/fleet/trips' }],
  ],
  '/safety': [
    { label: t('pages.titles.overview'), href: '/safety/overview' },
    { label: t('pages.titles.drivers'), href: '/safety/drivers' },
    { label: t('pages.titles.events'), href: '/safety/events' },
    { label: t('pages.titles.speeding'), href: '/safety/speeding' },
    { label: t('pages.titles.requests'), href: '/safety/requests' },
    { label: t('pages.titles.cameras'), href: '/safety/camera' },
  ],
  '/dispatch': [
    { label: t('pages.titles.plan'), href: '/dispatch/plan' },
    { label: t('pages.titles.inProgress'), href: '/dispatch/in-progress' },
    { label: t('pages.titles.done'), href: '/dispatch/done' },
  ],
  '/workforce': [
    [
      {
        label: t('pages.titles.overview'),
        href: '/workforce/overview',
        badge: { label: t('common.new'), color: 'info' },
      },
    ],
    [
      { label: t('pages.titles.drivers'), href: '/workforce/drivers' },
      { label: t('pages.titles.timecards'), href: '/workforce/timecards' },
      { label: t('pages.titles.qualifications'), href: '/workforce/qualifications' },
      { label: t('pages.titles.templates'), href: '/workforce/templates' },
      { label: t('pages.titles.training'), href: '/workforce/training' },
      {
        label: t('pages.titles.rewards'),
        href: '/workforce/rewards',
        badge: { label: t('common.new'), color: 'info' },
      },
    ],
  ],
  '/maintenance': [
    [{ label: t('pages.titles.inspections'), href: '/maintenance/inspections' }],
    [
      { label: t('pages.titles.services'), href: '/maintenance/services' },
      { label: t('pages.titles.history'), href: '/maintenance/history' },
      { label: t('pages.titles.schedules'), href: '/maintenance/schedules' },
    ],
    [{ label: t('pages.titles.emissionTest'), href: '/maintenance/emission-test' }],
  ],
  '/cards': [
    [
      { label: t('pages.titles.overview'), href: '/cards/overview' },
      { label: t('pages.titles.transactions'), href: '/cards/transactions' },
      { label: t('pages.titles.cards'), href: '/cards/cards' },
      { label: t('pages.titles.missedSavings'), href: '/cards/missed-savings' },
    ],
    [{ label: t('pages.titles.benefits'), href: '/cards/benefits' }],
  ],
  '/compliance': [
    { label: t('pages.titles.overview'), href: '/compliance/overview' },
    { label: t('pages.titles.logs'), href: '/compliance/logs' },
    { label: t('pages.titles.csaInsights'), href: '/compliance/csa-insights' },
    { label: t('pages.titles.disconnects'), href: '/compliance/disconnects' },
  ],
  '/fuel': [
    [
      { label: t('pages.titles.overview'), href: '/fuel/overview' },
      { label: t('pages.titles.drivers'), href: '/fuel/drivers' },
      { label: t('pages.titles.vehicles'), href: '/fuel/vehicles' },
    ],
    [
      { label: t('pages.titles.iftaSummary'), href: '/fuel/ifta-summary' },
      { label: t('pages.titles.tripReports'), href: '/fuel/trip-reports' },
      { label: t('pages.titles.fuelPurchases'), href: '/fuel/fuel-purchases' },
    ],
    [
      { label: t('pages.titles.idlingEvents'), href: '/fuel/idling-events' },
      { label: t('pages.titles.fuelLossEvents'), href: '/fuel/fuel-loss-events' },
    ],
  ],
}))

const moduleKeyMap: Record<string, string> = {
  Fleet: 'nav.fleet',
  Safety: 'nav.safety',
  Fuel: 'nav.fuel',
  Dispatch: 'nav.dispatch',
  Maintenance: 'nav.maintenance',
  Compliance: 'nav.compliance',
  Workforce: 'nav.workforce',
  Cards: 'nav.cards',
}

const titleKeyMap: Record<string, string> = {
  'Fleet View': 'pages.titles.fleetView',
  'Fleet 3D': 'pages.titles.fleet3d',
  Live: 'pages.titles.live',
  'Live 3D': 'pages.titles.live3d',
  Assets: 'pages.titles.assets',
  Trips: 'pages.titles.trips',
  Overview: 'pages.titles.overview',
  Events: 'pages.titles.events',
  Speeding: 'pages.titles.speeding',
  Drivers: 'pages.titles.drivers',
  Cameras: 'pages.titles.cameras',
  Requests: 'pages.titles.requests',
  'Trip Reports': 'pages.titles.tripReports',
  'IFTA Summary': 'pages.titles.iftaSummary',
  Vehicles: 'pages.titles.vehicles',
  'Fuel Purchases': 'pages.titles.fuelPurchases',
  'Idling Events': 'pages.titles.idlingEvents',
  Logs: 'pages.titles.logs',
  'CSA Insights': 'pages.titles.csaInsights',
  Disconnects: 'pages.titles.disconnects',
  Transactions: 'pages.titles.transactions',
  Cards: 'pages.titles.cards',
  'Missed Savings': 'pages.titles.missedSavings',
  Benefits: 'pages.titles.benefits',
  Inspections: 'pages.titles.inspections',
  Services: 'pages.titles.services',
  History: 'pages.titles.history',
  Schedules: 'pages.titles.schedules',
  'Emission Test': 'pages.titles.emissionTest',
  Timecards: 'pages.titles.timecards',
  Qualifications: 'pages.titles.qualifications',
  Templates: 'pages.titles.templates',
  Training: 'pages.titles.training',
  Rewards: 'pages.titles.rewards',
  Plan: 'pages.titles.plan',
  'In Progress': 'pages.titles.inProgress',
  Done: 'pages.titles.done',
}

const moduleNameDisplay = computed(() => {
  const raw = route.meta.moduleName as string
  const key = moduleKeyMap[raw]
  return key ? t(key) : raw
})

const pageTitleDisplay = computed(() => {
  const raw = route.meta.title as string
  const key = titleKeyMap[raw]
  return key ? t(key) : raw
})

const subNavTabs = computed(() => {
  const prefix = Object.keys(subNavMap.value).find((k) => route.path.startsWith(k))
  return prefix ? subNavMap.value[prefix] : null
})
</script>

<template>
  <div class="app-main">
    <!-- Page header: shown whenever the page declares a moduleName -->
    <div v-if="route.meta.moduleName" class="app-page-header">
      <p class="app-page-module">{{ moduleNameDisplay }}</p>
      <h1 class="app-page-title font-condensed">{{ pageTitleDisplay }}</h1>
    </div>

    <!-- Sub-navigation tab strip -->
    <LayoutAppSubNav v-if="subNavTabs" :tabs="subNavTabs" />

    <main class="app-content bg-dot-grid" id="main-content">
      <div
        class="app-content-inner"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 300, ease: 'easeOut' } }"
      >
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  margin: var(--main-margin, 0.5rem 0.5rem 0.5rem 0);
  border-radius: var(--main-radius, var(--card-radius));
  background-color: var(--mtv-color-surface-base);
  border: 1px solid var(--mtv-color-border-default);
}

.app-page-header {
  padding: 1rem 2rem 0;
  flex-shrink: 0;
}

.app-page-module {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-tighter);
  color: var(--mtv-color-foreground-default);
  margin: 0 0 2px;
}

.app-page-title {
  font-size: 0rem;
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-none);
  margin: 0;
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.app-content-inner {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

@media (max-width: 768px) {
  .app-content-inner {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .app-content-inner {
    padding: 0.75rem;
  }
}
</style>
