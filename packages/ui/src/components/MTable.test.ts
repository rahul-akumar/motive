import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MTable from './MTable.vue'

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'score', label: 'Score', sortable: true, align: 'right' as const },
]

const ROWS = [
  { id: 1, name: 'Alice', status: 'Active', score: 90 },
  { id: 2, name: 'Bob', status: 'Idle', score: 60 },
  { id: 3, name: 'Carol', status: 'Offline', score: 40 },
]

describe('MTable', () => {
  it('renders column headers', () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.text()).toContain('Score')
  })

  it('renders row data', () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })

  it('shows empty state when rows is empty', () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: [] } })
    expect(wrapper.text()).toContain('No results found.')
  })

  it('shows loading state', () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: [], loading: true } })
    expect(wrapper.text()).toContain('Loading')
  })

  it('emits sort event when sortable header is clicked', async () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    const sortableTh = wrapper.findAll('th').find((th) => th.text().includes('Name'))
    await sortableTh?.trigger('click')
    expect(wrapper.emitted('sort')?.[0]).toEqual(['name', 'asc'])
  })

  it('emits sort desc when same column clicked twice', async () => {
    const wrapper = mount(MTable, {
      props: { columns: COLUMNS, rows: ROWS, sortKey: 'name', sortDir: 'asc' },
    })
    const nameTh = wrapper.findAll('th').find((th) => th.text().includes('Name'))
    await nameTh?.trigger('click')
    expect(wrapper.emitted('sort')?.[0]).toEqual(['name', 'desc'])
  })

  it('sortable th has tabindex="0"', () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    const sortableTh = wrapper.findAll('th').find((th) => th.text().includes('Name'))
    expect(sortableTh?.attributes('tabindex')).toBe('0')
  })

  it('non-sortable th has no tabindex', () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    const nonSortableTh = wrapper.findAll('th').find((th) => th.text().includes('Status'))
    expect(nonSortableTh?.attributes('tabindex')).toBeUndefined()
  })

  it('emits sort on Enter key on sortable th', async () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    const nameTh = wrapper.findAll('th').find((th) => th.text().includes('Name'))
    await nameTh?.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('sort')?.[0]).toEqual(['name', 'asc'])
  })

  it('emits sort on Space key on sortable th', async () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    const nameTh = wrapper.findAll('th').find((th) => th.text().includes('Name'))
    await nameTh?.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('sort')?.[0]).toEqual(['name', 'asc'])
  })

  it('emits row-click on row click', async () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    await wrapper.findAll('tr').at(1)?.trigger('click')
    expect(wrapper.emitted('row-click')?.[0]).toEqual([ROWS[0]])
  })

  it('emits row-click on Enter key', async () => {
    const wrapper = mount(MTable, { props: { columns: COLUMNS, rows: ROWS } })
    await wrapper.findAll('tr').at(1)?.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('row-click')?.[0]).toEqual([ROWS[0]])
  })

  it('shows pagination when rows exceed pageSize', () => {
    const manyRows = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      status: 'Active',
      score: 80,
    }))
    const wrapper = mount(MTable, {
      props: { columns: COLUMNS, rows: manyRows, pageSize: 8 },
    })
    expect(wrapper.find('.m-table__pagination').exists()).toBe(true)
  })

  it('does not show pagination when rows fit on one page', () => {
    const wrapper = mount(MTable, {
      props: { columns: COLUMNS, rows: ROWS, pageSize: 8 },
    })
    expect(wrapper.find('.m-table__pagination').exists()).toBe(false)
  })

  it('applies aria-sort to active sorted column', () => {
    const wrapper = mount(MTable, {
      props: { columns: COLUMNS, rows: ROWS, sortKey: 'name', sortDir: 'asc' },
    })
    const nameTh = wrapper.findAll('th').find((th) => th.text().includes('Name'))
    expect(nameTh?.attributes('aria-sort')).toBe('ascending')
  })
})
