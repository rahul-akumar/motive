import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { MTable } from '@motive/ui'
import type { MTableColumn } from '@motive/ui'

const meta: Meta<typeof MTable> = {
  title: 'Components/MTable',
  component: MTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof MTable>

interface Driver {
  id: number
  name: string
  status: string
  vehicle: string
  score: number
}

const COLUMNS: MTableColumn[] = [
  { key: 'name', label: 'Driver', sortable: true, minWidth: '140px' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'score', label: 'Score', sortable: true, align: 'right' },
]

const ROWS: Driver[] = [
  { id: 1, name: 'Maria Santos', status: 'Driving', vehicle: 'Freightliner M2', score: 91 },
  { id: 2, name: 'James Okafor', status: 'Idle', vehicle: 'Kenworth T680', score: 74 },
  { id: 3, name: 'Li Wei', status: 'Offline', vehicle: 'Peterbilt 579', score: 88 },
  { id: 4, name: 'Priya Nair', status: 'Driving', vehicle: 'Volvo VNL', score: 62 },
  { id: 5, name: 'Carlos Reyes', status: 'Alert', vehicle: 'Mack Anthem', score: 45 },
]

export const Default: Story = {
  render: () => ({
    components: { MTable },
    setup() {
      const sortKey = ref('')
      const sortDir = ref<'asc' | 'desc'>('asc')
      const page = ref(1)

      function handleSort(key: string, dir: 'asc' | 'desc') {
        sortKey.value = key
        sortDir.value = dir
      }

      return { COLUMNS, ROWS, sortKey, sortDir, page, handleSort }
    },
    template: `
      <MTable
        :columns="COLUMNS"
        :rows="ROWS"
        :sort-key="sortKey"
        :sort-dir="sortDir"
        :page="page"
        @sort="handleSort"
        @update:page="page = $event"
      />
    `,
  }),
}

export const Loading: Story = {
  render: () => ({
    components: { MTable },
    setup() {
      return { COLUMNS, ROWS: [] }
    },
    template: `<MTable :columns="COLUMNS" :rows="ROWS" :loading="true" />`,
  }),
}

export const Empty: Story = {
  render: () => ({
    components: { MTable },
    setup() {
      return { COLUMNS }
    },
    template: `<MTable :columns="COLUMNS" :rows="[]" />`,
  }),
}

export const WithPagination: Story = {
  render: () => ({
    components: { MTable },
    setup() {
      const manyRows: Driver[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Driver ${i + 1}`,
        status: ['Driving', 'Idle', 'Offline'][i % 3],
        vehicle: `Vehicle ${i + 1}`,
        score: Math.floor(50 + Math.random() * 50),
      }))
      const page = ref(1)
      return { COLUMNS, manyRows, page }
    },
    template: `
      <MTable
        :columns="COLUMNS"
        :rows="manyRows"
        :page="page"
        :page-size="8"
        @update:page="page = $event"
      />
    `,
  }),
}

export const WithSelectedRow: Story = {
  render: () => ({
    components: { MTable },
    setup() {
      const selectedKey = ref<number | undefined>(2)
      return { COLUMNS, ROWS, selectedKey }
    },
    template: `
      <MTable
        :columns="COLUMNS"
        :rows="ROWS"
        row-key="id"
        :selected-key="selectedKey"
        @row-click="selectedKey = $event.id"
      />
    `,
  }),
}
