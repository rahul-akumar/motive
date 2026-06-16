import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MCheckbox } from '@motive/ui'

const meta: Meta<typeof MCheckbox> = {
  title: 'Components/MCheckbox',
  component: MCheckbox,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MCheckbox>

export const Default: Story = {
  render: () => ({
    components: { MCheckbox },
    setup() {
      const checked = ref(false)
      return { checked }
    },
    template: `<MCheckbox v-model="checked" label="Email notifications" />`,
  }),
}

export const Checked: Story = {
  render: () => ({
    components: { MCheckbox },
    setup() {
      const checked = ref(true)
      return { checked }
    },
    template: `<MCheckbox v-model="checked" label="Email notifications" />`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { MCheckbox },
    setup() {
      const on = ref(true)
      const off = ref(false)
      return { on, off }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <MCheckbox v-model="off" label="Disabled, unchecked" :disabled="true" />
        <MCheckbox v-model="on" label="Disabled, checked" :disabled="true" />
      </div>
    `,
  }),
}

export const SlotLabel: Story = {
  render: () => ({
    components: { MCheckbox },
    setup() {
      const checked = ref(false)
      return { checked }
    },
    template: `
      <MCheckbox v-model="checked">
        I agree to the <a href="#" @click.prevent>terms of service</a>
      </MCheckbox>
    `,
  }),
}
