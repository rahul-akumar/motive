<script setup lang="ts">
import { select } from 'd3-selection'
import 'd3-transition'
import { geoAlbersUsa, geoMercator, geoPath } from 'd3-geo'
import { easeBackOut } from 'd3-ease'
import type { Driver, DriverStatus, FuelLossEvent } from '@motive/shared'

const props = defineProps<{
  drivers: Driver[]
  fuelLossEvents: FuelLossEvent[]
}>()

const { geoData, loading } = useFleetMap()

const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

type TooltipData = { driver: Driver; fuelLoss?: FuelLossEvent }

interface TooltipState {
  visible: boolean
  x: number
  y: number
  data: TooltipData | null
}

const tooltip = ref<TooltipState>({ visible: false, x: 0, y: 0, data: null })

// CANVAS-COLORS: Keep as hex. D3 passes these as SVG fill/stroke attributes; oklch is not supported in SVG presentation attributes.
// Fuel loss orange is the SVG-safe equivalent of --mtv-color-status-warning.
const FUEL_LOSS_ORANGE = '#f97316' // --mtv-color-status-warning
const STATUS_COLORS: Record<DriverStatus, string> = {
  driving: '#4ade80', // green-400 — active/moving
  idle: '#fbbf24', // amber-400 — waiting
  alert: '#f87171', // red-400 — needs attention
  offline: '#525252', // neutral-600 — unavailable
  sleeper: '#a78bfa', // violet-400 — resting
}

const STATUS_LABELS: Record<DriverStatus, string> = {
  driving: 'Driving',
  idle: 'Idle',
  alert: 'Alert',
  offline: 'Offline',
  sleeper: 'Sleeper',
}

// Only show statuses that have at least one driver
const activeLegendStatuses = computed(() => {
  const seen = new Set(props.drivers.map((d) => d.status))
  return (Object.keys(STATUS_COLORS) as DriverStatus[]).filter((s) => seen.has(s))
})

function getCSSVar(name: string): string {
  if (!import.meta.client) return '#333'
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function drawMap() {
  if (!svgRef.value || !containerRef.value || !geoData.value) return

  // Build vehicleId → FuelLossEvent lookup for O(1) access during pin rendering
  const fuelByVehicle = new Map<string, FuelLossEvent>(
    props.fuelLossEvents.map((e) => [e.vehicleId, e]),
  )

  const bgCard = getCSSVar('--bg-card') || '#111111'
  const borderColor = getCSSVar('--border') || 'rgba(255,255,255,0.07)'
  const borderStrong = getCSSVar('--border-strong') || 'rgba(255,255,255,0.12)'

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight || 260

  select(svgRef.value).selectAll('*').remove()

  const svg = select(svgRef.value)
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', 'Live fleet location map showing truck positions and fuel theft events')

  // Projection — AlbersUSA for US (handles AK + HI); Mercator fitted to country outline for MX/UK
  const projection =
    geoData.value.region === 'us'
      ? geoAlbersUsa().fitSize([width, height], geoData.value.featureCollection as never)
      : geoMercator().fitSize([width, height], geoData.value.featureCollection as never)

  const pathGen = geoPath().projection(projection)

  // Region fills
  svg
    .append('g')
    .attr('class', 'states')
    .selectAll('path')
    .data(geoData.value.featureCollection.features)
    .join('path')
    .attr('d', pathGen as never)
    .attr('fill', bgCard)
    .attr('stroke', borderColor)
    .attr('stroke-width', 0.5)

  // Region borders (stronger)
  svg
    .append('g')
    .attr('class', 'state-borders')
    .selectAll('path')
    .data(geoData.value.featureCollection.features)
    .join('path')
    .attr('d', pathGen as never)
    .attr('fill', 'none')
    .attr('stroke', borderStrong)
    .attr('stroke-width', 0.3)

  // Project driver locations
  const pinData = props.drivers
    .map((driver) => {
      const projected = projection([driver.currentLocation.lng, driver.currentLocation.lat])
      if (!projected) return null
      return {
        driver,
        fuelLoss: fuelByVehicle.get(driver.vehicleId),
        x: projected[0],
        y: projected[1],
      }
    })
    .filter(
      (d): d is { driver: Driver; fuelLoss: FuelLossEvent | undefined; x: number; y: number } =>
        d !== null,
    )

  const pinsGroup = svg.append('g').attr('class', 'pins')

  // Alert pulse rings (drawn behind pins)
  pinsGroup
    .selectAll('.pin-ring')
    .data(pinData.filter((d) => d.driver.status === 'alert'))
    .join('circle')
    .attr('class', 'pin-ring')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', 10)
    .attr('fill', 'none')
    .attr('stroke', STATUS_COLORS.alert)
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.5)

  // Truck pins — orange when the vehicle has an active fuel loss event
  pinsGroup
    .selectAll('.pin')
    .data(pinData)
    .join('circle')
    .attr('class', 'pin')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', 0)
    .attr('fill', (d) => (d.fuelLoss ? FUEL_LOSS_ORANGE : STATUS_COLORS[d.driver.status]))
    .attr('stroke', bgCard)
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .transition()
    .delay((_, i) => i * 40)
    .duration(250)
    .ease(easeBackOut)
    .attr('r', 6)

  // Invisible hover targets (larger hit area)
  pinsGroup
    .selectAll('.pin-hit')
    .data(pinData)
    .join('circle')
    .attr('class', 'pin-hit')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', 14)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('mouseenter', (event, d) => {
      const rect = containerRef.value?.getBoundingClientRect()
      if (!rect) return
      // Keep tooltip inside container bounds
      const tx = Math.min(Math.max(event.clientX - rect.left, 80), rect.width - 80)
      const ty = Math.max(event.clientY - rect.top - 70, 4)
      tooltip.value = {
        visible: true,
        x: tx,
        y: ty,
        data: { driver: d.driver, fuelLoss: d.fuelLoss },
      }
    })
    .on('mouseleave', () => {
      tooltip.value.visible = false
    })
}

// Watch for geo data load + driver changes + fuel events
watch(
  [geoData, () => props.drivers, () => props.fuelLossEvents],
  () => {
    nextTick(drawMap)
  },
  { deep: true },
)

let themeObserver: MutationObserver | null = null

onMounted(() => {
  if (geoData.value) drawMap()

  const ro = new ResizeObserver(() => drawMap())
  if (containerRef.value) ro.observe(containerRef.value)
  onUnmounted(() => ro.disconnect())

  themeObserver = new MutationObserver(() => drawMap())
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  onUnmounted(() => themeObserver?.disconnect())
})

function formatHos(driver: Driver): string {
  const h = driver.hos.drivingRemaining
  if (h <= 0) return 'Violation'
  return `${h.toFixed(1)}h drive left`
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
</script>

<template>
  <div class="fleet-map fleet-card">
    <!-- Header -->
    <div class="fleet-map__header">
      <div>
        <h2 class="fleet-map__title">Fleet Locations</h2>
        <p class="fleet-map__subtitle font-mono-data">{{ drivers.length }} trucks · live</p>
      </div>
      <div class="fleet-map__live">
        <span class="fleet-map__live-dot" aria-hidden="true" />
        <span class="fleet-map__live-label">LIVE</span>
      </div>
    </div>

    <!-- Map Canvas -->
    <div
      ref="containerRef"
      class="fleet-map__canvas"
      role="figure"
      aria-label="Live fleet map showing truck positions and fuel theft events"
    >
      <!-- Loading skeleton -->
      <div v-if="loading" class="fleet-map__skeleton" aria-hidden="true">
        <div class="fleet-map__skeleton-inner" />
      </div>

      <svg v-show="!loading" ref="svgRef" class="fleet-map__svg" />

      <!-- Tooltip -->
      <Transition name="map-tooltip">
        <div
          v-if="tooltip.visible && tooltip.data"
          class="chart-tooltip fleet-map__tooltip"
          :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px`, transform: 'translateX(-50%)' }"
          role="tooltip"
          aria-live="polite"
        >
          <div class="fleet-map__tooltip-name">{{ tooltip.data.driver.name }}</div>
          <div class="fleet-map__tooltip-location">
            {{ tooltip.data.driver.currentLocation.city }},
            {{ tooltip.data.driver.currentLocation.state }}
          </div>
          <div v-if="tooltip.data.driver.currentLoad" class="fleet-map__tooltip-load">
            {{ tooltip.data.driver.currentLoad }}
          </div>
          <div
            class="fleet-map__tooltip-hos"
            :class="{ 'fleet-map__tooltip-hos--violation': tooltip.data.driver.hos.hasViolation }"
          >
            {{ formatHos(tooltip.data.driver) }}
          </div>
          <div v-if="tooltip.data.fuelLoss" class="fleet-map__tooltip-fuel-drop">
            &#x2212;{{ tooltip.data.fuelLoss.fuelDrop }}% fuel &middot;
            {{ timeAgo(tooltip.data.fuelLoss.startTime) }}
          </div>
        </div>
      </Transition>
    </div>

    <!-- Legend -->
    <div class="fleet-map__legend" role="list" aria-label="Map legend">
      <div
        v-for="status in activeLegendStatuses"
        :key="status"
        class="fleet-map__legend-item"
        role="listitem"
      >
        <span
          class="fleet-map__legend-dot"
          :style="{ backgroundColor: STATUS_COLORS[status] }"
          aria-hidden="true"
        />
        <span class="fleet-map__legend-label">{{ STATUS_LABELS[status] }}</span>
      </div>
      <div v-if="fuelLossEvents.length > 0" class="fleet-map__legend-item" role="listitem">
        <span
          class="fleet-map__legend-dot"
          :style="{ backgroundColor: '#f97316' }"
          aria-hidden="true"
        />
        <span class="fleet-map__legend-label">Fuel Loss</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fleet-map {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

/* Header */
.fleet-map__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.fleet-map__title {
  font-family: var(--font-family-condensed);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--mtv-color-foreground-default);
  letter-spacing: var(--tracking-tight);
  margin: 0;
}

.fleet-map__subtitle {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  margin: 2px 0 0;
  letter-spacing: var(--tracking-widest);
}

/* Live indicator */
.fleet-map__live {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.fleet-map__live-dot {
  width: 8px;
  height: 8px;
  border-radius: 25%;
  background-color: oklch(0.793 0.209 153.6);
  animation: live-pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

.fleet-map__live-label {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-loose);
  color: var(--mtv-color-foreground-subtle);
}

/* Canvas */
.fleet-map__canvas {
  position: relative;
  height: 260px;
  width: 100%;
}

.fleet-map__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Alert ring pulse animation — applied via CSS on SVG elements */
:deep(.pin-ring) {
  animation: alert-ring 1.6s ease-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes alert-ring {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

/* Loading skeleton */
.fleet-map__skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fleet-map__skeleton-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    oklch(1 0 0 / 0.02) 25%,
    oklch(1 0 0 / 0.04) 50%,
    oklch(1 0 0 / 0.02) 75%
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

/* Tooltip */
.fleet-map__tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  min-width: 140px;
}

.fleet-map__tooltip-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  margin-bottom: 2px;
}

.fleet-map__tooltip-location {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  margin-bottom: 4px;
}

.fleet-map__tooltip-load {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-subtle);
  margin-bottom: 2px;
}

.fleet-map__tooltip-hos {
  font-size: var(--font-size-xs);
  color: oklch(0.793 0.209 153.6);
}

/* Fuel loss line in driver tooltip */
.fleet-map__tooltip-fuel-drop {
  font-size: var(--font-size-xs);
  font-family: var(--font-family-mono);
  color: var(--mtv-color-status-warning);
  font-weight: var(--font-weight-semibold);
  margin-top: 2px;
}

/* Legend */

.fleet-map__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.fleet-map__legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.fleet-map__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.fleet-map__legend-label {
  font-size: var(--font-size-xs);
  color: var(--mtv-color-foreground-muted);
  font-family: var(--font-family-mono);
  letter-spacing: var(--tracking-tight);
}

/* Tooltip transition */
.map-tooltip-enter-active,
.map-tooltip-leave-active {
  transition: opacity 100ms ease;
}

.map-tooltip-enter-from,
.map-tooltip-leave-to {
  opacity: 0;
}
</style>
