<script setup lang="ts">
import { select } from 'd3-selection'
import 'd3-transition'
import { scaleLinear, scaleTime } from 'd3-scale'
import { line, area, curveLinear } from 'd3-shape'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

// Resolve design tokens to computed colors for the D3 fuel timeline.
const { readCSSColor } = useCssColors()

const props = defineProps<{
  event: FuelEventRow
  /** Playback head position, in seconds, used to place the current-position indicator. */
  currentTime: number
  /** Total video duration in seconds. */
  totalDuration: number
}>()

const timelineRef = ref<HTMLDivElement | null>(null)
const timelineSvg = ref<SVGSVGElement | null>(null)

interface FuelPoint {
  time: Date
  level: number
}

function formatTimeHHMMSS(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function generateFuelData(): FuelPoint[] {
  const start = props.event.startTime.getTime()
  const end = props.event.endTime.getTime()
  const fuelStart = props.event.fuelStart ?? 80
  const fuelEnd = props.event.fuelEnd ?? 60
  const totalDrop = fuelStart - fuelEnd
  const duration = end - start
  const padBefore = duration * 0.15
  const padAfter = duration * 0.15

  const points: FuelPoint[] = []

  // Pre-event: stable
  const preStart = start - padBefore
  for (let i = 0; i < 3; i++) {
    const t = preStart + (padBefore / 3) * i
    points.push({ time: new Date(t), level: fuelStart })
  }

  // During event: sharp linear drop
  const numPoints = 12
  for (let i = 0; i <= numPoints; i++) {
    const progress = i / numPoints
    const t = start + (end - start) * progress
    const level = fuelStart - totalDrop * progress
    points.push({ time: new Date(t), level })
  }

  // Post-event: stable at end level
  for (let i = 1; i <= 3; i++) {
    const t = end + (padAfter / 3) * i
    points.push({ time: new Date(t), level: fuelEnd })
  }

  return points
}

function drawTimeline() {
  if (!timelineSvg.value || !timelineRef.value) return

  // Token-aware with the original dark-palette hex as fallback (this component is dark regardless of theme).
  // readCSSColor returns an rgb() string, so it is only used for SOLID fills/strokes.
  const accentColor = readCSSColor('--mtv-color-status-info', '#5b9cf6')
  const textMuted = readCSSColor('--mtv-color-foreground-muted', '#6b7280')
  const dangerColor = readCSSColor('--mtv-color-status-warning', '#f97316')
  // Translucent glow/fill variants — kept as 8-digit hex (alpha suffix) since rgb() can't take a hex alpha suffix.
  const accentColorFaint = '#5b9cf610'
  const dangerColorFaint = '#f973160a'
  const dangerColorDashed = '#f9731640'
  // Dark dot stroke (matches the timeline's dark surface)
  const dotStroke = readCSSColor('--mtv-color-surface-base', '#1c1c1c')

  const container = timelineRef.value
  const width = container.clientWidth
  const height = container.clientHeight || 80
  const m = { top: 8, right: 12, bottom: 20, left: 32 }
  const innerWidth = width - m.left - m.right
  const innerHeight = height - m.top - m.bottom

  select(timelineSvg.value).selectAll('*').remove()

  const data = generateFuelData()
  if (data.length < 2) return

  const firstPoint = data[0]!
  const lastPoint = data[data.length - 1]!

  const svg = select(timelineSvg.value).attr('width', width).attr('height', height)

  const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`)

  const xScale = scaleTime().domain([firstPoint.time, lastPoint.time]).range([0, innerWidth])

  const fuelStart = props.event.fuelStart ?? 80
  const fuelEnd = props.event.fuelEnd ?? 60
  const yMin = Math.max(0, fuelEnd - 10)
  const yMax = Math.min(100, fuelStart + 10)

  const yScale = scaleLinear().domain([yMin, yMax]).range([innerHeight, 0])

  // Event drop zone highlight
  const eventStartX = xScale(props.event.startTime)
  const eventEndX = xScale(props.event.endTime)
  g.append('rect')
    .attr('x', eventStartX)
    .attr('y', 0)
    .attr('width', eventEndX - eventStartX)
    .attr('height', innerHeight)
    .attr('fill', dangerColorFaint)

  // Event boundary dashed lines
  const boundaries = [props.event.startTime, props.event.endTime]
  boundaries.forEach((t) => {
    g.append('line')
      .attr('x1', xScale(t))
      .attr('x2', xScale(t))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', dangerColorDashed)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
  })

  // Area fill
  const areaGen = area<FuelPoint>()
    .x((d) => xScale(d.time))
    .y0(innerHeight)
    .y1((d) => yScale(d.level))
    .curve(curveLinear)

  g.append('path').datum(data).attr('fill', accentColorFaint).attr('d', areaGen)

  // Fuel level line
  const lineGen = line<FuelPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.level))
    .curve(curveLinear)

  g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', accentColor)
    .attr('stroke-width', 1.5)
    .attr('d', lineGen)

  // Current position indicator
  const currentPos = props.currentTime / props.totalDuration
  const posX = innerWidth * currentPos
  const posIdx = Math.min(Math.floor(currentPos * data.length), data.length - 1)
  const posPoint = data[posIdx] ?? firstPoint
  g.append('circle')
    .attr('cx', posX)
    .attr('cy', yScale(posPoint.level))
    .attr('r', 4)
    .attr('fill', accentColor)
    .attr('stroke', dotStroke)
    .attr('stroke-width', 2)

  // Start/end markers
  g.append('circle')
    .attr('cx', xScale(props.event.startTime))
    .attr('cy', yScale(fuelStart))
    .attr('r', 3)
    .attr('fill', accentColor)

  g.append('circle')
    .attr('cx', xScale(props.event.endTime))
    .attr('cy', yScale(fuelEnd))
    .attr('r', 3)
    .attr('fill', dangerColor)

  // Y-axis labels
  g.append('text')
    .attr('x', -6)
    .attr('y', yScale(fuelStart))
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', textMuted)
    .attr('font-size', '9px')
    .text(`${fuelStart}%`)

  g.append('text')
    .attr('x', -6)
    .attr('y', yScale(fuelEnd))
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', dangerColor)
    .attr('font-size', '9px')
    .text(`${fuelEnd}%`)

  // Time labels
  g.append('text')
    .attr('x', eventStartX)
    .attr('y', innerHeight + 14)
    .attr('text-anchor', 'middle')
    .attr('fill', textMuted)
    .attr('font-size', '9px')
    .text(formatTimeHHMMSS(props.event.startTime))

  g.append('text')
    .attr('x', eventEndX)
    .attr('y', innerHeight + 14)
    .attr('text-anchor', 'middle')
    .attr('fill', textMuted)
    .attr('font-size', '9px')
    .text(formatTimeHHMMSS(props.event.endTime))
}

// Redraw when the theme changes
useThemeObserver(drawTimeline)

onMounted(() => {
  drawTimeline()
  const ro = new ResizeObserver(() => drawTimeline())
  if (timelineRef.value) ro.observe(timelineRef.value)
  onUnmounted(() => ro.disconnect())
})

watch(() => props.currentTime, drawTimeline)
</script>

<template>
  <div class="dashcam-timeline">
    <div class="dashcam-timeline__header">
      <span class="dashcam-timeline__title">Fuel Level</span>
      <div class="dashcam-timeline__labels">
        <span class="dashcam-timeline__label">START</span>
        <span class="dashcam-timeline__label">END</span>
      </div>
    </div>
    <div ref="timelineRef" class="dashcam-timeline__chart">
      <svg ref="timelineSvg" class="dashcam-timeline__svg" />
    </div>
  </div>
</template>

<style scoped>
.dashcam-timeline {
  padding: 0.5rem 0.75rem 0.75rem;
  border-top: 1px solid var(--mtv-color-border-default);
  background: var(--mtv-color-surface-base);
}

.dashcam-timeline__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.dashcam-timeline__title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--mtv-color-foreground-default);
}

.dashcam-timeline__labels {
  display: flex;
  gap: 1rem;
}

.dashcam-timeline__label {
  font-size: var(--font-size-2xs);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--mtv-color-foreground-muted);
  letter-spacing: 0.05em;
}

.dashcam-timeline__chart {
  width: 100%;
  height: 80px;
  position: relative;
}

.dashcam-timeline__svg {
  width: 100%;
  height: 100%;
}
</style>
