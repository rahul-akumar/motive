import type { Meta, StoryObj } from '@storybook/vue3'
import { MTooltip, MButton } from '@motive/ui'

const meta: Meta<typeof MTooltip> = {
  title: 'Components/MTooltip',
  component: MTooltip,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    placement: {
      control: 'select',
      options: ['right', 'left', 'top', 'bottom'],
    },
    arrow: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof MTooltip>

export const Right: Story = {
  args: { content: 'Tooltip label', placement: 'right', arrow: true, disabled: false },
  render: (args) => ({
    components: { MTooltip, MButton },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 60px; display: flex; align-items: center; justify-content: center;">
        <MTooltip v-bind="args">
          <MButton variant="outline" size="sm">Hover me</MButton>
        </MTooltip>
      </div>
    `,
  }),
}

export const Left: Story = {
  args: { content: 'Tooltip label', placement: 'left', arrow: true, disabled: false },
  render: (args) => ({
    components: { MTooltip, MButton },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 60px; display: flex; align-items: center; justify-content: center;">
        <MTooltip v-bind="args">
          <MButton variant="outline" size="sm">Hover me</MButton>
        </MTooltip>
      </div>
    `,
  }),
}

export const Top: Story = {
  args: { content: 'Tooltip label', placement: 'top', arrow: true, disabled: false },
  render: (args) => ({
    components: { MTooltip, MButton },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 60px; display: flex; align-items: center; justify-content: center;">
        <MTooltip v-bind="args">
          <MButton variant="outline" size="sm">Hover me</MButton>
        </MTooltip>
      </div>
    `,
  }),
}

export const Bottom: Story = {
  args: { content: 'Tooltip label', placement: 'bottom', arrow: true, disabled: false },
  render: (args) => ({
    components: { MTooltip, MButton },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 60px; display: flex; align-items: center; justify-content: center;">
        <MTooltip v-bind="args">
          <MButton variant="outline" size="sm">Hover me</MButton>
        </MTooltip>
      </div>
    `,
  }),
}

export const NoArrow: Story = {
  args: { content: 'No arrow', placement: 'right', arrow: false },
  render: (args) => ({
    components: { MTooltip, MButton },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 60px; display: flex; align-items: center; justify-content: center;">
        <MTooltip v-bind="args">
          <MButton variant="outline" size="sm">Hover me</MButton>
        </MTooltip>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { content: 'You cannot see me', placement: 'right', arrow: true, disabled: true },
  render: (args) => ({
    components: { MTooltip, MButton },
    setup() {
      return { args }
    },
    template: `
      <div style="padding: 60px; display: flex; align-items: center; justify-content: center;">
        <MTooltip v-bind="args">
          <MButton variant="outline" size="sm">Hover me</MButton>
        </MTooltip>
      </div>
    `,
  }),
}

export const AllPlacements: Story = {
  render: () => ({
    components: { MTooltip, MButton },
    template: `
      <div style="padding: 80px; display: grid; grid-template-columns: repeat(3, auto); place-items: center; gap: 24px;">
        <div />
        <MTooltip content="Top" placement="top">
          <MButton variant="ghost" size="sm">Top</MButton>
        </MTooltip>
        <div />

        <MTooltip content="Left" placement="left">
          <MButton variant="ghost" size="sm">Left</MButton>
        </MTooltip>
        <MButton variant="secondary" size="sm" disabled>Center</MButton>
        <MTooltip content="Right" placement="right">
          <MButton variant="ghost" size="sm">Right</MButton>
        </MTooltip>

        <div />
        <MTooltip content="Bottom" placement="bottom">
          <MButton variant="ghost" size="sm">Bottom</MButton>
        </MTooltip>
        <div />
      </div>
    `,
  }),
}
