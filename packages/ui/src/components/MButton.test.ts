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

  it('applies ghost variant class', () => {
    const wrapper = mount(MButton, { props: { variant: 'ghost' } })
    expect(wrapper.classes()).toContain('m-button--ghost')
  })

  it('applies link variant class', () => {
    const wrapper = mount(MButton, { props: { variant: 'link' } })
    expect(wrapper.classes()).toContain('m-button--link')
  })

  it('applies the correct size class', () => {
    const wrapper = mount(MButton, {
      props: { size: 'lg' },
    })
    expect(wrapper.classes()).toContain('m-button--lg')
  })

  it('defaults to type="button"', () => {
    const wrapper = mount(MButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('respects explicit type prop', () => {
    const wrapper = mount(MButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
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

  it('sets aria-busy when loading', () => {
    const wrapper = mount(MButton, { props: { loading: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('does not set aria-busy when not loading', () => {
    const wrapper = mount(MButton)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
  })

  it('shows spinner when loading', () => {
    const wrapper = mount(MButton, {
      props: { loading: true },
    })
    expect(wrapper.find('.m-button__spinner').exists()).toBe(true)
  })

  it('spinner has accessible role and label', () => {
    const wrapper = mount(MButton, { props: { loading: true } })
    const spinner = wrapper.find('.m-button__spinner')
    expect(spinner.attributes('role')).toBe('status')
    expect(spinner.attributes('aria-label')).toBe('Loading')
  })

  it('applies icon-only class', () => {
    const wrapper = mount(MButton, { props: { iconOnly: true } })
    expect(wrapper.classes()).toContain('m-button--icon-only')
  })

  it('emits click event', async () => {
    const wrapper = mount(MButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(MButton, { props: { disabled: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does not emit click when loading', async () => {
    const wrapper = mount(MButton, { props: { loading: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
