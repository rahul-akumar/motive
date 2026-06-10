<script setup lang="ts">
import { select } from 'd3-selection'
import 'd3-transition'
import { scaleLinear, scaleTime } from 'd3-scale'
import { line, area, curveLinear } from 'd3-shape'
import { MIcon } from '@motive/ui'
import { Video, Pause, Play, Gauge, ArrowDown, Cog, Clock, ArrowRight } from 'lucide-vue-next'
import type { FuelEventRow } from '~/composables/useFuelEventMappers'

const props = defineProps<{
  event: FuelEventRow
}>()

// ── Playback state ──────────────────────────────────────────
const isPlaying = ref(false)
const playbackSpeed = ref(1)
const currentTime = ref(6) // seconds into video
const totalDuration = ref(10) // seconds

const formattedCurrent = computed(() => formatSec(currentTime.value))
const formattedTotal = computed(() => formatSec(totalDuration.value))
const progressPercent = computed(() => (currentTime.value / totalDuration.value) * 100)

function formatSec(s: number): string {
  const min = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function formatTimeHHMMSS(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function cycleSpeed() {
  playbackSpeed.value = playbackSpeed.value === 1 ? 2 : 1
}

function seekTo(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  currentTime.value = Math.round(pct * totalDuration.value)
}

// ── Telematics data (mock, deterministic from event ID) ─────
const seed = props.event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)

const telematics = computed(() => {
  const s = seed
  return {
    speed: 30 + (s % 40),
    speedLimit: 35,
    accel: 50 + (s % 30),
    decel: 15 + ((s * 3) % 25),
    rpm: 1200 + (s % 1200),
    timeHit: `${(0.5 + (s % 15) * 0.1).toFixed(1)} sec`,
    signal: s % 2 === 0 ? 'Left' : 'Right',
    seatBelt: s % 3 !== 0 ? 'Buckled' : 'Unbuckled',
    cruise: s % 4 !== 0 ? 'Enabled' : 'Disabled',
  }
})

// ── Fuel level timeline (D3 chart) ──────────────────────────
const timelineRef = ref<HTMLDivElement | null>(null)
const timelineSvg = ref<SVGSVGElement | null>(null)

interface FuelPoint {
  time: Date
  level: number
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

  // Always dark palette — this component is dark regardless of theme
  const accentColor = '#5b9cf6'
  const textMuted = '#6b7280'
  const dangerColor = '#f97316'

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
    .attr('fill', `${dangerColor}0a`)

  // Event boundary dashed lines
  const boundaries = [props.event.startTime, props.event.endTime]
  boundaries.forEach((t) => {
    g.append('line')
      .attr('x1', xScale(t))
      .attr('x2', xScale(t))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', `${dangerColor}40`)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
  })

  // Area fill
  const areaGen = area<FuelPoint>()
    .x((d) => xScale(d.time))
    .y0(innerHeight)
    .y1((d) => yScale(d.level))
    .curve(curveLinear)

  g.append('path').datum(data).attr('fill', `${accentColor}10`).attr('d', areaGen)

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
  const currentPos = currentTime.value / totalDuration.value
  const posX = innerWidth * currentPos
  const posIdx = Math.min(Math.floor(currentPos * data.length), data.length - 1)
  const posPoint = data[posIdx] ?? firstPoint
  g.append('circle')
    .attr('cx', posX)
    .attr('cy', yScale(posPoint.level))
    .attr('r', 4)
    .attr('fill', accentColor)
    .attr('stroke', '#1c1c1c')
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

let themeObserver: MutationObserver | null = null

onMounted(() => {
  drawTimeline()
  const ro = new ResizeObserver(() => drawTimeline())
  if (timelineRef.value) ro.observe(timelineRef.value)
  onUnmounted(() => ro.disconnect())

  themeObserver = new MutationObserver(() => drawTimeline())
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  onUnmounted(() => themeObserver?.disconnect())
})

watch(currentTime, drawTimeline)
</script>

<template>
  <div class="dashcam">
    <!-- Video panels -->
    <div class="dashcam__videos">
      <div class="dashcam__video-panel dashcam__video-panel--main">
        <div class="dashcam__placeholder">
          <MIcon :icon="Video" :size="32" />
          <span>Road-facing camera</span>
        </div>
        <div class="dashcam__speed-overlay">
          <span class="dashcam__speed-value">{{ telematics.speed }}</span>
          <span class="dashcam__speed-unit">MPH</span>
          <span class="dashcam__speed-limit">{{ telematics.speedLimit }} AUTO</span>
        </div>
      </div>
      <div class="dashcam__video-panel dashcam__video-panel--secondary">
        <div class="dashcam__placeholder">
          <MIcon :icon="Video" :size="24" />
          <span>Driver-facing</span>
        </div>
      </div>
    </div>

    <!-- Controls bar -->
    <div class="dashcam__controls">
      <button class="dashcam__btn" aria-label="Play/Pause" @click="togglePlay">
        <MIcon :icon="isPlaying ? Pause : Play" :size="16" />
      </button>
      <span class="dashcam__time">{{ formattedCurrent }} / {{ formattedTotal }}</span>
      <div class="dashcam__seekbar" @click="seekTo">
        <div class="dashcam__seekbar-fill" :style="{ width: `${progressPercent}%` }" />
        <div class="dashcam__seekbar-thumb" :style="{ left: `${progressPercent}%` }" />
      </div>
      <button class="dashcam__btn" aria-label="Playback speed" @click="cycleSpeed">
        {{ playbackSpeed }}x
      </button>
    </div>

    <!-- Telematics strip -->
    <div class="dashcam__telematics">
      <div class="dashcam__metric">
        <span class="dashcam__metric-value">{{ telematics.speed }}</span>
        <span class="dashcam__metric-label">MPH</span>
      </div>
      <div class="dashcam__metric">
        <span class="dashcam__metric-value">{{ telematics.speedLimit }}</span>
        <span class="dashcam__metric-label">AUTO</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="Gauge" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.accel }}%</span>
        <span class="dashcam__metric-label">ACCEL</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="ArrowDown" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.decel }}%</span>
        <span class="dashcam__metric-label">DECEL</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="Cog" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.rpm.toLocaleString() }}</span>
        <span class="dashcam__metric-label">RPM</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="Clock" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.timeHit }}</span>
        <span class="dashcam__metric-label">TIME HIT</span>
      </div>
      <div class="dashcam__metric">
        <MIcon :icon="ArrowRight" :size="12" />
        <span class="dashcam__metric-value">{{ telematics.signal }}</span>
        <span class="dashcam__metric-label">SIGNAL</span>
      </div>
      <div class="dashcam__metric">
        <span class="dashcam__metric-value">{{ telematics.seatBelt }}</span>
        <span class="dashcam__metric-label">SEAT BELT</span>
      </div>
      <div class="dashcam__metric">
        <span class="dashcam__metric-value">{{ telematics.cruise }}</span>
        <span class="dashcam__metric-label">CRUISE</span>
      </div>
    </div>

    <!-- Fuel level timeline -->
    <div class="dashcam__timeline">
      <div class="dashcam__timeline-header">
        <span class="dashcam__timeline-title">Fuel Level</span>
        <div class="dashcam__timeline-labels">
          <span class="dashcam__timeline-label">START</span>
          <span class="dashcam__timeline-label">END</span>
        </div>
      </div>
      <div ref="timelineRef" class="dashcam__timeline-chart">
        <svg ref="timelineSvg" class="dashcam__timeline-svg" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashcam {
  border: 1px solid oklch(0.25 0 0);
  border-radius: var(--radius);
  background: oklch(0.13 0 0);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: oklch(0.9 0 0);
}

/* ── Video panels ─────────────────────────────── */
.dashcam__videos {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 1px;
  background: oklch(0.2 0 0);
}

.dashcam__video-panel {
  position: relative;
  background: oklch(0.1 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashcam__video-panel--main {
  min-height: 240px;
}

.dashcam__video-panel--secondary {
  min-height: 240px;
}

.dashcam__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: oklch(0.5 0 0);
  font-size: var(--font-size-xs);
}

.dashcam__speed-overlay {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  background: oklch(0.15 0 0 / 0.85);
  padding: 0.375rem 0.625rem;
  border-radius: var(--radius-sm);
}

.dashcam__speed-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: oklch(0.97 0 0);
}

.dashcam__speed-unit {
  font-size: var(--font-size-xs);
  color: oklch(0.65 0 0);
}

.dashcam__speed-limit {
  font-size: var(--font-size-xs);
  color: oklch(0.55 0 0);
  margin-left: 0.5rem;
}

/* ── Controls ─────────────────────────────────── */
.dashcam__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid oklch(0.25 0 0);
  background: oklch(0.15 0 0);
}

.dashcam__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: oklch(0.85 0 0);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.dashcam__btn:hover {
  background: oklch(0.22 0 0);
}

.dashcam__time {
  font-size: var(--font-size-xs);
  color: oklch(0.6 0 0);
  font-variant-numeric: tabular-nums;
  min-width: 5rem;
}

.dashcam__seekbar {
  flex: 1;
  height: 4px;
  background: oklch(0.3 0 0);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.dashcam__seekbar-fill {
  height: 100%;
  background: oklch(0.65 0 0);
  border-radius: 2px;
}

.dashcam__seekbar-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: oklch(0.9 0 0);
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.4);
}

/* ── Telematics strip ─────────────────────────── */
.dashcam__telematics {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid oklch(0.25 0 0);
  background: oklch(0.13 0 0);
  flex-wrap: wrap;
}

.dashcam__metric {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dashcam__metric-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: oklch(0.92 0 0);
}

.dashcam__metric-label {
  font-size: 9px;
  color: oklch(0.55 0 0);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* ── Timeline ─────────────────────────────────── */
.dashcam__timeline {
  padding: 0.5rem 0.75rem 0.75rem;
  border-top: 1px solid oklch(0.25 0 0);
  background: oklch(0.11 0 0);
}

.dashcam__timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.dashcam__timeline-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: oklch(0.85 0 0);
}

.dashcam__timeline-labels {
  display: flex;
  gap: 1rem;
}

.dashcam__timeline-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  color: oklch(0.55 0 0);
  letter-spacing: 0.05em;
}

.dashcam__timeline-chart {
  width: 100%;
  height: 80px;
  position: relative;
}

.dashcam__timeline-svg {
  width: 100%;
  height: 100%;
}
</style>
