import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AsyncBoundary from './AsyncBoundary.vue'

const DEFAULT = { default: '<div class="content">Loaded</div>' }

describe('AsyncBoundary', () => {
  it('renders default slot on success', () => {
    const wrapper = mount(AsyncBoundary, { props: { status: 'success' }, slots: DEFAULT })
    expect(wrapper.find('.content').exists()).toBe(true)
    expect(wrapper.find('.m-skeleton').exists()).toBe(false)
  })

  it('renders the skeleton fallback while pending', () => {
    const wrapper = mount(AsyncBoundary, { props: { status: 'pending' }, slots: DEFAULT })
    expect(wrapper.find('.m-skeleton').exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(false)
  })

  it('treats idle like pending', () => {
    const wrapper = mount(AsyncBoundary, { props: { status: 'idle' }, slots: DEFAULT })
    expect(wrapper.find('.m-skeleton').exists()).toBe(true)
  })

  it('renders the error fallback and emits retry', async () => {
    const wrapper = mount(AsyncBoundary, { props: { status: 'error' }, slots: DEFAULT })
    expect(wrapper.find('.m-empty-state--error').exists()).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('hides the retry button when hideRetry is set', () => {
    const wrapper = mount(AsyncBoundary, {
      props: { status: 'error', hideRetry: true },
      slots: DEFAULT,
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders the empty fallback', () => {
    const wrapper = mount(AsyncBoundary, {
      props: { status: 'empty', emptyTitle: 'No results' },
      slots: DEFAULT,
    })
    expect(wrapper.find('.m-empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No results')
  })

  it('lets a custom pending slot override the default skeleton', () => {
    const wrapper = mount(AsyncBoundary, {
      props: { status: 'pending' },
      slots: { ...DEFAULT, pending: '<div class="custom-loading" />' },
    })
    expect(wrapper.find('.custom-loading').exists()).toBe(true)
    expect(wrapper.find('.m-skeleton').exists()).toBe(false)
  })
})
