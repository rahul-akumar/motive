<script setup lang="ts">
import { Router, ShieldCheck, Radio, Satellite, Gauge, Cpu } from 'lucide-vue-next'
import { MCard, MBadge, MIcon } from '@motive/ui'
import type { VehicleDevice, VehicleDeviceType, VehicleDeviceStatus } from '@motive/shared'

const props = defineProps<{ device: VehicleDevice }>()

const DEVICE_ICONS: Record<VehicleDeviceType, typeof Router> = {
  'vehicle-gateway': Router,
  'asset-gateway': Satellite,
  beacon: Radio,
  visionlink: Gauge,
  komtrax: Cpu,
  'engine-immobilizer': ShieldCheck,
}

const DEVICE_LABELS: Record<VehicleDeviceType, string> = {
  'vehicle-gateway': 'Vehicle Gateway',
  'asset-gateway': 'Asset Gateway',
  beacon: 'Beacon',
  visionlink: 'VisionLink (CAT)',
  komtrax: 'Komtrax',
  'engine-immobilizer': 'Engine Immobilizer',
}

const STATUS_CONFIG: Record<
  VehicleDeviceStatus,
  { color: 'success' | 'warning' | 'danger' | 'default'; label: string }
> = {
  online: { color: 'success', label: 'Online' },
  offline: { color: 'default', label: 'Offline' },
  'signal-jammed': { color: 'danger', label: 'Signal Jammed' },
  activated: { color: 'danger', label: 'Activated' },
  armed: { color: 'warning', label: 'Armed' },
  disarmed: { color: 'default', label: 'Disarmed' },
  error: { color: 'danger', label: 'Error' },
}

const icon = computed(() => DEVICE_ICONS[props.device.type])
const label = computed(() => DEVICE_LABELS[props.device.type])
const statusConfig = computed(() => STATUS_CONFIG[props.device.status])
const isCritical = computed(
  () => props.device.status === 'signal-jammed' || props.device.status === 'activated',
)

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const { formatDate } = useFormatters()
</script>

<template>
  <MCard class="device-card" :class="{ 'device-card--critical': isCritical }">
    <div class="device-card__header">
      <div class="device-card__icon" :class="{ 'device-card__icon--critical': isCritical }">
        <MIcon :icon="icon" :size="20" />
      </div>
      <div class="device-card__title">
        <span class="device-card__type">{{ label }}</span>
        <span class="device-card__name">{{ device.name }}</span>
      </div>
      <MBadge :label="statusConfig.label" :color="statusConfig.color" size="sm" />
    </div>

    <dl class="device-card__details">
      <dt>Serial</dt>
      <dd class="device-card__mono">{{ device.serialNumber }}</dd>
      <dt>Firmware</dt>
      <dd>v{{ device.firmwareVersion }}</dd>
      <dt>Installed</dt>
      <dd>{{ formatDate(device.installedAt) }}</dd>
      <dt>Last Heartbeat</dt>
      <dd :class="{ 'device-card__danger': isCritical }">{{ timeAgo(device.lastHeartbeat) }}</dd>
    </dl>

    <div v-if="device.sensors?.length" class="device-card__sensors">
      <h4 class="device-card__sensors-title">Sensors</h4>
      <div class="device-card__sensors-grid">
        <div v-for="sensor in device.sensors" :key="sensor.label" class="device-card__sensor">
          <span class="device-card__sensor-label">{{ sensor.label }}</span>
          <span
            class="device-card__sensor-value"
            :class="{
              'device-card__danger': sensor.status === 'critical',
              'device-card__warning': sensor.status === 'warning',
            }"
            >{{ sensor.value }}</span
          >
        </div>
      </div>
    </div>

    <div v-if="device.dependsOn" class="device-card__dependency">Requires Vehicle Gateway</div>
  </MCard>
</template>

<style scoped>
.device-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: border-color var(--mtv-duration-base);
}

.device-card--critical {
  border-color: var(--mtv-color-status-critical);
  animation: pulse-border var(--mtv-duration-slower) var(--mtv-ease-standard) infinite;
}

@keyframes pulse-border {
  0%,
  100% {
    border-color: var(--mtv-color-status-critical);
  }
  50% {
    border-color: var(--mtv-color-status-critical);
  }
}

.device-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.device-card__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--card-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mtv-color-surface-raised);
  color: var(--mtv-color-foreground-muted);
  flex-shrink: 0;
}

.device-card__icon--critical {
  background: var(--fleet-severity-critical-subtle);
  color: var(--mtv-color-status-critical);
}

.device-card__title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.device-card__type {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.device-card__name {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-card__details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.75rem;
  font-size: var(--font-size-xs);
}

.device-card__details dt {
  color: var(--mtv-color-foreground-muted);
}

.device-card__details dd {
  color: var(--mtv-color-foreground-default);
  margin: 0;
}

.device-card__mono {
  font-family: var(--font-family-mono);
}

.device-card__danger {
  color: var(--mtv-color-status-danger);
  font-weight: 600;
}

.device-card__dependency {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  padding-top: 0.5rem;
  border-top: 1px solid var(--mtv-color-border-default);
}

.device-card__sensors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--mtv-color-border-default);
}

.device-card__sensors-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}

.device-card__sensors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.device-card__sensor {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem;
  background: var(--mtv-color-surface-raised);
  border-radius: var(--radius);
}

.device-card__sensor-label {
  font-size: var(--font-size-2xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
}

.device-card__sensor-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.device-card__warning {
  color: var(--mtv-color-status-warning);
  font-weight: 600;
}
</style>
