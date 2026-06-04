import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MDrawer, MButton } from '@motive/ui'

const meta: Meta<typeof MDrawer> = {
  title: 'Components/MDrawer',
  component: MDrawer,
  tags: ['autodocs'],
  argTypes: {
    placement: { control: 'select', options: ['left', 'right'] },
    width: { control: 'text' },
    overlay: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MDrawer>

export const Basic: Story = {
  render: () => ({
    components: { MDrawer, MButton },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <MButton variant="primary" @click="open = true">Open Drawer</MButton>
        <MDrawer v-model:open="open" aria-label="Event details">
          <template #header>
            <span style="font-size: 0.875rem; font-weight: 600; color: var(--mtv-color-foreground-default);">
              Event Details
            </span>
          </template>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <p style="margin: 0; color: var(--mtv-color-foreground-muted); font-size: 0.875rem;">
              This is the drawer body content. It scrolls when content exceeds the viewport height.
            </p>
            <div style="padding: 12px; background: var(--mtv-color-surface-raised); border-radius: 4px; font-size: 0.8125rem; color: var(--mtv-color-foreground-default);">
              <strong>Vehicle:</strong> V-1001<br/>
              <strong>Driver:</strong> John Smith<br/>
              <strong>Type:</strong> Idling Event<br/>
              <strong>Duration:</strong> 42 min
            </div>
          </div>
          <template #footer>
            <MButton variant="primary" size="sm" @click="open = false">View Full Details</MButton>
            <MButton variant="ghost" size="sm" @click="open = false">Dismiss</MButton>
          </template>
        </MDrawer>
      </div>
    `,
  }),
}

export const LeftPlacement: Story = {
  render: () => ({
    components: { MDrawer, MButton },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <MButton variant="outline" @click="open = true">Open Left Drawer</MButton>
        <MDrawer v-model:open="open" placement="left" aria-label="Navigation drawer">
          <template #header>
            <span style="font-size: 0.875rem; font-weight: 600; color: var(--mtv-color-foreground-default);">
              Navigation
            </span>
          </template>
          <nav style="display: flex; flex-direction: column; gap: 4px;">
            <a href="#" style="padding: 8px 12px; border-radius: 4px; font-size: 0.875rem; color: var(--mtv-color-foreground-default); text-decoration: none;">Dashboard</a>
            <a href="#" style="padding: 8px 12px; border-radius: 4px; font-size: 0.875rem; color: var(--mtv-color-foreground-default); text-decoration: none;">Fleet</a>
            <a href="#" style="padding: 8px 12px; border-radius: 4px; font-size: 0.875rem; color: var(--mtv-color-foreground-default); text-decoration: none;">Fuel</a>
          </nav>
        </MDrawer>
      </div>
    `,
  }),
}

export const CustomWidth: Story = {
  render: () => ({
    components: { MDrawer, MButton },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <MButton variant="outline" @click="open = true">Open Wide Drawer (560px)</MButton>
        <MDrawer v-model:open="open" width="560px" aria-label="Wide drawer">
          <template #header>
            <span style="font-size: 0.875rem; font-weight: 600; color: var(--mtv-color-foreground-default);">
              Detailed View
            </span>
          </template>
          <p style="margin: 0; color: var(--mtv-color-foreground-muted); font-size: 0.875rem;">
            A wider drawer for content that needs more horizontal space.
          </p>
        </MDrawer>
      </div>
    `,
  }),
}

export const NoOverlay: Story = {
  render: () => ({
    components: { MDrawer, MButton },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <MButton variant="ghost" @click="open = true">Open Without Overlay</MButton>
        <MDrawer v-model:open="open" :overlay="false" aria-label="Transparent drawer">
          <template #header>
            <span style="font-size: 0.875rem; font-weight: 600; color: var(--mtv-color-foreground-default);">
              Subtle Panel
            </span>
          </template>
          <p style="margin: 0; color: var(--mtv-color-foreground-muted); font-size: 0.875rem;">
            No backdrop overlay — content behind remains fully visible and interactive via click-outside.
          </p>
        </MDrawer>
      </div>
    `,
  }),
}
