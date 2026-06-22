import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import MEmptyState from './MEmptyState.vue'

describe('MEmptyState', () => {
  it('renders the title', () => {
    const wrapper = mount(MEmptyState, { props: { title: 'No vehicles' } })
    expect(wrapper.find('.m-empty-state__title').text()).toBe('No vehicles')
  })

  it('renders an optional description', () => {
    const wrapper = mount(MEmptyState, {
      props: { title: 'No vehicles', description: 'Add one to get started.' },
    })
    expect(wrapper.find('.m-empty-state__description').text()).toBe('Add one to get started.')
  })

  it('omits the description node when not provided', () => {
    const wrapper = mount(MEmptyState, { props: { title: 'Empty' } })
    expect(wrapper.find('.m-empty-state__description').exists()).toBe(false)
  })

  it('renders an icon when provided', () => {
    const IconStub = { template: '<svg class="test-icon" />' }
    const wrapper = mount(MEmptyState, {
      props: { title: 'Empty', icon: markRaw(IconStub) },
    })
    expect(wrapper.find('.m-empty-state__icon').exists()).toBe(true)
  })

  it('applies the variant class and alert role for errors', () => {
    const wrapper = mount(MEmptyState, { props: { title: 'Failed', variant: 'error' } })
    expect(wrapper.classes()).toContain('m-empty-state--error')
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('has no alert role for the empty variant', () => {
    const wrapper = mount(MEmptyState, { props: { title: 'Empty' } })
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('renders the action slot', () => {
    const wrapper = mount(MEmptyState, {
      props: { title: 'Empty' },
      slots: { action: '<button class="cta">Add</button>' },
    })
    expect(wrapper.find('.m-empty-state__action .cta').exists()).toBe(true)
  })
})
