import type { Meta, StoryObj } from '@storybook/vue3'
import { MButton } from '@motive/ui'

const meta: Meta<typeof MButton> = {
  title: 'Components/MButton',
  component: MButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof MButton>

const render = (label: string) => (args: Record<string, unknown>) => ({
  components: { MButton },
  setup() {
    return { args }
  },
  template: `<MButton v-bind="args">${label}</MButton>`,
})

export const Primary: Story = {
  args: { variant: 'primary', size: 'md' },
  render: render('Primary'),
}
export const Secondary: Story = {
  args: { variant: 'secondary', size: 'md' },
  render: render('Secondary'),
}
export const Outline: Story = {
  args: { variant: 'outline', size: 'md' },
  render: render('Outline'),
}
export const Ghost: Story = { args: { variant: 'ghost', size: 'md' }, render: render('Ghost') }
export const Danger: Story = { args: { variant: 'danger', size: 'md' }, render: render('Delete') }
export const Link: Story = { args: { variant: 'link', size: 'md' }, render: render('Link Button') }

export const Loading: Story = {
  args: { variant: 'primary', size: 'md', loading: true },
  render: render('Saving…'),
}

export const Disabled: Story = {
  args: { variant: 'primary', size: 'md', disabled: true },
  render: render('Disabled'),
}

export const Sizes: Story = {
  render: () => ({
    components: { MButton },
    template: `
      <div style="display: flex; align-items: center; gap: 8px;">
        <MButton variant="primary" size="sm">Small</MButton>
        <MButton variant="primary" size="md">Medium</MButton>
        <MButton variant="primary" size="lg">Large</MButton>
      </div>
    `,
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { MButton },
    template: `
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <MButton variant="primary">Primary</MButton>
        <MButton variant="secondary">Secondary</MButton>
        <MButton variant="outline">Outline</MButton>
        <MButton variant="ghost">Ghost</MButton>
        <MButton variant="danger">Danger</MButton>
        <MButton variant="link">Link</MButton>
      </div>
    `,
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
