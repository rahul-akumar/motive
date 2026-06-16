import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { within, userEvent, expect } from '@storybook/test'
import { MPopover, MButton } from '@motive/ui'

const meta: Meta<typeof MPopover> = {
  title: 'Components/MPopover',
  component: MPopover,
  tags: ['autodocs'],
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    arrow: { control: 'boolean' },
    offset: { control: 'number' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MPopover>

export const Default: Story = {
  render: () => ({
    components: { MPopover, MButton },
    setup() {
      const open = ref(false)
      const anchor = ref<HTMLElement | null>(null)
      return { open, anchor }
    },
    template: `
      <div>
        <span ref="anchor" style="display: inline-block;">
          <MButton @click="open = !open">Toggle popover</MButton>
        </span>
        <MPopover :open="open" :anchor-el="anchor" placement="bottom" @update:open="open = $event">
          <div style="padding: 12px; max-width: 220px;">
            <strong>Signal jamming detected</strong>
            <p style="margin: 4px 0 0; color: var(--mtv-color-foreground-muted);">
              Last known location 2 minutes ago near I-35.
            </p>
          </div>
        </MPopover>
      </div>
    `,
  }),
}

export const Placements: Story = {
  render: () => ({
    components: { MPopover, MButton },
    setup() {
      const placement = ref<'top' | 'bottom' | 'left' | 'right'>('top')
      const open = ref(false)
      const anchor = ref<HTMLElement | null>(null)
      function show(p: 'top' | 'bottom' | 'left' | 'right') {
        placement.value = p
        open.value = true
      }
      return { placement, open, anchor, show }
    },
    template: `
      <div style="display: flex; gap: 8px; padding: 80px;">
        <MButton size="sm" variant="outline" @click="show('top')">Top</MButton>
        <MButton size="sm" variant="outline" @click="show('bottom')">Bottom</MButton>
        <MButton size="sm" variant="outline" @click="show('left')">Left</MButton>
        <span ref="anchor"><MButton size="sm" variant="outline" @click="show('right')">Right</MButton></span>
        <MPopover :open="open" :anchor-el="anchor" :placement="placement" @update:open="open = $event">
          <div style="padding: 10px;">Placement: {{ placement }}</div>
        </MPopover>
      </div>
    `,
  }),
}

export const WithoutArrow: Story = {
  render: () => ({
    components: { MPopover, MButton },
    setup() {
      const open = ref(false)
      const anchor = ref<HTMLElement | null>(null)
      return { open, anchor }
    },
    template: `
      <div>
        <span ref="anchor"><MButton @click="open = !open">Toggle</MButton></span>
        <MPopover :open="open" :anchor-el="anchor" placement="bottom" :arrow="false" @update:open="open = $event">
          <div style="padding: 12px;">No arrow, flush against the trigger.</div>
        </MPopover>
      </div>
    `,
  }),
}

export const OpenInteraction: Story = {
  render: () => ({
    components: { MPopover, MButton },
    setup() {
      const open = ref(false)
      const anchor = ref<HTMLElement | null>(null)
      return { open, anchor }
    },
    template: `
      <div>
        <span ref="anchor"><MButton @click="open = !open">Toggle popover</MButton></span>
        <MPopover :open="open" :anchor-el="anchor" placement="bottom" @update:open="open = $event">
          <div style="padding: 12px;">Popover is open</div>
        </MPopover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Popover content teleports to <body>, so query the whole document.
    const body = within(canvasElement.ownerDocument.body)
    await expect(body.queryByText('Popover is open')).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: /toggle popover/i }))
    await expect(await body.findByText('Popover is open')).toBeVisible()
  },
}
