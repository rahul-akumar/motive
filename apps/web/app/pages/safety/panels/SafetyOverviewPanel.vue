<script setup lang="ts">
import {
  AlertTriangle,
  VideoOff,
  GraduationCap,
  FileText,
  Settings,
  Download,
  Bell,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-vue-next'
import { MIcon } from '@motive/ui'

const actionItems = [
  {
    icon: AlertTriangle,
    label: 'Events need review',
    count: 14,
    severity: 'warning' as const,
    href: '/safety/events',
  },
  {
    icon: GraduationCap,
    label: 'Coaching sessions pending',
    count: 3,
    severity: 'info' as const,
    href: '/safety/drivers',
  },
  {
    icon: VideoOff,
    label: 'Camera health alerts',
    count: 2,
    severity: 'critical' as const,
    href: '/safety/camera',
  },
]

const activityFeed = [
  {
    id: 1,
    time: '2m ago',
    text: 'Harsh braking event',
    sub: 'Marcus Webb · Truck 48',
    dot: 'alert' as const,
  },
  {
    id: 2,
    time: '11m ago',
    text: 'Event marked as coached',
    sub: 'Sarah Kim reviewed',
    dot: 'active' as const,
  },
  {
    id: 3,
    time: '34m ago',
    text: 'Speeding event recorded',
    sub: 'Deon Harris · Truck 12',
    dot: 'alert' as const,
  },
  {
    id: 4,
    time: '1h ago',
    text: 'Safety score improved +4',
    sub: 'Fleet average: 87',
    dot: 'driving' as const,
  },
  {
    id: 5,
    time: '2h ago',
    text: 'Camera back online',
    sub: 'Truck 31 · Route 9',
    dot: 'driving' as const,
  },
]

const quickLinks = [
  { icon: FileText, label: 'Export safety report', href: '#' },
  { icon: Bell, label: 'Configure alert rules', href: '#' },
  { icon: Download, label: 'Download scorecard', href: '#' },
  { icon: Settings, label: 'Safety settings', href: '#' },
]
</script>

<template>
  <div class="safety-panel">
    <!-- Score header -->
    <div class="safety-panel__header">
      <div class="safety-panel__score">87</div>
      <div class="safety-panel__score-label">Fleet safety score</div>
      <div class="safety-panel__trend">
        <MIcon :icon="TrendingUp" :size="13" />
        +4 pts this week
      </div>
    </div>

    <!-- Action Center -->
    <LayoutPanelSection title="Action Center">
      <template #action>
        <span class="panel-badge--alert">{{ actionItems.reduce((s, i) => s + i.count, 0) }}</span>
      </template>
      <LayoutPanelActionRow
        v-for="item in actionItems"
        :key="item.label"
        :icon="item.icon"
        :label="item.label"
        :count="item.count"
        :severity="item.severity"
        :href="item.href"
      />
    </LayoutPanelSection>

    <!-- Activity -->
    <LayoutPanelSection title="Activity">
      <template #action>
        <NuxtLink to="/safety/events" class="panel-view-all">
          View all <MIcon :icon="ArrowUpRight" :size="11" />
        </NuxtLink>
      </template>
      <LayoutPanelFeedRow
        v-for="item in activityFeed"
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
</template>

<style scoped>
.safety-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.safety-panel__header {
  padding: 1.5rem 1.25rem 1.25rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.safety-panel__score {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--leading-none);
  margin-bottom: 0.25rem;
}

.safety-panel__score-label {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.safety-panel__trend {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--font-size-sm);
  color: #4ade80;
  margin-top: 0.5rem;
}

.panel-badge--alert {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  background-color: rgba(220, 38, 38, 0.12);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 2px;
  padding: 0 0.3rem;
  line-height: var(--leading-relaxed);
}

.panel-view-all {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  text-decoration: none;
  transition: color 100ms ease;
}

.panel-view-all:hover {
  color: var(--text-primary);
}
</style>
