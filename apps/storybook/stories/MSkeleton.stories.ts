import type { Meta, StoryObj } from '@storybook/vue3'
import { MSkeleton } from '@motive/ui'

const meta: Meta<typeof MSkeleton> = {
  title: 'Components/MSkeleton',
  component: MSkeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['line', 'block', 'circle'] },
    lines: { control: { type: 'number', min: 1, max: 8 } },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MSkeleton>

export const Line: Story = {
  args: { variant: 'line' },
  render: (args) => ({
    components: { MSkeleton },
    setup: () => ({ args }),
    template: `<div style="width: 320px;"><MSkeleton v-bind="args" /></div>`,
  }),
}

export const Paragraph: Story = {
  args: { variant: 'line', lines: 4 },
  render: (args) => ({
    components: { MSkeleton },
    setup: () => ({ args }),
    template: `<div style="width: 320px;"><MSkeleton v-bind="args" /></div>`,
  }),
}

export const Block: Story = {
  args: { variant: 'block' },
  render: (args) => ({
    components: { MSkeleton },
    setup: () => ({ args }),
    template: `<div style="width: 320px;"><MSkeleton v-bind="args" /></div>`,
  }),
}

export const Circle: Story = {
  args: { variant: 'circle', width: '48px' },
  render: (args) => ({
    components: { MSkeleton },
    setup: () => ({ args }),
    template: `<MSkeleton v-bind="args" />`,
  }),
}

export const Card: Story = {
  render: () => ({
    components: { MSkeleton },
    template: `
      <div style="width: 320px; display: flex; gap: 12px; align-items: center;">
        <MSkeleton variant="circle" width="48px" />
        <div style="flex: 1;">
          <MSkeleton :lines="2" />
        </div>
      </div>
    `,
  }),
}
