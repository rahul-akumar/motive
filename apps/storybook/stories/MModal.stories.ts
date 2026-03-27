import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MModal, MButton } from '@motive/ui'

const meta: Meta<typeof MModal> = {
  title: 'Components/MModal',
  component: MModal,
  tags: ['autodocs'],
  argTypes: {
    maxWidth: { control: 'text' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MModal>

export const Basic: Story = {
  render: () => ({
    components: { MModal, MButton },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <MButton variant="primary" @click="open = true">Open Modal</MButton>
        <MModal :open="open" aria-label="Example dialog" @close="open = false">
          <div style="padding: 24px;">
            <h2 id="modal-title" style="margin: 0 0 8px; color: var(--mtv-color-foreground-default); font-size: 1.125rem; font-weight: 600;">
              Confirm Action
            </h2>
            <p style="margin: 0 0 20px; color: var(--mtv-color-foreground-muted); font-size: 0.875rem;">
              Are you sure you want to proceed? This action cannot be undone.
            </p>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <MButton variant="secondary" size="sm" @click="open = false">Cancel</MButton>
              <MButton variant="danger" size="sm" @click="open = false">Confirm</MButton>
            </div>
          </div>
        </MModal>
      </div>
    `,
  }),
}

export const WideModal: Story = {
  render: () => ({
    components: { MModal, MButton },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <MButton variant="outline" @click="open = true">Open Wide Modal</MButton>
        <MModal :open="open" max-width="720px" aria-label="Wide dialog" @close="open = false">
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 12px; color: var(--mtv-color-foreground-default);">Settings</h2>
            <p style="margin: 0 0 8px; color: var(--mtv-color-foreground-muted); font-size: 0.875rem;">
              This is a wider modal to accommodate more content like forms or tables.
            </p>
            <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px;">
              <MButton variant="secondary" size="sm" @click="open = false">Close</MButton>
            </div>
          </div>
        </MModal>
      </div>
    `,
  }),
}
