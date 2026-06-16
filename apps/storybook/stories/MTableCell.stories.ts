import type { Meta, StoryObj } from '@storybook/vue3'
import { MTableCell } from '@motive/ui'

const meta: Meta<typeof MTableCell> = {
  title: 'Components/MTableCell',
  component: MTableCell,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'link', 'mono', 'danger'],
    },
    tag: { control: 'text' },
  },
  parameters: { layout: 'centered' },
}

export default meta
type Story = StoryObj<typeof MTableCell>

export const Variants: Story = {
  render: () => ({
    components: { MTableCell },
    template: `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <MTableCell variant="primary">Primary — Unit 4821</MTableCell>
        <MTableCell variant="secondary">Secondary — Freightliner Cascadia</MTableCell>
        <MTableCell variant="muted">Muted — last seen 2h ago</MTableCell>
        <MTableCell variant="mono">MONO — VIN 1FUJGLDR0CLBP8834</MTableCell>
        <MTableCell variant="danger">Danger — Out of service</MTableCell>
      </div>
    `,
  }),
}

export const AsLink: Story = {
  render: () => ({
    components: { MTableCell },
    template: `<MTableCell variant="link" tag="a" href="#" @click.prevent>View vehicle</MTableCell>`,
  }),
}

export const InTableRow: Story = {
  render: () => ({
    components: { MTableCell },
    template: `
      <table style="border-collapse: collapse;">
        <tbody>
          <tr>
            <td style="padding: 8px 16px;">
              <MTableCell variant="primary">Unit 4821</MTableCell>
              <MTableCell variant="secondary">Freightliner Cascadia</MTableCell>
            </td>
            <td style="padding: 8px 16px;"><MTableCell variant="muted">Dallas, TX</MTableCell></td>
            <td style="padding: 8px 16px;"><MTableCell variant="danger">Out of service</MTableCell></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
}
