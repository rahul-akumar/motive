import type { Meta, StoryObj } from '@storybook/vue3'
import { AsyncBoundary } from '@motive/ui'

const meta: Meta<typeof AsyncBoundary> = {
  title: 'Components/AsyncBoundary',
  component: AsyncBoundary,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['idle', 'pending', 'success', 'error', 'empty'] },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof AsyncBoundary>

const render = (args: Record<string, unknown>) => ({
  components: { AsyncBoundary },
  setup: () => ({ args }),
  template: `
    <div style="width: 440px;">
      <AsyncBoundary v-bind="args" @retry="() => {}">
        <div style="padding: 24px; text-align: center; color: var(--mtv-color-foreground-default);">
          Loaded content
        </div>
      </AsyncBoundary>
    </div>
  `,
})

export const Pending: Story = { args: { status: 'pending' }, render }
export const Success: Story = { args: { status: 'success' }, render }
export const Error: Story = {
  args: { status: 'error', errorTitle: 'Couldn’t load this section' },
  render,
}
export const Empty: Story = {
  args: { status: 'empty', emptyTitle: 'No results', emptyDescription: 'Adjust your filters.' },
  render,
}
