import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MCard from './MCard.vue'

describe('MCard', () => {
  it('renders slot content', () => {
    const wrapper = mount(MCard, { slots: { default: '<p>Content</p>' } })
    expect(wrapper.html()).toContain('<p>Content</p>')
  })

  it('applies base class', () => {
    const wrapper = mount(MCard)
    expect(wrapper.classes()).toContain('m-card')
  })

  it('defaults to pad-none', () => {
    const wrapper = mount(MCard)
    expect(wrapper.classes()).toContain('m-card--pad-none')
  })

  it('applies pad-sm class', () => {
    const wrapper = mount(MCard, { props: { padding: 'sm' } })
    expect(wrapper.classes()).toContain('m-card--pad-sm')
  })

  it('applies pad-md class', () => {
    const wrapper = mount(MCard, { props: { padding: 'md' } })
    expect(wrapper.classes()).toContain('m-card--pad-md')
  })
})
