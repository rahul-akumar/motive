import type { Meta, StoryObj } from '@storybook/vue3'
import { MBadge } from '@motive/ui'

const meta: Meta<typeof MBadge> = {
  title: 'Components/MBadge',
  component: MBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'number', 'score'] },
    color: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info', 'accent'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    kind: { control: 'select', options: ['safety', 'speed', 'health', 'risk', 'performance'] },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MBadge>

export const Default: Story = {
  args: { variant: 'text', color: 'default', label: 'Default' },
}

export const Success: Story = {
  args: { variant: 'text', color: 'success', label: 'Active' },
}

export const Warning: Story = {
  args: { variant: 'text', color: 'warning', label: 'Idle' },
}

export const Danger: Story = {
  args: { variant: 'text', color: 'danger', label: 'Alert' },
}

export const Info: Story = {
  args: { variant: 'text', color: 'info', label: 'Info' },
}

export const Accent: Story = {
  args: { variant: 'text', color: 'accent', label: 'Beta', size: 'sm' },
}

export const Sizes: Story = {
  render: () => ({
    components: { MBadge },
    template: `
      <div style="display: flex; align-items: center; gap: 8px;">
        <MBadge variant="text" color="success" size="sm" label="Small" />
        <MBadge variant="text" color="success" size="md" label="Medium" />
        <MBadge variant="text" color="success" size="lg" label="Large" />
      </div>
    `,
  }),
}

export const NumberBadge: Story = {
  args: { variant: 'number', count: 7, color: 'danger' },
}

export const NumberCapped: Story = {
  args: { variant: 'number', count: 150, max: 99, color: 'danger' },
}

export const ScoreSafety: Story = {
  args: { variant: 'score', score: 85, kind: 'safety' },
}

export const ScoreWarning: Story = {
  args: { variant: 'score', score: 55, kind: 'speed' },
}

export const ScoreDanger: Story = {
  args: { variant: 'score', score: 25, kind: 'risk' },
}

export const AllKinds: Story = {
  render: () => ({
    components: { MBadge },
    template: `
      <div style="display: flex; align-items: center; gap: 12px;">
        <MBadge variant="score" :score="88" kind="safety" />
        <MBadge variant="score" :score="72" kind="speed" />
        <MBadge variant="score" :score="60" kind="health" />
        <MBadge variant="score" :score="35" kind="risk" />
        <MBadge variant="score" :score="91" kind="performance" />
      </div>
    `,
  }),
}
