import type { Meta, StoryObj } from '@storybook/vue3'
import { Truck, AlertTriangle, MapPin, User, Settings } from 'lucide-vue-next'
import { MIcon } from '@motive/ui'

const meta: Meta<typeof MIcon> = {
  title: 'Components/MIcon',
  component: MIcon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'number' },
    strokeWidth: { control: 'number' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MIcon>

export const Default: Story = {
  args: { icon: Truck, size: 24, strokeWidth: 1.5 },
  render: (args) => ({
    components: { MIcon },
    setup() {
      return { args }
    },
    template: '<MIcon v-bind="args" style="color: var(--mtv-color-foreground-default);" />',
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { MIcon },
    template: `
      <div style="display: flex; align-items: center; gap: 16px; color: var(--mtv-color-foreground-default);">
        <MIcon :icon="$options.icons.Truck" :size="12" />
        <MIcon :icon="$options.icons.Truck" :size="16" />
        <MIcon :icon="$options.icons.Truck" :size="20" />
        <MIcon :icon="$options.icons.Truck" :size="24" />
        <MIcon :icon="$options.icons.Truck" :size="32" />
      </div>
    `,
    icons: { Truck },
  }),
}

export const Gallery: Story = {
  render: () => ({
    components: { MIcon },
    template: `
      <div style="display: flex; align-items: center; gap: 20px; color: var(--mtv-color-foreground-default);">
        <MIcon :icon="$options.icons.Truck" :size="20" />
        <MIcon :icon="$options.icons.AlertTriangle" :size="20" style="color: var(--mtv-color-status-warning);" />
        <MIcon :icon="$options.icons.MapPin" :size="20" style="color: var(--mtv-color-status-info);" />
        <MIcon :icon="$options.icons.User" :size="20" />
        <MIcon :icon="$options.icons.Settings" :size="20" style="color: var(--mtv-color-foreground-muted);" />
      </div>
    `,
    icons: { Truck, AlertTriangle, MapPin, User, Settings },
  }),
}
