import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import MBadge from './MBadge.vue'

describe('MBadge — text variant', () => {
  it('renders label prop', () => {
    const wrapper = mount(MBadge, { props: { label: 'Active' } })
    expect(wrapper.text()).toContain('Active')
  })

  it('renders slot content over label', () => {
    const wrapper = mount(MBadge, {
      props: { label: 'ignored' },
      slots: { default: 'Slot wins' },
    })
    expect(wrapper.text()).toContain('Slot wins')
  })

  it('applies text variant classes by default', () => {
    const wrapper = mount(MBadge)
    expect(wrapper.classes()).toContain('m-badge--text')
    expect(wrapper.classes()).toContain('m-badge--md')
    expect(wrapper.classes()).toContain('m-badge--default')
  })

  it('applies color class', () => {
    const wrapper = mount(MBadge, { props: { color: 'success' } })
    expect(wrapper.classes()).toContain('m-badge--success')
  })

  it('applies size class', () => {
    const wrapper = mount(MBadge, { props: { size: 'sm' } })
    expect(wrapper.classes()).toContain('m-badge--sm')
  })

  it('has role="status"', () => {
    const wrapper = mount(MBadge)
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('renders icon on the left by default', () => {
    const IconStub = { template: '<svg class="test-icon" />' }
    const wrapper = mount(MBadge, {
      props: { icon: markRaw(IconStub), iconPosition: 'left', label: 'Label' },
    })
    expect(wrapper.find('.m-badge__icon').exists()).toBe(true)
    const html = wrapper.html()
    expect(html.indexOf('m-badge__icon')).toBeLessThan(html.indexOf('Label'))
  })

  it('renders icon on the right when iconPosition="right"', () => {
    const IconStub = { template: '<svg class="test-icon" />' }
    const wrapper = mount(MBadge, {
      props: { icon: markRaw(IconStub), iconPosition: 'right', label: 'Label' },
    })
    expect(wrapper.find('.m-badge__icon').exists()).toBe(true)
    const html = wrapper.html()
    expect(html.indexOf('m-badge__icon')).toBeGreaterThan(html.indexOf('Label'))
  })
})

describe('MBadge — number variant', () => {
  it('renders count', () => {
    const wrapper = mount(MBadge, { props: { variant: 'number', count: 5 } })
    expect(wrapper.text()).toBe('5')
  })

  it('caps at max and appends "+"', () => {
    const wrapper = mount(MBadge, { props: { variant: 'number', count: 150, max: 99 } })
    expect(wrapper.text()).toBe('99+')
  })

  it('shows exact count when equal to max', () => {
    const wrapper = mount(MBadge, { props: { variant: 'number', count: 99, max: 99 } })
    expect(wrapper.text()).toBe('99')
  })

  it('uses custom max', () => {
    const wrapper = mount(MBadge, { props: { variant: 'number', count: 25, max: 20 } })
    expect(wrapper.text()).toBe('20+')
  })

  it('applies number variant class', () => {
    const wrapper = mount(MBadge, { props: { variant: 'number', count: 3 } })
    expect(wrapper.classes()).toContain('m-badge--number')
  })

  it('has accessible aria-label', () => {
    const wrapper = mount(MBadge, { props: { variant: 'number', count: 7 } })
    expect(wrapper.attributes('aria-label')).toBe('7 notifications')
  })
})

describe('MBadge — score variant', () => {
  it('renders score value', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 85 } })
    expect(wrapper.find('.m-badge__score-value').text()).toBe('85')
  })

  it('renders an svg', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 50 } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('applies score variant class', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 50 } })
    expect(wrapper.classes()).toContain('m-badge--score')
  })

  it('auto-derives danger color for score ≤ 40', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 25 } })
    expect(wrapper.classes()).toContain('m-badge--danger')
  })

  it('auto-derives warning color for score 41–70', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 60 } })
    expect(wrapper.classes()).toContain('m-badge--warning')
  })

  it('auto-derives success color for score 71–100', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 85 } })
    expect(wrapper.classes()).toContain('m-badge--success')
  })

  it('respects explicit color override', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 85, color: 'info' } })
    expect(wrapper.classes()).toContain('m-badge--info')
    expect(wrapper.classes()).not.toContain('m-badge--success')
  })

  it('applies size class to score wrapper', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 50, size: 'lg' } })
    expect(wrapper.classes()).toContain('m-badge--score--lg')
  })

  it('has role="img" with aria-label', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 72, kind: 'safety' } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Safety score: 72')
  })

  it('uses performance kind path attrs', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 50, kind: 'performance' } })
    const path = wrapper.find('path')
    expect(path.attributes('fill-rule')).toBe('evenodd')
    expect(path.attributes('clip-rule')).toBe('evenodd')
  })

  it('does not apply fill-rule to non-performance kinds', () => {
    const wrapper = mount(MBadge, { props: { variant: 'score', score: 50, kind: 'safety' } })
    const path = wrapper.find('path')
    expect(path.attributes('fill-rule')).toBeUndefined()
  })
})
