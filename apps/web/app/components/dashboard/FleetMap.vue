<script setup lang="ts">
import { select } from 'd3-selection'
import 'd3-transition'
import { geoAlbersUsa, geoMercator, geoPath } from 'd3-geo'
import { easeBackOut } from 'd3-ease'
import type { FleetDriver, FleetDriverStatus } from '@motive/shared'
import { MButton, MCard } from '@motive/ui'

const router = useRouter()

const props = defineProps<{
  drivers: FleetDriver[]
}>()

const { geoData, loading } = useFleetMap()

const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

interface TooltipState {
  visible: boolean
  x: number
  y: number
  data: { driver: FleetDriver } | null
}

const tooltip = ref<TooltipState>({ visible: false, x: 0, y: 0, data: null })

const activeFilters = ref<Set<FleetDriverStatus>>(new Set())
const isFiltering = computed(() => activeFilters.value.size > 0)

function toggleFilter(status: FleetDriverStatus) {
  const next = new Set(activeFilters.value)
  if (next.has(status)) {
    next.delete(status)
  } else {
    next.add(status)
  }
  activeFilters.value = next
}

const statusCounts = computed(() => {
  const counts: Record<FleetDriverStatus, number> = {
    driving: 0,
    idle: 0,
    alert: 0,
    offline: 0,
    sleeper: 0,
  }
  for (const d of props.drivers) counts[d.status]++
  return counts
})

// Resolve design tokens to browser-computed colors for D3 SVG attributes.
const { readCSSColor, getCSSVar } = useCssColors()

const STATUS_LABELS: Record<FleetDriverStatus, string> = {
  driving: 'Driving',
  idle: 'Idle',
  alert: 'Alert',
  offline: 'Offline',
  sleeper: 'Sleeper',
}

// Only show statuses that have at least one driver
const activeLegendStatuses = computed(() => {
  const seen = new Set(props.drivers.map((d) => d.status))
  return (Object.keys(STATUS_LABELS) as FleetDriverStatus[]).filter((s) => seen.has(s))
})

function drawMap() {
  if (!svgRef.value || !containerRef.value || !geoData.value) return

  // Resolve CSS vars to browser-computed RGB values for SVG attribute compatibility
  const statusColors: Record<FleetDriverStatus, string> = {
    driving: readCSSColor('--fleet-status-driving', '#4ade80'),
    idle: readCSSColor('--fleet-status-idle', '#fbbf24'),
    alert: readCSSColor('--fleet-status-alert', '#f87171'),
    offline: readCSSColor('--fleet-status-offline', '#525252'),
    sleeper: readCSSColor('--fleet-status-sleeper', '#a78bfa'),
  }
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
    .attr('aria-label', 'Live fleet location map showing truck positions')

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

  // Project driver locations (respect active status filters)
  const visibleDrivers =
    activeFilters.value.size === 0
      ? props.drivers
      : props.drivers.filter((d) => activeFilters.value.has(d.status))

  const pinData = visibleDrivers
    .map((driver) => {
      const projected = projection([driver.currentLocation.lng, driver.currentLocation.lat])
      if (!projected) return null
      return { driver, x: projected[0], y: projected[1] }
    })
    .filter((d): d is { driver: FleetDriver; x: number; y: number } => d !== null)

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
    .attr('stroke', statusColors.alert)
    .attr('stroke-width', 1.5)
    .attr('opacity', 0.5)

  // Driver pins — circles by status color
  pinsGroup
    .selectAll('.pin')
    .data(pinData)
    .join('circle')
    .attr('class', 'pin')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', 0)
    .attr('fill', (d) => statusColors[d.driver.status])
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
        data: { driver: d.driver },
      }
    })
    .on('mouseleave', () => {
      tooltip.value.visible = false
    })
}

watch(
  [geoData, () => props.drivers, activeFilters],
  () => {
    nextTick(drawMap)
  },
  { deep: true },
)

// Redraw when the theme changes
useThemeObserver(drawMap)

onMounted(() => {
  if (geoData.value) drawMap()

  const ro = new ResizeObserver(() => drawMap())
  if (containerRef.value) ro.observe(containerRef.value)
  onUnmounted(() => ro.disconnect())
})

function formatHos(driver: FleetDriver): string {
  const h = driver.hos.driveRemaining
  if (h <= 0) return 'Violation'
  return `${h.toFixed(1)}h drive left`
}
</script>

<template>
  <MCard padding="lg" title="Fleet" class="fleet-map">
    <template #action>
      <MButton variant="link" size="sm" @click="router.push('/fleet/live')">Fleet view</MButton>
    </template>

    <!-- Map Canvas -->
    <div
      ref="containerRef"
      class="fleet-map__canvas"
      role="figure"
      aria-label="Live fleet map showing truck positions"
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
          <div v-if="tooltip.data.driver.vehicleUnitNumber" class="fleet-map__tooltip-load">
            Unit {{ tooltip.data.driver.vehicleUnitNumber }}
          </div>
          <div
            class="fleet-map__tooltip-hos"
            :class="{ 'fleet-map__tooltip-hos--violation': tooltip.data.driver.hos.hasViolation }"
          >
            {{ formatHos(tooltip.data.driver) }}
          </div>
        </div>
      </Transition>
    </div>

    <!-- Legend -->
    <div class="fleet-map__legend" aria-label="Map legend">
      <button
        v-for="status in activeLegendStatuses"
        :key="status"
        class="fleet-map__legend-item"
        :class="{ 'fleet-map__legend-item--dimmed': isFiltering && !activeFilters.has(status) }"
        :aria-pressed="activeFilters.has(status)"
        @click="toggleFilter(status)"
      >
        <span
          class="fleet-map__legend-dot"
          :style="{ backgroundColor: `var(--fleet-status-${status})` }"
          aria-hidden="true"
        />
        <span class="fleet-map__legend-label">{{ STATUS_LABELS[status] }}</span>
        <span class="fleet-map__legend-count">{{ statusCounts[status] }}</span>
      </button>
    </div>
  </MCard>
</template>

<style scoped>
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
  color: var(--fleet-severity-success);
}

/* Legend */

.fleet-map__legend {
  display: flex;
  justify-content: space-between;
}

.fleet-map__legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  transition: opacity 150ms ease;
}

.fleet-map__legend-item--dimmed {
  opacity: 0.35;
}

.fleet-map__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.fleet-map__legend-label {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
  letter-spacing: var(--tracking-normal);
}

.fleet-map__legend-count {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--mtv-color-foreground-default);
  letter-spacing: var(--tracking-normal);
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
