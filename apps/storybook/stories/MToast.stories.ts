import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MToast, MButton } from '@motive/ui'
import type { MToastVariant } from '@motive/ui'

const meta: Meta<typeof MToast> = {
  title: 'Components/MToast',
  component: MToast,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['critical', 'warning', 'info', 'success'] },
    dismissible: { control: 'boolean' },
    duration: { control: 'number' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MToast>

export const Info: Story = {
  args: {
    variant: 'info',
    message: 'Route updated for Driver 4.',
    subtext: 'New ETA: 3:45 PM',
    dismissible: true,
    duration: 0,
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    message: 'Vehicle inspection passed.',
    dismissible: true,
    duration: 0,
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    message: 'HOS limit approaching for James Okafor.',
    subtext: '45 minutes of driving time remaining.',
    dismissible: true,
    duration: 0,
  },
}

export const Critical: Story = {
  args: {
    variant: 'critical',
    message: 'HOS violation detected.',
    subtext: 'Carlos Reyes has exceeded the 11‑hour driving limit.',
    dismissible: true,
    duration: 0,
  },
}

export const WithAction: Story = {
  args: {
    variant: 'warning',
    message: 'Driver assignment changed.',
    actionLabel: 'Undo',
    dismissible: false,
    duration: 0,
  },
}

export const AutoDismiss: Story = {
  render: () => ({
    components: { MToast, MButton },
    setup() {
      const visible = ref(false)
      const variants: MToastVariant[] = ['info', 'success', 'warning', 'critical']
      let idx = 0
      const variant = ref<MToastVariant>('info')
      function show() {
        variant.value = variants[idx++ % variants.length]
        visible.value = true
      }
      return { visible, variant, show }
    },
    template: `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px;">
        <MButton variant="primary" size="sm" @click="show">Show Toast (4s)</MButton>
        <MToast
          v-if="visible"
          :variant="variant"
          message="This toast auto-dismisses in 4 seconds."
          :duration="4000"
          :dismissible="true"
          @dismiss="visible = false"
        />
      </div>
    `,
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { MToast },
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; padding: 20px;">
        <MToast variant="info" message="Informational notice." :dismissible="false" :duration="0" />
        <MToast variant="success" message="Operation completed successfully." :dismissible="false" :duration="0" />
        <MToast variant="warning" message="Warning: HOS limit approaching." :dismissible="false" :duration="0" />
        <MToast variant="critical" message="Critical: Immediate action required." :dismissible="false" :duration="0" />
      </div>
    `,
  }),
}
