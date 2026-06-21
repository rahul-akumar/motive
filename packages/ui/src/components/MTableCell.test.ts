import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MTableCell from './MTableCell.vue'

describe('MTableCell', () => {
  it('renders slot content', () => {
    const wrapper = mount(MTableCell, { slots: { default: 'Unit 4821' } })
    expect(wrapper.text()).toBe('Unit 4821')
  })

  it('renders as a span with the primary variant by default', () => {
    const wrapper = mount(MTableCell)
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('m-table-cell')
    expect(wrapper.classes()).toContain('m-table-cell--primary')
  })

  it('applies the variant class', () => {
    const wrapper = mount(MTableCell, { props: { variant: 'danger' } })
    expect(wrapper.classes()).toContain('m-table-cell--danger')
  })

  it('renders as a custom tag', () => {
    const wrapper = mount(MTableCell, { props: { tag: 'a', variant: 'link' } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.classes()).toContain('m-table-cell--link')
  })
})
