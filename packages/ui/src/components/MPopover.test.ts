import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MPopover from './MPopover.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('MPopover', () => {
  it('renders nothing when closed', () => {
    const wrapper = mount(MPopover, { props: { open: false }, attachTo: document.body })
    expect(document.querySelector('.m-popover')).toBeFalsy()
    wrapper.unmount()
  })

  it('renders when open', () => {
    const wrapper = mount(MPopover, { props: { open: true }, attachTo: document.body })
    expect(document.querySelector('.m-popover')).toBeTruthy()
    wrapper.unmount()
  })

  it('renders slot content', () => {
    const wrapper = mount(MPopover, {
      props: { open: true },
      slots: { default: '<p class="test-content">Tooltip body</p>' },
      attachTo: document.body,
    })
    expect(document.querySelector('.test-content')).toBeTruthy()
    wrapper.unmount()
  })

  it('has role="dialog" and applies the aria-label', () => {
    const wrapper = mount(MPopover, {
      props: { open: true, ariaLabel: 'Day breakdown' },
      attachTo: document.body,
    })
    const el = document.querySelector('.m-popover')
    expect(el?.getAttribute('role')).toBe('dialog')
    expect(el?.getAttribute('aria-label')).toBe('Day breakdown')
    wrapper.unmount()
  })

  it('applies placement and variant classes', () => {
    const wrapper = mount(MPopover, {
      props: { open: true, placement: 'bottom', variant: 'inverse' },
      attachTo: document.body,
    })
    const el = document.querySelector('.m-popover')!
    expect(el.classList.contains('m-popover--bottom')).toBe(true)
    expect(el.classList.contains('m-popover--inverse')).toBe(true)
    wrapper.unmount()
  })

  it('renders the arrow by default and omits it when arrow is false', () => {
    const withArrow = mount(MPopover, { props: { open: true }, attachTo: document.body })
    expect(document.querySelector('.m-popover')?.classList.contains('m-popover--arrow')).toBe(true)
    withArrow.unmount()

    const noArrow = mount(MPopover, {
      props: { open: true, arrow: false },
      attachTo: document.body,
    })
    expect(document.querySelector('.m-popover')?.classList.contains('m-popover--arrow')).toBe(false)
    noArrow.unmount()
  })

  it('emits update:open=false on Escape', async () => {
    const wrapper = mount(MPopover, { props: { open: true }, attachTo: document.body })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:open')).toEqual([[false]])
    wrapper.unmount()
  })

  it('closes on click-outside, but not when persistent', async () => {
    const transient = mount(MPopover, { props: { open: true }, attachTo: document.body })
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await transient.vm.$nextTick()
    expect(transient.emitted('update:open')).toEqual([[false]])
    transient.unmount()

    const persistent = mount(MPopover, {
      props: { open: true, persistent: true },
      attachTo: document.body,
    })
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await persistent.vm.$nextTick()
    expect(persistent.emitted('update:open')).toBeUndefined()
    persistent.unmount()
  })
})
