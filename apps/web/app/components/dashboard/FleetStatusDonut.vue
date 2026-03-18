<script setup lang="ts">
import { select } from 'd3-selection'
import 'd3-transition'
import { pie, arc } from 'd3-shape'
import type { PieArcDatum } from 'd3-shape'
import { easeQuadOut } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import type { FleetStatusCount } from '@motive/shared'

const props = defineProps<{
  status: FleetStatusCount
}>()

const svgRef = ref<SVGSVGElement | null>(null)

// Read CSS custom properties from the document root at draw time
function getCSSVar(name: string): string {
  if (!import.meta.client) return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const segments = computed(() => [
  {
    key: 'driving',
    label: 'Driving',
    value: props.status.driving,
    color: getCSSVar('--accent') || '#e2e2e2',
  },
  { key: 'idle', label: 'Idle', value: props.status.idle, color: '#d97706' },
  {
    key: 'offline',
    label: 'Offline',
    value: props.status.offline,
    color: getCSSVar('--text-muted') || '#2a2a2a',
  },
  { key: 'alert', label: 'Alert', value: props.status.alert, color: '#dc2626' },
])

function drawChart() {
  if (!svgRef.value) return

  const accentColor = getCSSVar('--accent') || '#e2e2e2'
  const textPrimary = getCSSVar('--text-primary') || '#e2e2e2'
  const textMuted = getCSSVar('--text-muted') || '#2a2a2a'

  const currentSegments = [
    { key: 'driving', label: 'Driving', value: props.status.driving, color: accentColor },
    { key: 'idle', label: 'Idle', value: props.status.idle, color: '#d97706' },
    { key: 'offline', label: 'Offline', value: props.status.offline, color: textMuted },
    { key: 'alert', label: 'Alert', value: props.status.alert, color: '#dc2626' },
  ]

  const size = 200
  const radius = size / 2
  const innerRadius = radius * 0.62
  const outerRadius = radius * 0.92

  select(svgRef.value).selectAll('*').remove()

  const svg = select(svgRef.value)
    .attr('width', size)
    .attr('height', size)
    .attr('role', 'img')
    .attr(
      'aria-label',
      `Fleet status: ${props.status.driving} driving, ${props.status.idle} idle, ${props.status.offline} offline, ${props.status.alert} alert`,
    )

  const g = svg.append('g').attr('transform', `translate(${radius},${radius})`)

  const pieLayout = pie<(typeof currentSegments)[0]>()
    .value((d) => d.value)
    .sort(null)
    .padAngle(0.03)

  const arcGen = arc<PieArcDatum<(typeof currentSegments)[0]>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

  const arcHover = arc<PieArcDatum<(typeof currentSegments)[0]>>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius + 3)

  const arcs = pieLayout(currentSegments)

  // Draw arcs
  g.selectAll('.arc')
    .data(arcs)
    .join('path')
    .attr('class', 'arc')
    .attr('fill', (d) => d.data.color)
    .attr('opacity', 0.85)
    .style('cursor', 'pointer')
    .style('transition', 'opacity 150ms ease')
    .on('mouseenter', function (_, d) {
      select(this)
        .transition()
        .duration(150)
        .attr('d', arcHover(d) || '')
        .attr('opacity', 1)
    })
    .on('mouseleave', function (_, d) {
      select(this)
        .transition()
        .duration(150)
        .attr('d', arcGen(d) || '')
        .attr('opacity', 0.85)
    })
    .attr('d', (d) => {
      const startArc = arc<PieArcDatum<(typeof currentSegments)[0]>>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
      return startArc({ ...d, endAngle: d.startAngle }) || ''
    })
    .transition()
    .duration(900)
    .delay((_, i) => i * 80)
    .ease(easeQuadOut)
    .attrTween('d', function (d) {
      const interp = interpolate(d.startAngle, d.endAngle)
      return (t: number) => {
        const arcData = { ...d, endAngle: interp(t) }
        return arcGen(arcData) || ''
      }
    })

  // Center text
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.2em')
    .attr('fill', textPrimary)
    .attr(
      'font-family',
      getComputedStyle(document.documentElement).getPropertyValue('--font-family-condensed').trim(),
    )
    .attr('font-size', '28px')
    .attr('font-weight', '700')
    .text(props.status.total)

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.2em')
    .attr('fill', textMuted)
    .attr(
      'font-family',
      getComputedStyle(document.documentElement).getPropertyValue('--font-family-mono').trim(),
    )
    .attr('font-size', '9px')
    .attr('letter-spacing', '0.08em')
    .text('VEHICLES')
}

// Watch for theme changes
let themeObserver: MutationObserver | null = null

onMounted(() => {
  drawChart()

  themeObserver = new MutationObserver(() => {
    drawChart()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  onUnmounted(() => themeObserver?.disconnect())
})

watch(() => props.status, drawChart, { deep: true })
</script>

<template>
  <div class="fleet-donut fleet-card">
    <div class="fleet-donut__header">
      <h2 class="fleet-donut__title">Fleet Status</h2>
      <p class="fleet-donut__subtitle font-mono-data">Real-time</p>
    </div>

    <div class="fleet-donut__body">
      <!-- Chart -->
      <div class="fleet-donut__chart-wrap" role="figure">
        <svg ref="svgRef" aria-label="Fleet status donut chart" />
      </div>

      <!-- Legend -->
      <div class="fleet-donut__legend" role="list">
        <div
          v-for="seg in segments"
          :key="seg.key"
          class="fleet-donut__legend-item"
          role="listitem"
        >
          <div class="fleet-donut__legend-row">
            <span
              class="fleet-donut__legend-dot"
              :style="{ backgroundColor: seg.color }"
              aria-hidden="true"
            />
            <span class="fleet-donut__legend-label">{{ seg.label }}</span>
          </div>
          <span class="fleet-donut__legend-value font-mono-data">{{ seg.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fleet-donut {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fleet-donut__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.fleet-donut__title {
  font-family: var(--font-family-condensed);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
  margin: 0;
}

.fleet-donut__subtitle {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 2px 0 0;
  letter-spacing: var(--tracking-wide);
}

.fleet-donut__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.fleet-donut__chart-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.fleet-donut__legend {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 1rem;
}

.fleet-donut__legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fleet-donut__legend-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fleet-donut__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.fleet-donut__legend-label {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.fleet-donut__legend-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-widest);
}
</style>
