import type { Meta, StoryObj } from '@storybook/vue3'
import { MEmptyState, MButton } from '@motive/ui'
import { Inbox, TriangleAlert } from 'lucide-vue-next'

const meta: Meta<typeof MEmptyState> = {
  title: 'Components/MEmptyState',
  component: MEmptyState,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['empty', 'error'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MEmptyState>

export const Empty: Story = {
  args: {
    title: 'No vehicles found',
    description: 'Try adjusting your filters or search to see results.',
  },
  render: (args) => ({
    components: { MEmptyState },
    setup: () => ({ args, Inbox }),
    template: `<div style="width: 420px;"><MEmptyState v-bind="args" :icon="Inbox" /></div>`,
  }),
}

export const WithAction: Story = {
  args: {
    title: 'No saved views yet',
    description: 'Save your current filters to revisit them quickly.',
  },
  render: (args) => ({
    components: { MEmptyState, MButton },
    setup: () => ({ args, Inbox }),
    template: `
      <div style="width: 420px;">
        <MEmptyState v-bind="args" :icon="Inbox">
          <template #action>
            <MButton variant="primary" size="sm">Create a view</MButton>
          </template>
        </MEmptyState>
      </div>
    `,
  }),
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Couldn’t load fleet data',
    description: 'There was a problem reaching the server.',
  },
  render: (args) => ({
    components: { MEmptyState, MButton },
    setup: () => ({ args, TriangleAlert }),
    template: `
      <div style="width: 420px;">
        <MEmptyState v-bind="args" :icon="TriangleAlert">
          <template #action>
            <MButton variant="secondary" size="sm">Try again</MButton>
          </template>
        </MEmptyState>
      </div>
    `,
  }),
}
