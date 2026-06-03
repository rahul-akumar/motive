import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MSelect } from '@motive/ui'

const meta: Meta<typeof MSelect> = {
  title: 'Components/MSelect',
  component: MSelect,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MSelect>

const REGION_OPTIONS = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Brazil', value: 'br' },
  { label: 'Canada', value: 'ca' },
]

export const Default: Story = {
  render: () => ({
    components: { MSelect },
    setup() {
      const value = ref('us')
      return { value, options: REGION_OPTIONS }
    },
    template: `<MSelect v-model="value" :options="options" aria-label="Region" />`,
  }),
}

export const WithPlaceholder: Story = {
  render: () => ({
    components: { MSelect },
    setup() {
      const value = ref('')
      return { value, options: REGION_OPTIONS }
    },
    template: `<MSelect v-model="value" :options="options" placeholder="Select a region" aria-label="Region" />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { MSelect },
    setup() {
      const sm = ref('us')
      const md = ref('us')
      return { sm, md, options: REGION_OPTIONS }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 12px;">
        <MSelect v-model="sm" :options="options" size="sm" aria-label="Small select" />
        <MSelect v-model="md" :options="options" size="md" aria-label="Medium select" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { MSelect },
    setup() {
      const value = ref('us')
      return { value, options: REGION_OPTIONS }
    },
    template: `<MSelect v-model="value" :options="options" :disabled="true" aria-label="Disabled select" />`,
  }),
}

export const WithDisabledOption: Story = {
  render: () => ({
    components: { MSelect },
    setup() {
      const opts = [
        { label: 'Available', value: 'a' },
        { label: 'Unavailable (disabled)', value: 'b', disabled: true },
        { label: 'Also Available', value: 'c' },
      ]
      const value = ref('a')
      return { value, opts }
    },
    template: `<MSelect v-model="value" :options="opts" aria-label="Availability" />`,
  }),
}

export const FilterWithLabel: Story = {
  render: () => ({
    components: { MSelect },
    setup() {
      const opts = [
        { label: 'Fuel Loss', value: 'fuel-loss' },
        { label: 'Idling', value: 'idling' },
        { label: 'Harsh Braking', value: 'harsh-braking' },
      ]
      const value = ref<string | null>(null)
      return { value, opts }
    },
    template: `<MSelect v-model="value" :options="opts" label="Behavior" :clearable="true" aria-label="Filter by behavior" />`,
  }),
}

export const FilterWithSelection: Story = {
  render: () => ({
    components: { MSelect },
    setup() {
      const opts = [
        { label: 'Active', value: 'active' },
        { label: 'Idle', value: 'idle' },
        { label: 'Out of Service', value: 'out-of-service' },
        { label: 'Maintenance', value: 'maintenance' },
      ]
      const value = ref<string | null>('active')
      return { value, opts }
    },
    template: `<MSelect v-model="value" :options="opts" label="Status" :clearable="true" aria-label="Filter by status" />`,
  }),
}
