import type { Meta, StoryObj } from '@storybook/vue3'
import { MCard } from '@motive/ui'

const meta: Meta<typeof MCard> = {
  title: 'Components/MCard',
  component: MCard,
  tags: ['autodocs'],
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md'] },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MCard>

export const NoPadding: Story = {
  args: { padding: 'none' },
  render: (args) => ({
    components: { MCard },
    setup() {
      return { args }
    },
    template: `
      <MCard v-bind="args" style="width: 240px;">
        <div style="padding: 16px; color: var(--mtv-color-foreground-default);">Card content</div>
      </MCard>
    `,
  }),
}

export const SmallPadding: Story = {
  args: { padding: 'sm' },
  render: (args) => ({
    components: { MCard },
    setup() {
      return { args }
    },
    template: `
      <MCard v-bind="args" style="width: 240px;">
        <p style="color: var(--mtv-color-foreground-default); margin: 0;">Card with sm padding</p>
      </MCard>
    `,
  }),
}

export const MediumPadding: Story = {
  args: { padding: 'md' },
  render: (args) => ({
    components: { MCard },
    setup() {
      return { args }
    },
    template: `
      <MCard v-bind="args" style="width: 240px;">
        <p style="color: var(--mtv-color-foreground-default); margin: 0;">Card with md padding</p>
      </MCard>
    `,
  }),
}
