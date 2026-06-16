<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import MPopover from './MPopover.vue'

/** One stacked series within the chart. */
export interface MStackedBarSeries {
  /** Property name read from each data row. */
  key: string
  /** Legend / tooltip label. */
  label: string
  /** 1–8, maps to `--mtv-color-chart-series-N`. Defaults to the series order. */
  colorIndex?: number
  /**
   * Explicit fill, overriding `colorIndex`. Use a token, e.g. `var(--mtv-color-red-500)`,
   * for semantic series (loss, waste). Applied as a CSS value so oklch tokens resolve.
   */
  color?: string
}

export interface MStackedBarChartProps {
  /** Rows of data; each row has the category field plus one numeric value per series. */
  data: Array<Record<string, string | number>>
  /** Series stacked within each bar, drawn bottom-to-top in array order. */
  series: MStackedBarSeries[]
  /** Row property used for the x-axis category label. @default 'label' */
  categoryKey?: string
  /** Drawing height in px. @default 200 */
  height?: number
  /** Show the series legend above the chart. @default true */
  showLegend?: boolean
  /** Show horizontal y grid lines + axis labels. @default true */
  showGrid?: boolean
  /** Formats numeric values in the y-axis and tooltip. */
  valueFormatter?: (value: number) => string
  /** Accessible label for the chart figure. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<MStackedBarChartProps>(), {
  categoryKey: 'label',
  height: 200,
  showLegend: true,
  showGrid: true,
  valueFormatter: undefined,
  ariaLabel: undefined,
})

const margin = { top: 16, right: 16, bottom: 28, left: 48 }
const barPadding = 0.3
const tickCount = 4

const containerRef = ref<HTMLDivElement | null>(null)
const width = ref(0)

// Tooltip is rendered via the shared MPopover primitive, anchored to the hovered bar.
const popoverRef = ref<InstanceType<typeof MPopover> | null>(null)
const tooltipAnchor = ref<HTMLElement | null>(null)
const activeBarIndex = ref<number | null>(null)

function format(value: number): string {
  return props.valueFormatter ? props.valueFormatter(value) : `${value}`
}

/** Resolve a series to a CSS color string (explicit override or categorical chart token). */
function colorFor(series: MStackedBarSeries, index: number): string {
  if (series.color) return series.color
  const i = (((((series.colorIndex ?? index + 1) - 1) % 8) + 8) % 8) + 1
  return `var(--mtv-color-chart-series-${i})`
}

const innerWidth = computed(() => Math.max(0, width.value - margin.left - margin.right))
const innerHeight = computed(() => Math.max(0, props.height - margin.top - margin.bottom))

/** Total stacked value per row. */
const totals = computed(() =>
  props.data.map((row) => props.series.reduce((sum, s) => sum + (Number(row[s.key]) || 0), 0)),
)

/** Upper bound of the y domain, padded so the tallest bar doesn't touch the top. */
const domainMax = computed(() => {
  const peak = Math.max(0, ...totals.value)
  return peak > 0 ? peak * 1.15 : 1
})

const step = computed(() => (props.data.length ? innerWidth.value / props.data.length : 0))
const bandWidth = computed(() => step.value * (1 - barPadding))

function yFor(value: number): number {
  return margin.top + innerHeight.value * (1 - value / domainMax.value)
}

/** Pre-computed geometry: one entry per bar, each with stacked segments. */
const bars = computed(() => {
  if (!innerWidth.value || !innerHeight.value) return []
  return props.data.map((row, i) => {
    const x = margin.left + i * step.value + (step.value - bandWidth.value) / 2
    let cursor = 0 // running total from the baseline up
    const segments = props.series.map((s, si) => {
      const value = Number(row[s.key]) || 0
      const yTop = yFor(cursor + value)
      const yBottom = yFor(cursor)
      cursor += value
      return {
        key: s.key,
        value,
        color: colorFor(s, si),
        x,
        y: yTop,
        width: bandWidth.value,
        height: Math.max(0, yBottom - yTop),
      }
    })
    return {
      index: i,
      label: String(row[props.categoryKey] ?? ''),
      total: totals.value[i] ?? 0,
      x,
      columnX: margin.left + i * step.value,
      segments,
    }
  })
})

/** Y grid lines / axis labels. */
const ticks = computed(() => {
  if (!innerHeight.value) return []
  return Array.from({ length: tickCount + 1 }, (_, i) => {
    const value = (domainMax.value * i) / tickCount
    return { value, y: yFor(value) }
  })
})

const legendItems = computed(() =>
  props.series.map((s, i) => ({ label: s.label, color: colorFor(s, i) })),
)

const tooltipOpen = computed(() => activeBarIndex.value !== null)
const activeBar = computed(() =>
  activeBarIndex.value !== null ? (bars.value[activeBarIndex.value] ?? null) : null,
)
/** Series rows for the active bar, ordered top-to-bottom to match the stack. */
const tooltipRows = computed(() =>
  activeBar.value
    ? activeBar.value.segments
        .map((seg) => {
          const s = props.series.find((ser) => ser.key === seg.key)
          return { label: s?.label ?? seg.key, value: seg.value, color: seg.color }
        })
        .reverse()
    : [],
)

function showTooltip(event: MouseEvent, bar: (typeof bars.value)[number]) {
  tooltipAnchor.value = event.currentTarget as unknown as HTMLElement
  activeBarIndex.value = bar.index
}

function hideTooltip() {
  activeBarIndex.value = null
}

// Reposition when moving between adjacent bars (popover stays open, only the anchor changes).
watch(activeBarIndex, async (val) => {
  if (val === null) return
  await nextTick()
  popoverRef.value?.reposition()
})

let observer: ResizeObserver | null = null

onMounted(() => {
  const measure = () => {
    width.value = containerRef.value?.clientWidth ?? 0
  }
  measure()
  observer = new ResizeObserver(measure)
  if (containerRef.value) observer.observe(containerRef.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="m-stacked-bar-chart">
    <div v-if="showLegend" class="m-stacked-bar-chart__legend">
      <span v-for="item in legendItems" :key="item.label" class="m-stacked-bar-chart__legend-item">
        <span
          class="m-stacked-bar-chart__swatch"
          :style="{ backgroundColor: item.color }"
          aria-hidden="true"
        />
        {{ item.label }}
      </span>
    </div>

    <div
      ref="containerRef"
      class="m-stacked-bar-chart__canvas"
      :style="{ height: `${height}px` }"
      role="figure"
      :aria-label="ariaLabel ?? 'Stacked bar chart'"
    >
      <svg
        v-if="width > 0"
        class="m-stacked-bar-chart__svg"
        :width="width"
        :height="height"
        role="img"
        :aria-label="ariaLabel ?? 'Stacked bar chart'"
      >
        <!-- Grid lines + y-axis labels -->
        <g v-if="showGrid">
          <g v-for="tick in ticks" :key="`grid-${tick.value}`">
            <line
              class="m-stacked-bar-chart__grid"
              :x1="margin.left"
              :x2="width - margin.right"
              :y1="tick.y"
              :y2="tick.y"
            />
            <text
              class="m-stacked-bar-chart__axis-label"
              :x="margin.left - 8"
              :y="tick.y"
              text-anchor="end"
              dominant-baseline="middle"
            >
              {{ format(Math.round(tick.value)) }}
            </text>
          </g>
        </g>

        <!-- Bars -->
        <g v-for="bar in bars" :key="`bar-${bar.index}`">
          <rect
            v-for="seg in bar.segments"
            :key="seg.key"
            class="m-stacked-bar-chart__segment"
            :class="{
              'm-stacked-bar-chart__segment--dimmed':
                activeBarIndex !== null && activeBarIndex !== bar.index,
            }"
            :style="{ fill: seg.color }"
            :x="seg.x"
            :y="seg.y"
            :width="seg.width"
            :height="seg.height"
            rx="2"
          />
          <!-- Full-column hover target -->
          <rect
            class="m-stacked-bar-chart__hit"
            :x="bar.columnX"
            :y="margin.top"
            :width="step"
            :height="innerHeight"
            @mouseenter="showTooltip($event, bar)"
            @mouseleave="hideTooltip"
          />
          <!-- Category label -->
          <text
            class="m-stacked-bar-chart__axis-label"
            :x="bar.columnX + step / 2"
            :y="height - margin.bottom + 18"
            text-anchor="middle"
          >
            {{ bar.label }}
          </text>
        </g>
      </svg>
    </div>

    <MPopover
      ref="popoverRef"
      :open="tooltipOpen"
      :anchor-el="tooltipAnchor"
      placement="top"
      variant="inverse"
      :arrow="false"
      max-width="16rem"
      :aria-label="activeBar ? `${activeBar.label} breakdown` : undefined"
    >
      <div v-if="activeBar" class="m-stacked-bar-chart__tooltip">
        <div class="m-stacked-bar-chart__tooltip-header">
          <span class="m-stacked-bar-chart__tooltip-day">{{ activeBar.label }}</span>
          <span class="m-stacked-bar-chart__tooltip-total">{{ format(activeBar.total) }}</span>
        </div>
        <div v-for="row in tooltipRows" :key="row.label" class="m-stacked-bar-chart__tooltip-row">
          <span
            class="m-stacked-bar-chart__swatch"
            :style="{ backgroundColor: row.color }"
            aria-hidden="true"
          />
          <span class="m-stacked-bar-chart__tooltip-label">{{ row.label }}</span>
          <span class="m-stacked-bar-chart__tooltip-value">{{ format(row.value) }}</span>
        </div>
      </div>
    </MPopover>
  </div>
</template>

<style scoped>
@reference "@motive/tailwind-config/theme.css";

.m-stacked-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.m-stacked-bar-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.m-stacked-bar-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--font-size-sm);
  color: var(--mtv-color-foreground-muted);
}

.m-stacked-bar-chart__swatch {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.m-stacked-bar-chart__canvas {
  position: relative;
  width: 100%;
}

.m-stacked-bar-chart__svg {
  display: block;
  overflow: visible;
}

.m-stacked-bar-chart__grid {
  stroke: var(--mtv-color-border-subtle);
  stroke-width: 1;
}

.m-stacked-bar-chart__axis-label {
  fill: var(--mtv-color-foreground-subtle);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-xs);
}

.m-stacked-bar-chart__segment {
  transition: opacity 120ms ease;
}

/* Fade non-hovered bars so the hovered one reads as highlighted. */
.m-stacked-bar-chart__segment--dimmed {
  opacity: 0.3;
}

.m-stacked-bar-chart__hit {
  fill: transparent;
  cursor: pointer;
}

/* Shell (surface, border, radius, shadow, positioning) comes from MPopover. */
.m-stacked-bar-chart__tooltip {
  padding: 0.5rem 0.625rem;
  white-space: nowrap;
}

/* Inner text inherits the popover color (works on default + inverse); emphasis via opacity. */
.m-stacked-bar-chart__tooltip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.375rem;
  font-size: var(--font-size-xs);
  color: inherit;
}

.m-stacked-bar-chart__tooltip-day {
  opacity: 0.7;
}

.m-stacked-bar-chart__tooltip-total {
  font-weight: var(--font-weight-semibold);
}

.m-stacked-bar-chart__tooltip-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--font-size-xs);
  color: inherit;
}

.m-stacked-bar-chart__tooltip-label {
  flex: 1;
  opacity: 0.7;
}

.m-stacked-bar-chart__tooltip-value {
  padding-left: 0.75rem;
  font-weight: var(--font-weight-medium);
}
</style>
