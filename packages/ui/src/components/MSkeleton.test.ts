import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MSkeleton from './MSkeleton.vue'

describe('MSkeleton', () => {
  it('renders a single line bar by default', () => {
    const wrapper = mount(MSkeleton)
    const bars = wrapper.findAll('.m-skeleton__bar')
    expect(bars).toHaveLength(1)
    expect(bars[0]!.classes()).toContain('m-skeleton__bar--line')
  })

  it('renders the requested number of lines', () => {
    const wrapper = mount(MSkeleton, { props: { lines: 3 } })
    expect(wrapper.findAll('.m-skeleton__bar')).toHaveLength(3)
    expect(wrapper.classes()).toContain('m-skeleton--stack')
  })

  it('shortens the last line in a multi-line stack', () => {
    const wrapper = mount(MSkeleton, { props: { lines: 2 } })
    const bars = wrapper.findAll('.m-skeleton__bar')
    expect(bars[1]!.attributes('style')).toContain('width: 70%')
  })

  it('renders a single bar for non-line variants regardless of lines', () => {
    const wrapper = mount(MSkeleton, { props: { variant: 'block', lines: 5 } })
    expect(wrapper.findAll('.m-skeleton__bar')).toHaveLength(1)
    expect(wrapper.find('.m-skeleton__bar').classes()).toContain('m-skeleton__bar--block')
  })

  it('applies a circular shape for the circle variant', () => {
    const wrapper = mount(MSkeleton, { props: { variant: 'circle', width: '40px' } })
    const style = wrapper.find('.m-skeleton__bar').attributes('style')
    expect(style).toContain('border-radius: 50%')
    expect(style).toContain('width: 40px')
  })

  it('exposes an accessible busy status', () => {
    const wrapper = mount(MSkeleton)
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('aria-label')).toBe('Loading')
  })
})
