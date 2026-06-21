import { describe, it, expect, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import MStackedBarChart from './MStackedBarChart.vue'
import type { MStackedBarSeries } from './MStackedBarChart.vue'

// jsdom has no layout engine, so the chart's ResizeObserver dependency must be stubbed.
// Width stays 0 under jsdom, so the SVG geometry isn't drawn — these tests cover the
// layout-independent surface (legend, accessibility, color resolution).
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const data = [
  { label: 'Mon', loss: 4, waste: 2 },
  { label: 'Tue', loss: 3, waste: 5 },
]
const series: MStackedBarSeries[] = [
  { key: 'loss', label: 'Loss' },
  { key: 'waste', label: 'Waste' },
]

describe('MStackedBarChart', () => {
  it('renders a legend item per series by default', () => {
    const wrapper = mount(MStackedBarChart, { props: { data, series } })
    const items = wrapper.findAll('.m-stacked-bar-chart__legend-item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Loss')
    expect(items[1].text()).toContain('Waste')
  })

  it('hides the legend when showLegend is false', () => {
    const wrapper = mount(MStackedBarChart, { props: { data, series, showLegend: false } })
    expect(wrapper.find('.m-stacked-bar-chart__legend').exists()).toBe(false)
  })

  it('falls back to categorical chart tokens for the swatch color', () => {
    const wrapper = mount(MStackedBarChart, { props: { data, series } })
    const swatch = wrapper.find<HTMLElement>('.m-stacked-bar-chart__swatch')
    expect(swatch.attributes('style')).toContain('--mtv-color-chart-series-1')
  })

  it('honors an explicit series color override', () => {
    const wrapper = mount(MStackedBarChart, {
      props: {
        data,
        series: [{ key: 'loss', label: 'Loss', color: 'var(--mtv-color-red-500)' }],
      },
    })
    const swatch = wrapper.find<HTMLElement>('.m-stacked-bar-chart__swatch')
    expect(swatch.attributes('style')).toContain('var(--mtv-color-red-500)')
  })

  it('exposes the canvas as an accessible figure with the provided label', () => {
    const wrapper = mount(MStackedBarChart, {
      props: { data, series, ariaLabel: 'Weekly fuel loss' },
    })
    const canvas = wrapper.find('.m-stacked-bar-chart__canvas')
    expect(canvas.attributes('role')).toBe('figure')
    expect(canvas.attributes('aria-label')).toBe('Weekly fuel loss')
  })

  it('applies the height style to the canvas', () => {
    const wrapper = mount(MStackedBarChart, { props: { data, series, height: 320 } })
    expect(wrapper.find<HTMLElement>('.m-stacked-bar-chart__canvas').attributes('style')).toContain(
      'height: 320px',
    )
  })
})
