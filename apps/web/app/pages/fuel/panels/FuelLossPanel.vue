<script setup lang="ts">
import { FileText, Bell, Settings, ArrowUpRight, AlertTriangle } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'

const {
  recentEvents,
  totalThisMonth,
  openCount,
  selectedEvent,
  clearSelectedEvent,
  markReviewed,
  markDismissed,
} = useFuelLossData()

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const feedItems = computed(() =>
  recentEvents.value.map((e) => ({
    id: e.id,
    text: `${e.vehicleName} — −${e.fuelDrop}%`,
    sub: e.driverName
      ? `${e.driverName} · ${e.location.address.split(',').slice(-2).join(',').trim()}`
      : e.location.address.split(',').slice(-2).join(',').trim(),
    time: formatRelativeTime(e.startTime),
    dot: (e.status === 'open' ? 'alert' : 'idle') as 'alert' | 'idle',
  })),
)

const quickLinks = [
  { icon: FileText, label: 'Export report', href: '#' },
  { icon: Bell, label: 'Configure alerts', href: '#' },
  { icon: Settings, label: 'Alert settings', href: '#' },
]
</script>

<template>
  <!-- Event detail view — shown when a table row is selected -->
  <Transition name="fl-panel-swap" mode="out-in">
    <FuelLossEventDetail
      v-if="selectedEvent"
      :key="selectedEvent.id"
      :event="selectedEvent"
      @close="clearSelectedEvent"
      @reviewed="markReviewed"
      @dismissed="markDismissed"
    />

    <!-- Default summary view -->
    <div v-else class="fl-panel">
      <!-- Header: events count this month -->
      <div class="fl-panel__header">
        <div class="fl-panel__stat">{{ totalThisMonth }}</div>
        <div class="fl-panel__stat-label">fuel loss events this month</div>
        <div v-if="openCount > 0" class="fl-panel__open-count">
          <span class="fl-panel__open-dot" />
          {{ openCount }} open · needs review
        </div>
      </div>

      <!-- Action Center -->
      <LayoutPanelSection v-if="openCount > 0" title="Action Center">
        <template #action>
          <span class="fl-panel-badge--alert">{{ openCount }}</span>
        </template>
        <LayoutPanelActionRow
          :icon="AlertTriangle"
          label="Events need review"
          :count="openCount"
          severity="warning"
          href="/fuel/fuel-loss-events"
        />
      </LayoutPanelSection>

      <!-- Recent Events feed -->
      <LayoutPanelSection title="Recent Events">
        <template #action>
          <NuxtLink to="/fuel/fuel-loss-events" class="fl-panel__view-all">
            View all <MIcon :icon="ArrowUpRight" :size="11" />
          </NuxtLink>
        </template>
        <LayoutPanelFeedRow
          v-for="item in feedItems"
          :key="item.id"
          :dot="item.dot"
          :text="item.text"
          :sub="item.sub"
          :time="item.time"
        />
      </LayoutPanelSection>

      <!-- Quick Links -->
      <LayoutPanelSection title="Quick Links">
        <LayoutPanelLinkRow
          v-for="link in quickLinks"
          :key="link.label"
          :icon="link.icon"
          :label="link.label"
          :href="link.href"
        />
      </LayoutPanelSection>
    </div>
  </Transition>
</template>

<style scoped>
.fl-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* ── Header ──────────────────────────────────────────────── */
.fl-panel__header {
  padding: 1.5rem 1.25rem 1.25rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.fl-panel__stat {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  line-height: var(--leading-none);
  margin-bottom: 0.25rem;
}

.fl-panel__stat-label {
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-muted);
}

.fl-panel__open-count {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.625rem;
  font-size: var(--font-size-sm);
  color: oklch(0.837 0.164 84.4);
}

.fl-panel__open-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: oklch(0.837 0.164 84.4);
  flex-shrink: 0;
}

/* ── Badges / links ──────────────────────────────────────── */
.fl-panel-badge--alert {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  background-color: oklch(0.666 0.157 58.3 / 0.12);
  color: oklch(0.666 0.157 58.3);
  border: 1px solid oklch(0.666 0.157 58.3 / 0.2);
  border-radius: 2px;
  padding: 0 0.3rem;
  line-height: var(--leading-relaxed);
}

.fl-panel__view-all {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  text-decoration: none;
  transition: color 100ms ease;
}

.fl-panel__view-all:hover {
  color: var(--mtv-color-foreground-default);
}

/* ── Summary ↔ Detail swap transition ───────────────────── */
.fl-panel-swap-enter-active,
.fl-panel-swap-leave-active {
  transition: opacity 150ms ease;
}

.fl-panel-swap-enter-from,
.fl-panel-swap-leave-to {
  opacity: 0;
}
</style>
