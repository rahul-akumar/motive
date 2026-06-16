import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MTextarea } from '@motive/ui'

const meta: Meta<typeof MTextarea> = {
  title: 'Components/MTextarea',
  component: MTextarea,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    disabled: { control: 'boolean' },
    resize: { control: 'select', options: ['none', 'vertical', 'both'] },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MTextarea>

export const Default: Story = {
  render: () => ({
    components: { MTextarea },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `<div style="width: 320px;"><MTextarea v-model="value" placeholder="Add a note…" /></div>`,
  }),
}

export const WithValue: Story = {
  render: () => ({
    components: { MTextarea },
    setup() {
      const value = ref('Driver reported a soft brake pedal during the morning route.')
      return { value }
    },
    template: `<div style="width: 320px;"><MTextarea v-model="value" :rows="4" /></div>`,
  }),
}

export const Resizable: Story = {
  render: () => ({
    components: { MTextarea },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `<div style="width: 320px;"><MTextarea v-model="value" resize="vertical" placeholder="Drag the bottom edge to resize" /></div>`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { MTextarea },
    setup() {
      const value = ref('Read-only content')
      return { value }
    },
    template: `<div style="width: 320px;"><MTextarea v-model="value" :disabled="true" /></div>`,
  }),
}
