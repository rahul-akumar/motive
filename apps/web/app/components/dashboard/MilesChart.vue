<script setup lang="ts">
import { select } from 'd3-selection'
import 'd3-transition'
import { scaleBand, scaleLinear } from 'd3-scale'
import { max } from 'd3-array'
import { area, line, curveCatmullRom } from 'd3-shape'
import { easeQuadOut } from 'd3-ease'
import { axisBottom, axisLeft } from 'd3-axis'
import type { DailyMilesData } from '@motive/shared'

const props = defineProps<{
  data: DailyMilesData[]
}>()

const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const tooltip = ref({ visible: false, x: 0, y: 0, label: '', miles: 0, trips: 0 })

const margin = { top: 16, right: 16, bottom: 32, left: 52 }

// Read CSS custom properties from the document root at draw time
function getCSSVar(name: string): string {
  if (!import.meta.client) return '#e2e2e2'
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function drawChart() {
  if (!svgRef.value || !containerRef.value || !props.data.length) return

  const accentColor = getCSSVar('--accent') || '#1b4dff'
  const bgCard = getCSSVar('--bg-card') || '#0f1420'
  const textMuted = getCSSVar('--text-muted') || '#334155'

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight || 200
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Clear previous
  select(svgRef.value).selectAll('*').remove()

  const svg = select(svgRef.value)
    .attr('width', width)
    .attr('height', height)
    .attr('role', 'img')
    .attr('aria-label', '7-day miles driven chart')

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Scales
  const xScale = scaleBand()
    .domain(props.data.map((d) => d.label))
    .range([0, innerWidth])
    .padding(0.3)

  const yMax = max(props.data, (d) => d.miles) || 0
  const yScale = scaleLinear()
    .domain([0, yMax * 1.15])
    .range([innerHeight, 0])

  // Grid lines
  const yTicks = yScale.ticks(4)
  g.append('g')
    .attr('class', 'grid')
    .selectAll('line')
    .data(yTicks)
    .join('line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', (d) => yScale(d))
    .attr('y2', (d) => yScale(d))
    .attr('stroke', 'rgba(255,255,255,0.04)')
    .attr('stroke-width', 1)

  // Area — flat fill, no gradient
  const areaGen = area<DailyMilesData>()
    .x((d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
    .y0(innerHeight)
    .y1((d) => yScale(d.miles))
    .curve(curveCatmullRom.alpha(0.5))

  g.append('path').datum(props.data).attr('fill', `${accentColor}08`).attr('d', areaGen)

  // Line
  const lineGen = line<DailyMilesData>()
    .x((d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
    .y((d) => yScale(d.miles))
    .curve(curveCatmullRom.alpha(0.5))

  const linePath = g
    .append('path')
    .datum(props.data)
    .attr('fill', 'none')
    .attr('stroke', accentColor)
    .attr('stroke-width', 2)
    .attr('d', lineGen)

  // Animate line draw
  const totalLength = (linePath.node() as SVGPathElement)?.getTotalLength() || 0
  linePath
    .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(1200)
    .ease(easeQuadOut)
    .attr('stroke-dashoffset', 0)

  // Today's highlight line (last data point)
  const lastPoint = props.data[props.data.length - 1]
  if (lastPoint) {
    const lx = (xScale(lastPoint.label) || 0) + xScale.bandwidth() / 2
    g.append('line')
      .attr('x1', lx)
      .attr('x2', lx)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', `${accentColor}30`)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
  }

  // Data points
  g.selectAll('.dot')
    .data(props.data)
    .join('circle')
    .attr('class', 'dot')
    .attr('cx', (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
    .attr('cy', (d) => yScale(d.miles))
    .attr('r', 0)
    .attr('fill', accentColor)
    .attr('stroke', bgCard)
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .transition()
    .delay((_, i) => 800 + i * 60)
    .duration(200)
    .attr('r', (_, i) => (i === props.data.length - 1 ? 5 : 4))

  // Hover overlay
  g.selectAll('.hover-area')
    .data(props.data)
    .join('rect')
    .attr('class', 'hover-area')
    .attr('x', (d) => xScale(d.label) || 0)
    .attr('y', 0)
    .attr('width', xScale.bandwidth())
    .attr('height', innerHeight)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('mouseenter', (event, d) => {
      const rect = containerRef.value?.getBoundingClientRect()
      if (!rect) return
      tooltip.value = {
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 60,
        label: d.label,
        miles: d.miles,
        trips: d.trips,
      }
    })
    .on('mouseleave', () => {
      tooltip.value.visible = false
    })

  // X Axis
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(axisBottom(xScale).tickSize(0))
    .call((g) => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', textMuted)
    .attr('font-size', '11px')
    .attr('font-family', '"IBM Plex Mono", monospace')
    .attr('dy', '1.2em')

  // Y Axis
  g.append('g')
    .call(
      axisLeft(yScale)
        .ticks(4)
        .tickSize(0)
        .tickFormat((d) => `${(+d / 1000).toFixed(0)}k`),
    )
    .call((g) => g.select('.domain').remove())
    .selectAll('text')
    .attr('fill', textMuted)
    .attr('font-size', '11px')
    .attr('font-family', '"IBM Plex Mono", monospace')
    .attr('dx', '-0.5em')
}

// Watch for theme changes by observing the data-theme attribute
let themeObserver: MutationObserver | null = null

onMounted(() => {
  drawChart()
  const ro = new ResizeObserver(() => drawChart())
  if (containerRef.value) ro.observe(containerRef.value)
  onUnmounted(() => ro.disconnect())

  // Redraw when theme changes
  themeObserver = new MutationObserver(() => {
    drawChart()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  onUnmounted(() => themeObserver?.disconnect())
})

watch(() => props.data, drawChart, { deep: true })
</script>

<template>
  <div class="miles-chart fleet-card">
    <div class="miles-chart__header">
      <div>
        <h2 class="miles-chart__title">Miles Driven</h2>
        <p class="miles-chart__subtitle font-mono-data">7-day trend</p>
      </div>
      <div class="miles-chart__legend">
        <span class="miles-chart__legend-dot miles-chart__legend-dot--accent" aria-hidden="true" />
        <span class="miles-chart__legend-label">Daily Miles</span>
        <span
          class="miles-chart__legend-dot miles-chart__legend-dot--accent miles-chart__legend-dot--today"
          aria-hidden="true"
        />
        <span class="miles-chart__legend-label">Today</span>
      </div>
    </div>
    <div
      ref="containerRef"
      class="miles-chart__canvas"
      role="figure"
      aria-label="7-day miles driven trend chart"
    >
      <svg ref="svgRef" class="miles-chart__svg" />
      <!-- Tooltip -->
      <Transition name="tooltip">
        <div
          v-if="tooltip.visible"
          class="chart-tooltip"
          :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px`, transform: 'translateX(-50%)' }"
          role="tooltip"
          aria-live="polite"
        >
          <div class="tooltip__label">{{ tooltip.label }}</div>
          <div class="tooltip__value">{{ tooltip.miles.toLocaleString() }} mi</div>
          <div class="tooltip__trips">{{ tooltip.trips }} trips</div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.miles-chart {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.miles-chart__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.miles-chart__title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  margin: 0;
}

.miles-chart__subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 2px 0 0;
  letter-spacing: 0.04em;
}

.miles-chart__legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.miles-chart__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 25%;
  flex-shrink: 0;
  background-color: var(--accent);
}

.miles-chart__legend-dot--today {
  opacity: 0.5;
}

.miles-chart__legend-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.miles-chart__canvas {
  position: relative;
  height: 200px;
  width: 100%;
}

.miles-chart__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 10;
}

.tooltip__label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.tooltip__value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tooltip__trips {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 1px;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 100ms ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
