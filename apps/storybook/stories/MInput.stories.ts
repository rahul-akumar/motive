import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MInput } from '@motive/ui'

const meta: Meta<typeof MInput> = {
  title: 'Components/MInput',
  component: MInput,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'search', 'email', 'password', 'tel', 'url', 'number'],
    },
    placeholder: { control: 'text' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MInput>

export const Default: Story = {
  render: () => ({
    components: { MInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `<div style="width: 320px;"><MInput v-model="value" placeholder="Search fleet…" /></div>`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { MInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div style="width: 320px; display: flex; flex-direction: column; gap: 0.5rem;">
        <MInput v-model="value" size="xs" placeholder="Extra small" />
        <MInput v-model="value" size="sm" placeholder="Small" />
        <MInput v-model="value" size="md" placeholder="Medium" />
        <MInput v-model="value" size="lg" placeholder="Large" />
      </div>`,
  }),
}

export const Search: Story = {
  render: () => ({
    components: { MInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `<div style="width: 320px;"><MInput v-model="value" type="search" placeholder="Search vehicles, drivers…" /></div>`,
  }),
}

export const Invalid: Story = {
  render: () => ({
    components: { MInput },
    setup() {
      const value = ref('not-an-email')
      return { value }
    },
    template: `<div style="width: 320px;"><MInput v-model="value" type="email" :invalid="true" /></div>`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { MInput },
    setup() {
      const value = ref('Read-only content')
      return { value }
    },
    template: `<div style="width: 320px;"><MInput v-model="value" :disabled="true" /></div>`,
  }),
}
