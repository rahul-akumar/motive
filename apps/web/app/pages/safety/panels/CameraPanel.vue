<script setup lang="ts">
import { FileText, Settings, Bell, ArrowUpRight } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'
import { useCameraData, getStatusGroup, type CameraType } from '~/composables/useCameraData'

const { cameras } = useCameraData()

const totalVehicles = 30

const equipped = computed(() => new Set(cameras.map((c) => c.assetId)).size)

const typeCounts = computed(() => {
  const counts: Record<CameraType, number> = { dashcam: 0, 'ai-omnicam': 0, 'multi-cam-dvr': 0 }
  for (const cam of cameras) counts[cam.type]++
  return counts
})

const alertFeed = computed(() =>
  cameras
    .filter((c) => getStatusGroup(c.status) !== 'online' && getStatusGroup(c.status) !== 'pending')
    .slice(0, 5)
    .map((cam) => ({
      id: cam.id,
      text:
        cam.status === 'offline'
          ? 'Camera offline'
          : cam.status === 'signal-issue'
            ? 'Signal issue detected'
            : 'Installation issue',
      sub: `${cam.vehicle} · ${cam.lastLocation}`,
      dot: (cam.status === 'offline' ? 'offline' : 'alert') as 'offline' | 'alert',
      time: cam.lastSeen,
    })),
)

const quickLinks = [
  { icon: FileText, label: 'Export camera report', href: '#' },
  { icon: Bell, label: 'Configure camera alerts', href: '#' },
  { icon: Settings, label: 'Camera settings', href: '#' },
]
</script>

<template>
  <div class="camera-panel">
    <!-- Coverage header -->
    <div class="camera-panel__header">
      <div class="camera-panel__stat">{{ equipped }}</div>
      <div class="camera-panel__stat-label">of {{ totalVehicles }} vehicles equipped</div>
      <div class="camera-panel__coverage-bar">
        <div
          class="camera-panel__coverage-fill"
          :style="{ width: `${Math.round((equipped / totalVehicles) * 100)}%` }"
        />
      </div>
      <div class="camera-panel__coverage-pct">
        {{ Math.round((equipped / totalVehicles) * 100) }}% fleet coverage
      </div>
    </div>

    <!-- Type Breakdown -->
    <LayoutPanelSection title="By Type">
      <LayoutPanelKpiRow label="Dashcam" :value="typeCounts.dashcam" />
      <LayoutPanelKpiRow label="AI Omnicam" :value="typeCounts['ai-omnicam']" />
      <LayoutPanelKpiRow label="Multi-Cam DVR" :value="typeCounts['multi-cam-dvr']" />
    </LayoutPanelSection>

    <!-- Alert Feed -->
    <LayoutPanelSection v-if="alertFeed.length > 0" title="Recent Alerts">
      <template #action>
        <NuxtLink to="/safety/camera" class="panel-view-all">
          View all <MIcon :icon="ArrowUpRight" :size="11" />
        </NuxtLink>
      </template>
      <LayoutPanelFeedRow
        v-for="item in alertFeed"
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
.camera-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.camera-panel__header {
  padding: 1.5rem 1.25rem 1.25rem;
  border-bottom: 1px solid var(--mtv-color-border-default);
  flex-shrink: 0;
}

.camera-panel__stat {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  line-height: var(--leading-none);
  margin-bottom: 0.25rem;
}

.camera-panel__stat-label {
  font-size: var(--font-size-base);
  color: var(--mtv-color-foreground-muted);
  margin-bottom: 0.875rem;
}

.camera-panel__coverage-bar {
  height: 4px;
  background-color: var(--mtv-color-border-default);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.camera-panel__coverage-fill {
  height: 100%;
  background-color: #10b981;
  border-radius: 2px;
  transition: width 400ms ease;
}

.camera-panel__coverage-pct {
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
}

.panel-view-all {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-subtle);
  text-decoration: none;
  transition: color 100ms ease;
}

.panel-view-all:hover {
  color: var(--mtv-color-foreground-default);
}
</style>
