<script setup lang="ts">
import { MapPin, Navigation, ChevronDown, ChevronRight, Thermometer } from 'lucide-vue-next'
import { MBadge, MIcon } from '@motive/ui'
import type { FleetVehicle, FleetDriver, FleetVehicleStatus } from '@motive/shared'

defineProps<{
  vehicle: FleetVehicle
  driver?: FleetDriver
  isJammed: boolean
  isZoneFrozen: boolean
  elapsedSeconds: number
}>()

const { formatDistance } = useFormatters()

const immobilizerExpanded = ref(true)
const telematicsExpanded = ref(false)
const tpmsExpanded = ref(false)

const STATUS_BADGE: Record<
  FleetVehicleStatus,
  { color: 'success' | 'warning' | 'danger' | 'default'; label: string }
> = {
  active: { color: 'success', label: 'Active' },
  idle: { color: 'warning', label: 'Idle' },
  'out-of-service': { color: 'danger', label: 'Out of Service' },
  maintenance: { color: 'default', label: 'Maintenance' },
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}
</script>

<template>
  <aside class="vehicle-live__panel">
    <!-- Status -->
    <div class="vehicle-live__section">
      <h3 class="vehicle-live__section-title">Status</h3>
      <div class="vehicle-live__status-row">
        <MBadge
          :label="STATUS_BADGE[vehicle.status].label"
          :color="STATUS_BADGE[vehicle.status].color"
          size="sm"
        />
      </div>
    </div>

    <!-- Telematics -->
    <div class="vehicle-live__card">
      <div class="vehicle-live__card-header">
        <div class="vehicle-live__card-header-left">
          <span class="vehicle-live__card-title">Telematics</span>
          <span class="vehicle-live__card-meta">23d ago</span>
        </div>
        <div class="vehicle-live__card-header-right">
          <MIcon :icon="Thermometer" :size="16" class="vehicle-live__card-icon--danger" />
        </div>
      </div>

      <div class="vehicle-live__card-body">
        <div class="vehicle-live__metrics">
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">FUEL</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">DEF</span>
            <span class="vehicle-live__metric-value">9%</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">ENGINE LOAD</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
        </div>

        <div v-if="telematicsExpanded" class="vehicle-live__metrics">
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">COOLANT</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">OIL PRESS</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">12V BATTERY</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
        </div>
        <div v-if="telematicsExpanded" class="vehicle-live__metrics">
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">AIR TEMP</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">BAROMETRIC</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">INTAKE TEMP</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
        </div>

        <button class="vehicle-live__show-more" @click="telematicsExpanded = !telematicsExpanded">
          {{ telematicsExpanded ? 'SHOW LESS' : 'SHOW MORE' }}
          <MIcon :icon="telematicsExpanded ? ChevronDown : ChevronDown" :size="12" />
        </button>
      </div>
    </div>

    <!-- Engine Immobilizer (collapsible) -->
    <div v-if="isJammed" class="vehicle-live__card">
      <button class="vehicle-live__card-header" @click="immobilizerExpanded = !immobilizerExpanded">
        <div class="vehicle-live__card-header-left">
          <span class="vehicle-live__card-title">Engine Immobilizer</span>
          <span class="vehicle-live__card-meta">{{ formatElapsed(elapsedSeconds) }}</span>
        </div>
        <div class="vehicle-live__card-header-right">
          <MBadge
            :label="isZoneFrozen ? 'Activated' : 'Jammed'"
            :color="isZoneFrozen ? 'success' : 'danger'"
            size="sm"
          />
          <MIcon
            :icon="immobilizerExpanded ? ChevronDown : ChevronRight"
            :size="14"
            class="vehicle-live__card-chevron"
          />
        </div>
      </button>

      <div v-if="immobilizerExpanded" class="vehicle-live__card-body">
        <div class="vehicle-live__metrics">
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">GPS</span>
            <span class="vehicle-live__metric-value vehicle-live__danger">Jammed</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">CELLULAR</span>
            <span class="vehicle-live__metric-value vehicle-live__danger">Jammed</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">JAMMING</span>
            <span class="vehicle-live__metric-value vehicle-live__danger">Detected</span>
          </div>
        </div>
        <div class="vehicle-live__metrics">
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">BATTERY</span>
            <span class="vehicle-live__metric-value">94%</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">RELAY</span>
            <span
              class="vehicle-live__metric-value"
              :class="isZoneFrozen ? 'vehicle-live__success' : 'vehicle-live__danger'"
              >{{ isZoneFrozen ? 'Engaged' : 'Armed' }}</span
            >
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">TAMPER</span>
            <span class="vehicle-live__metric-value">Clear</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TPMS (collapsible) -->
    <div class="vehicle-live__card">
      <button class="vehicle-live__card-header" @click="tpmsExpanded = !tpmsExpanded">
        <div class="vehicle-live__card-header-left">
          <span class="vehicle-live__card-title">TPMS</span>
          <span class="vehicle-live__card-meta">0/10 tires</span>
        </div>
        <div class="vehicle-live__card-header-right">
          <MBadge label="Critical" color="danger" size="sm" />
          <MIcon
            :icon="tpmsExpanded ? ChevronDown : ChevronRight"
            :size="14"
            class="vehicle-live__card-chevron"
          />
        </div>
      </button>

      <div v-if="tpmsExpanded" class="vehicle-live__card-body">
        <div class="vehicle-live__metrics">
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">FRONT L</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">FRONT R</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
          <div class="vehicle-live__metric">
            <span class="vehicle-live__metric-label">REAR L</span>
            <span class="vehicle-live__metric-value vehicle-live__muted">—</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Location -->
    <div class="vehicle-live__section">
      <h3 class="vehicle-live__section-title">Location</h3>
      <div class="vehicle-live__info-row">
        <MIcon :icon="MapPin" :size="14" class="vehicle-live__info-icon" />
        <span>{{ vehicle.currentLocation.city }}, {{ vehicle.currentLocation.state }}</span>
      </div>
      <div class="vehicle-live__info-row">
        <MIcon :icon="Navigation" :size="14" class="vehicle-live__info-icon" />
        <span class="vehicle-live__coords">
          {{ vehicle.currentLocation.lat.toFixed(4) }},
          {{ vehicle.currentLocation.lng.toFixed(4) }}
        </span>
      </div>
    </div>

    <!-- Vehicle Info -->
    <div class="vehicle-live__section">
      <h3 class="vehicle-live__section-title">Vehicle Info</h3>
      <dl class="vehicle-live__dl">
        <dt>Unit</dt>
        <dd>{{ vehicle.unitNumber }}</dd>
        <dt>Make / Model</dt>
        <dd>{{ vehicle.make }} {{ vehicle.model }}</dd>
        <dt>Year</dt>
        <dd>{{ vehicle.year }}</dd>
        <dt>Mileage</dt>
        <dd>{{ formatDistance(vehicle.mileage) }}</dd>
      </dl>
    </div>

    <!-- Assigned Driver -->
    <div v-if="driver" class="vehicle-live__section">
      <h3 class="vehicle-live__section-title">Assigned Driver</h3>
      <dl class="vehicle-live__dl">
        <dt>Name</dt>
        <dd>{{ driver.name }}</dd>
        <dt>ID</dt>
        <dd>{{ driver.id }}</dd>
        <dt>Status</dt>
        <dd>{{ driver.status }}</dd>
        <dt>Phone</dt>
        <dd>{{ driver.phone }}</dd>
      </dl>
    </div>

    <!-- Attached Asset -->
    <div v-if="vehicle.assetName" class="vehicle-live__section">
      <h3 class="vehicle-live__section-title">Attached Asset</h3>
      <dl class="vehicle-live__dl">
        <dt>Asset</dt>
        <dd>{{ vehicle.assetName }}</dd>
      </dl>
    </div>

    <!-- Equipment -->
    <div class="vehicle-live__section">
      <h3 class="vehicle-live__section-title">Equipment</h3>
      <dl class="vehicle-live__dl">
        <dt>Cameras</dt>
        <dd>{{ vehicle.cameras }}</dd>
        <dt>Defects</dt>
        <dd :class="{ 'vehicle-live__danger': vehicle.defects > 0 }">{{ vehicle.defects }}</dd>
      </dl>
    </div>
  </aside>
</template>

<style scoped>
.vehicle-live__panel {
  width: 400px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background-color: var(--mtv-color-surface-base);
  border-right: 1px solid var(--mtv-color-border-default);
}

/* Collapsible card sections */
.vehicle-live__card {
  border: 1px solid var(--mtv-color-border-default);
  border-radius: 8px;
  overflow: hidden;
}

.vehicle-live__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  gap: 0.5rem;
}

.vehicle-live__card-header:hover {
  background: var(--mtv-color-surface-hover);
}

.vehicle-live__card-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.vehicle-live__card-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.vehicle-live__card-icon--danger {
  color: var(--mtv-color-status-critical);
  flex-shrink: 0;
}

.vehicle-live__card-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
  white-space: nowrap;
}

.vehicle-live__card-meta {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  white-space: nowrap;
}

.vehicle-live__card-chevron {
  color: var(--mtv-color-foreground-muted);
}

.vehicle-live__card-body {
  padding: 0 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.vehicle-live__show-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  border-top: 1px solid var(--mtv-color-border-default);
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--mtv-color-foreground-muted);
  transition: color 150ms ease;
}

.vehicle-live__show-more:hover {
  color: var(--mtv-color-foreground-default);
}

/* Metrics grid (like the FUEL / DEF / ENGINE LOAD row) */
.vehicle-live__metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  padding: 0.5rem 0;
  border-top: 1px solid var(--mtv-color-border-default);
}

.vehicle-live__metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.vehicle-live__metric-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
}

.vehicle-live__metric-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

/* Standard sections */
.vehicle-live__section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vehicle-live__section-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.vehicle-live__status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vehicle-live__info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-default);
}

.vehicle-live__info-icon {
  color: var(--mtv-color-foreground-subtle);
  flex-shrink: 0;
}

.vehicle-live__coords {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
}

.vehicle-live__dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.75rem;
  font-size: var(--font-size-sm);
}

.vehicle-live__dl dt {
  color: var(--mtv-color-foreground-muted);
}

.vehicle-live__dl dd {
  color: var(--mtv-color-foreground-default);
  margin: 0;
}

.vehicle-live__danger {
  color: var(--mtv-color-status-danger);
  font-weight: 600;
}

.vehicle-live__success {
  color: var(--mtv-color-status-success);
  font-weight: 600;
}

.vehicle-live__muted {
  color: var(--mtv-color-foreground-muted);
}

@media (max-width: 768px) {
  .vehicle-live__panel {
    top: auto;
    left: 0.5rem;
    right: 0.5rem;
    bottom: 0.5rem;
    width: auto;
    max-height: 50%;
  }
}
</style>
