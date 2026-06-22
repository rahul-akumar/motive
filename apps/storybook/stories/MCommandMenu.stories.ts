import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MCommandMenu } from '@motive/ui'
import { Truck, Fuel, ShieldCheck, Palette, Settings, User } from 'lucide-vue-next'

const meta: Meta<typeof MCommandMenu> = {
  title: 'Components/MCommandMenu',
  component: MCommandMenu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MCommandMenu>

const groups = [
  {
    id: 'navigation',
    label: 'Navigation',
    items: [
      { id: 'fleet', label: 'Fleet', icon: Truck },
      { id: 'fuel', label: 'Fuel', icon: Fuel },
      { id: 'safety', label: 'Safety', icon: ShieldCheck },
    ],
  },
  {
    id: 'drivers',
    label: 'Drivers',
    items: [
      { id: 'd1', label: 'Maria Gomez', sublabel: 'DRV-1042', icon: User },
      { id: 'd2', label: 'James Okoro', sublabel: 'DRV-2210', icon: User },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'theme', label: 'Toggle theme', icon: Palette },
      { id: 'prefs', label: 'Open preferences', icon: Settings },
    ],
  },
]

export const Default: Story = {
  render: () => ({
    components: { MCommandMenu },
    setup() {
      const query = ref('')
      return { query, groups }
    },
    template: `
      <div style="width: 440px; height: 360px; display: flex; border: 1px solid var(--mtv-color-border-default); border-radius: var(--card-radius); overflow: hidden; background: var(--mtv-color-surface-default);">
        <MCommandMenu v-model="query" :groups="groups" placeholder="Search or jump to…" style="flex: 1;" />
      </div>
    `,
  }),
}

export const Empty: Story = {
  render: () => ({
    components: { MCommandMenu },
    setup() {
      const query = ref('zzz')
      return { query }
    },
    template: `
      <div style="width: 440px; height: 200px; display: flex; border: 1px solid var(--mtv-color-border-default); border-radius: var(--card-radius); overflow: hidden; background: var(--mtv-color-surface-default);">
        <MCommandMenu v-model="query" :groups="[]" empty-text="No results found." style="flex: 1;" />
      </div>
    `,
  }),
}
