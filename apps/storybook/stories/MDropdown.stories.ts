import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Pencil, Trash2, Copy, MoreHorizontal } from 'lucide-vue-next'
import { MDropdown, MButton } from '@motive/ui'
import type { MDropdownItem } from '@motive/ui'

const meta: Meta<typeof MDropdown> = {
  title: 'Components/MDropdown',
  component: MDropdown,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MDropdown>

const BASIC_ITEMS: MDropdownItem[] = [
  { label: 'Edit', icon: Pencil, action: () => alert('Edit') },
  { label: 'Duplicate', icon: Copy, action: () => alert('Duplicate') },
  { label: '', divider: true },
  { label: 'Delete', icon: Trash2, variant: 'danger', action: () => alert('Delete') },
]

export const Basic: Story = {
  render: () => ({
    components: { MDropdown, MButton },
    setup() {
      const open = ref(false)
      const anchorEl = ref<HTMLElement | null>(null)
      const items = BASIC_ITEMS
      return { open, anchorEl, items }
    },
    template: `
      <div style="padding: 80px; display: flex; justify-content: center;">
        <MButton
          ref="anchorEl"
          variant="outline"
          size="sm"
          icon-only
          aria-label="Open menu"
          @click="open = !open; anchorEl = $event.currentTarget"
        >
          <MoreHorizontal :size="16" />
        </MButton>
        <MDropdown
          :items="items"
          :open="open"
          :anchor-el="anchorEl"
          @update:open="open = $event"
        />
      </div>
    `,
  }),
}

const NESTED_ITEMS: MDropdownItem[] = [
  { label: 'View', action: () => {} },
  {
    label: 'Move to',
    items: [
      { label: 'Fleet A', action: () => {} },
      { label: 'Fleet B', action: () => {} },
      { label: 'Fleet C', action: () => {} },
    ],
  },
  { label: '', divider: true },
  { label: 'Remove', variant: 'danger', action: () => {} },
]

export const WithSubmenu: Story = {
  render: () => ({
    components: { MDropdown, MButton },
    setup() {
      const open = ref(false)
      const anchorEl = ref<HTMLElement | null>(null)
      const items = NESTED_ITEMS
      return { open, anchorEl, items }
    },
    template: `
      <div style="padding: 80px; display: flex; justify-content: center;">
        <MButton
          variant="secondary"
          size="sm"
          @click="open = !open; anchorEl = $event.currentTarget"
        >
          Actions
        </MButton>
        <MDropdown
          :items="items"
          :open="open"
          :anchor-el="anchorEl"
          @update:open="open = $event"
        />
      </div>
    `,
  }),
}
