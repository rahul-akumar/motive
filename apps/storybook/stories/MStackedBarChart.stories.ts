import type { Meta, StoryObj } from '@storybook/vue3'
import { MStackedBarChart } from '@motive/ui'
import type { MStackedBarSeries } from '@motive/ui'

const data = [
  { label: 'Mon', idling: 42, theft: 8, leak: 5 },
  { label: 'Tue', idling: 38, theft: 4, leak: 12 },
  { label: 'Wed', idling: 51, theft: 14, leak: 3 },
  { label: 'Thu', idling: 33, theft: 6, leak: 9 },
  { label: 'Fri', idling: 47, theft: 11, leak: 7 },
  { label: 'Sat', idling: 22, theft: 2, leak: 4 },
  { label: 'Sun', idling: 18, theft: 1, leak: 2 },
]

const series: MStackedBarSeries[] = [
  { key: 'idling', label: 'Idling' },
  { key: 'theft', label: 'Theft' },
  { key: 'leak', label: 'Leak' },
]

const gallons = (v: number) => `${v} gal`

const meta: Meta<typeof MStackedBarChart> = {
  title: 'Components/MStackedBarChart',
  component: MStackedBarChart,
  tags: ['autodocs'],
  argTypes: {
    categoryKey: { control: 'text' },
    height: { control: { type: 'range', min: 120, max: 400, step: 20 } },
    showLegend: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    ariaLabel: { control: 'text' },
  },
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof MStackedBarChart>

export const Default: Story = {
  render: (args) => ({
    components: { MStackedBarChart },
    setup: () => ({ args, data, series }),
    template: `<div style="width: 640px;"><MStackedBarChart v-bind="args" :data="data" :series="series" /></div>`,
  }),
  args: { height: 240, showLegend: true, showGrid: true, ariaLabel: 'Weekly fuel waste by cause' },
}

export const WithValueFormatter: Story = {
  render: () => ({
    components: { MStackedBarChart },
    setup: () => ({ data, series, gallons }),
    template: `<div style="width: 640px;"><MStackedBarChart :data="data" :series="series" :value-formatter="gallons" /></div>`,
  }),
}

export const SemanticColors: Story = {
  render: () => ({
    components: { MStackedBarChart },
    setup: () => ({
      data,
      series: [
        { key: 'idling', label: 'Idling', color: 'var(--mtv-color-orange-500)' },
        { key: 'theft', label: 'Theft', color: 'var(--mtv-color-red-500)' },
        { key: 'leak', label: 'Leak', color: 'var(--mtv-color-blue-500)' },
      ] satisfies MStackedBarSeries[],
    }),
    template: `<div style="width: 640px;"><MStackedBarChart :data="data" :series="series" /></div>`,
  }),
}

export const NoLegendOrGrid: Story = {
  render: () => ({
    components: { MStackedBarChart },
    setup: () => ({ data, series }),
    template: `<div style="width: 640px;"><MStackedBarChart :data="data" :series="series" :show-legend="false" :show-grid="false" :height="160" /></div>`,
  }),
}
