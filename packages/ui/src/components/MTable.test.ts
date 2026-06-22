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

  it('shows a structured skeleton while loading (header + per-column cells preserved)', () => {
    const wrapper = mount(MTable, {
      props: { columns: COLUMNS, rows: [], loading: true, skeletonRows: 4 },
    })
    // Header still renders during loading
    expect(wrapper.text()).toContain('Name')
    const skeletonRows = wrapper.findAll('.m-table__row--skeleton')
    expect(skeletonRows).toHaveLength(4)
    // Each skeleton row has one shimmer cell per column
    expect(skeletonRows[0]!.findAll('.m-skeleton')).toHaveLength(COLUMNS.length)
  })

  it('reserves a populated two-line row height on skeleton cells (no layout shift)', () => {
    const wrapper = mount(MTable, {
      props: { columns: COLUMNS, rows: [], loading: true, skeletonRows: 4 },
    })
    const cells = wrapper.findAll('.m-table__skeleton-cell')
    expect(cells).toHaveLength(COLUMNS.length * 4)
    // Height is derived from the font/line-height tokens, applied inline so it's
    // observable under jsdom (which performs no layout).
    const style = cells[0]!.attributes('style') ?? ''
    expect(style).toContain('min-height')
    expect(style).toContain('--font-size-base')
    expect(style).toContain('--font-size-sm')
    expect(style).toContain('--leading-normal')
  })

  it('honors a custom #loading slot over the default skeleton', () => {
    const wrapper = mount(MTable, {
      props: { columns: COLUMNS, rows: [], loading: true },
      slots: { loading: '<span class="custom-loading">Loading…</span>' },
    })
    expect(wrapper.find('.custom-loading').exists()).toBe(true)
    expect(wrapper.find('.m-table__row--skeleton').exists()).toBe(false)
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
