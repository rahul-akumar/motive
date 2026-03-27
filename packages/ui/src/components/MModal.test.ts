import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MModal from './MModal.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('MModal', () => {
  it('renders nothing when open is false', () => {
    const wrapper = mount(MModal, { props: { open: false }, attachTo: document.body })
    expect(document.querySelector('.m-modal-panel')).toBeFalsy()
    wrapper.unmount()
  })

  it('renders panel when open is true', () => {
    const wrapper = mount(MModal, { props: { open: true }, attachTo: document.body })
    expect(document.querySelector('.m-modal-panel')).toBeTruthy()
    wrapper.unmount()
  })

  it('renders slot content', () => {
    const wrapper = mount(MModal, {
      props: { open: true },
      slots: { default: '<p class="test-content">Dialog body</p>' },
      attachTo: document.body,
    })
    expect(document.querySelector('.test-content')).toBeTruthy()
    wrapper.unmount()
  })

  it('panel has role="dialog" and aria-modal', () => {
    const wrapper = mount(MModal, { props: { open: true }, attachTo: document.body })
    const panel = document.querySelector('.m-modal-panel')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    wrapper.unmount()
  })

  it('sets aria-label on the panel', () => {
    const wrapper = mount(MModal, {
      props: { open: true, ariaLabel: 'Confirm action' },
      attachTo: document.body,
    })
    expect(document.querySelector('.m-modal-panel')?.getAttribute('aria-label')).toBe(
      'Confirm action',
    )
    wrapper.unmount()
  })

  it('sets aria-labelledby on the panel', () => {
    const wrapper = mount(MModal, {
      props: { open: true, ariaLabelledby: 'modal-heading' },
      attachTo: document.body,
    })
    expect(document.querySelector('.m-modal-panel')?.getAttribute('aria-labelledby')).toBe(
      'modal-heading',
    )
    wrapper.unmount()
  })

  it('emits close on Escape key', async () => {
    const wrapper = mount(MModal, { props: { open: true }, attachTo: document.body })
    const panel = document.querySelector<HTMLElement>('.m-modal-panel')!
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('emits close on backdrop click', async () => {
    const wrapper = mount(MModal, { props: { open: true }, attachTo: document.body })
    const backdrop = document.querySelector<HTMLElement>('.m-modal-backdrop')!
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('does not emit close when clicking inside the panel', async () => {
    const wrapper = mount(MModal, {
      props: { open: true },
      slots: { default: '<button id="inner">OK</button>' },
      attachTo: document.body,
    })
    document.querySelector<HTMLElement>('.m-modal-panel')!.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })

  it('applies maxWidth style to panel', () => {
    const wrapper = mount(MModal, {
      props: { open: true, maxWidth: '640px' },
      attachTo: document.body,
    })
    const panel = document.querySelector<HTMLElement>('.m-modal-panel')!
    expect(panel.style.maxWidth).toBe('640px')
    wrapper.unmount()
  })
})
