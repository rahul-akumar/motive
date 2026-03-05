import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MButton from './MButton.vue'

describe('MButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(MButton, {
      slots: { default: 'Click me' },
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('applies primary variant by default', () => {
    const wrapper = mount(MButton)
    expect(wrapper.classes()).toContain('m-button--primary')
  })

  it('applies the correct variant class', () => {
    const wrapper = mount(MButton, {
      props: { variant: 'danger' },
    })
    expect(wrapper.classes()).toContain('m-button--danger')
  })

  it('applies the correct size class', () => {
    const wrapper = mount(MButton, {
      props: { size: 'lg' },
    })
    expect(wrapper.classes()).toContain('m-button--lg')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(MButton, {
      props: { disabled: true },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('is disabled when loading prop is true', () => {
    const wrapper = mount(MButton, {
      props: { loading: true },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('m-button--loading')
  })

  it('shows spinner when loading', () => {
    const wrapper = mount(MButton, {
      props: { loading: true },
    })
    expect(wrapper.find('.m-button__spinner').exists()).toBe(true)
  })

  it('emits click event', async () => {
    const wrapper = mount(MButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
