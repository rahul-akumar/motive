<script setup lang="ts">
import { MBadge } from '@motive/ui'

export interface MapMarkerPopoverProps {
  title: string
  description?: string
  timestamp?: Date
  badgeLabel?: string
  badgeColor?: 'success' | 'warning' | 'danger' | 'default'
  signalStrength?: number
}

defineProps<MapMarkerPopoverProps>()

const { formatDate, formatTime } = useFormatters()
</script>

<template>
  <div class="map-marker-popover">
    <div class="map-marker-popover__header">
      <span class="map-marker-popover__title">{{ title }}</span>
      <MBadge v-if="badgeLabel" :label="badgeLabel" :color="badgeColor ?? 'default'" size="sm" />
    </div>

    <p v-if="description" class="map-marker-popover__description">{{ description }}</p>

    <div v-if="timestamp || signalStrength !== undefined" class="map-marker-popover__meta">
      <span v-if="timestamp" class="map-marker-popover__meta-item">
        {{ formatDate(timestamp) }} · {{ formatTime(timestamp) }}
      </span>
      <span v-if="signalStrength !== undefined" class="map-marker-popover__meta-item">
        Signal: {{ signalStrength }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
.map-marker-popover {
  width: 280px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-marker-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.map-marker-popover__title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
  min-width: 0;
}

.map-marker-popover__header :deep(.m-badge) {
  white-space: nowrap;
  flex-shrink: 0;
}

.map-marker-popover__description {
  margin: 0;
  font-size: var(--font-size-xs);
  line-height: 1.4;
  color: var(--mtv-color-foreground-muted);
}

.map-marker-popover__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.375rem;
  border-top: 1px solid var(--mtv-color-border-default);
}

.map-marker-popover__meta-item {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}
</style>
