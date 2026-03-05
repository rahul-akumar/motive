import type { Meta, StoryObj } from '@storybook/vue3'
import { MButton } from '@motive/ui'

const meta: Meta<typeof MButton> = {
  title: 'Components/MButton',
  component: MButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof MButton>

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
  render: (args) => ({
    components: { MButton },
    setup() {
      return { args }
    },
    template: '<MButton v-bind="args">Button</MButton>',
  }),
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
  },
  render: (args) => ({
    components: { MButton },
    setup() {
      return { args }
    },
    template: '<MButton v-bind="args">Secondary</MButton>',
  }),
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
  },
  render: (args) => ({
    components: { MButton },
    setup() {
      return { args }
    },
    template: '<MButton v-bind="args">Outline</MButton>',
  }),
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    size: 'md',
  },
  render: (args) => ({
    components: { MButton },
    setup() {
      return { args }
    },
    template: '<MButton v-bind="args">Delete</MButton>',
  }),
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true,
  },
  render: (args) => ({
    components: { MButton },
    setup() {
      return { args }
    },
    template: '<MButton v-bind="args">Loading...</MButton>',
  }),
}

export const AllSizes: Story = {
  render: () => ({
    components: { MButton },
    template: `
      <div style="display: flex; align-items: center; gap: 12px;">
        <MButton size="sm">Small</MButton>
        <MButton size="md">Medium</MButton>
        <MButton size="lg">Large</MButton>
      </div>
    `,
  }),
}
