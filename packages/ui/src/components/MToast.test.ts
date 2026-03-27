import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MToast from './MToast.vue'

describe('MToast', () => {
  it('renders message', () => {
    const wrapper = mount(MToast, { props: { message: 'Something happened' } })
    expect(wrapper.text()).toContain('Something happened')
  })

  it('renders subtext when provided', () => {
    const wrapper = mount(MToast, {
      props: { message: 'Title', subtext: 'More detail here' },
    })
    expect(wrapper.text()).toContain('More detail here')
  })

  it('does not render subtext when absent', () => {
    const wrapper = mount(MToast, { props: { message: 'Title' } })
    expect(wrapper.find('.m-toast__subtext').exists()).toBe(false)
  })

  it('has role="alert"', () => {
    const wrapper = mount(MToast, { props: { message: 'Alert' } })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('has aria-live="assertive" for critical variant', () => {
    const wrapper = mount(MToast, { props: { message: 'Critical', variant: 'critical' } })
    expect(wrapper.attributes('aria-live')).toBe('assertive')
  })

  it('has aria-live="polite" for info variant', () => {
    const wrapper = mount(MToast, { props: { message: 'Info', variant: 'info' } })
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('renders dismiss button when dismissible', () => {
    const wrapper = mount(MToast, {
      props: { message: 'Test', dismissible: true, duration: 0 },
    })
    expect(wrapper.find('[aria-label="Dismiss notification"]').exists()).toBe(true)
  })

  it('emits dismiss when dismiss button is clicked', async () => {
    const wrapper = mount(MToast, {
      props: { message: 'Test', dismissible: true, duration: 0 },
    })
    await wrapper.find('[aria-label="Dismiss notification"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('renders action button when actionLabel is provided', () => {
    const wrapper = mount(MToast, {
      props: { message: 'Test', actionLabel: 'Undo', onAction: () => {} },
    })
    expect(wrapper.text()).toContain('Undo')
  })

  it('calls onAction and emits dismiss when action button is clicked', async () => {
    let called = false
    const wrapper = mount(MToast, {
      props: {
        message: 'Test',
        actionLabel: 'Retry',
        onAction: () => {
          called = true
        },
      },
    })
    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Retry')
      ?.trigger('click')
    expect(called).toBe(true)
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('uses CSS variables for critical background (no hardcoded OKLCH)', () => {
    const wrapper = mount(MToast, { props: { message: 'Critical!', variant: 'critical' } })
    const bg = wrapper.attributes('style') ?? ''
    expect(bg).toContain('--mtv-color-status-critical')
    expect(bg).not.toMatch(/oklch\(/)
  })

  it('uses CSS variables for warning background (no hardcoded OKLCH)', () => {
    const wrapper = mount(MToast, { props: { message: 'Warning!', variant: 'warning' } })
    const bg = wrapper.attributes('style') ?? ''
    expect(bg).toContain('--mtv-color-status-warning')
    expect(bg).not.toMatch(/oklch\(/)
  })
})
