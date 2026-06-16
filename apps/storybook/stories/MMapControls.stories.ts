import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { Flame, Snowflake, ShieldAlert } from 'lucide-vue-next'
import { MMapControls, type MMapControlsLayer } from '@motive/ui'

const meta: Meta<typeof MMapControls> = {
  title: 'Components/MMapControls',
  component: MMapControls,
  tags: ['autodocs'],
  argTypes: {
    showFitAll: { control: 'boolean' },
    showLiveIndicator: { control: 'boolean' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MMapControls>

const LAYERS: MMapControlsLayer[] = [
  { id: 'traffic', label: 'Traffic', icon: Flame },
  { id: 'weather', label: 'Weather', icon: Snowflake },
  {
    id: 'incidents',
    label: 'Incidents',
    icon: ShieldAlert,
    children: [
      { id: 'jamming', label: 'Signal jamming', icon: ShieldAlert },
      { id: 'theft', label: 'Theft attempts', icon: ShieldAlert },
    ],
  },
]

// Map controls position themselves absolutely, so render them over a framed surface.
const FRAME =
  'position: relative; width: 360px; height: 260px; background: var(--mtv-color-surface-sunken); border: 1px solid var(--mtv-color-border-default); border-radius: 8px; overflow: hidden;'

export const Default: Story = {
  render: () => ({
    components: { MMapControls },
    template: `
      <div style="${FRAME}">
        <MMapControls @zoom-in="() => {}" @zoom-out="() => {}" />
      </div>
    `,
  }),
}

export const WithFitAllAndLive: Story = {
  render: () => ({
    components: { MMapControls },
    template: `
      <div style="${FRAME}">
        <MMapControls :show-fit-all="true" :show-live-indicator="true" />
      </div>
    `,
  }),
}

export const WithLayers: Story = {
  render: () => ({
    components: { MMapControls },
    setup() {
      const activeLayers = ref(new Set<string>(['traffic']))
      function toggleLayer(id: string) {
        const next = new Set(activeLayers.value)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        activeLayers.value = next
      }
      return { layers: LAYERS, activeLayers, toggleLayer }
    },
    template: `
      <div style="${FRAME}">
        <MMapControls
          :layers="layers"
          :active-layers="activeLayers"
          :show-fit-all="true"
          :show-live-indicator="true"
          @toggle-layer="toggleLayer"
        />
      </div>
    `,
  }),
}
