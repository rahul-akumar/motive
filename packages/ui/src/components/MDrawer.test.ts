import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MDrawer from './MDrawer.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('MDrawer', () => {
  it('renders nothing when open is false', () => {
    const wrapper = mount(MDrawer, { props: { open: false }, attachTo: document.body })
    expect(document.querySelector('.m-drawer')).toBeFalsy()
    wrapper.unmount()
  })

  it('renders panel when open is true', () => {
    const wrapper = mount(MDrawer, { props: { open: true }, attachTo: document.body })
    expect(document.querySelector('.m-drawer')).toBeTruthy()
    wrapper.unmount()
  })

  it('renders default slot content', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true },
      slots: { default: '<p class="test-body">Details here</p>' },
      attachTo: document.body,
    })
    expect(document.querySelector('.test-body')).toBeTruthy()
    wrapper.unmount()
  })

  it('renders header slot with close button', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true },
      slots: { header: '<span class="test-header">Title</span>' },
      attachTo: document.body,
    })
    expect(document.querySelector('.test-header')).toBeTruthy()
    expect(document.querySelector('[aria-label="Close drawer"]')).toBeTruthy()
    wrapper.unmount()
  })

  it('renders footer slot', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true },
      slots: { footer: '<button class="test-footer">Save</button>' },
      attachTo: document.body,
    })
    expect(document.querySelector('.test-footer')).toBeTruthy()
    wrapper.unmount()
  })

  it('panel has role="complementary" and no aria-modal by default', () => {
    const wrapper = mount(MDrawer, { props: { open: true }, attachTo: document.body })
    const panel = document.querySelector('.m-drawer')
    expect(panel?.getAttribute('role')).toBe('complementary')
    expect(panel?.hasAttribute('aria-modal')).toBe(false)
    wrapper.unmount()
  })

  it('panel has role="dialog" and aria-modal when overlay is true', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true, overlay: true },
      attachTo: document.body,
    })
    const panel = document.querySelector('.m-drawer')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    wrapper.unmount()
  })

  it('sets aria-label on the panel', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true, ariaLabel: 'Event details' },
      attachTo: document.body,
    })
    expect(document.querySelector('.m-drawer')?.getAttribute('aria-label')).toBe('Event details')
    wrapper.unmount()
  })

  it('sets aria-labelledby on the panel', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true, ariaLabelledby: 'drawer-title' },
      attachTo: document.body,
    })
    expect(document.querySelector('.m-drawer')?.getAttribute('aria-labelledby')).toBe(
      'drawer-title',
    )
    wrapper.unmount()
  })

  it('emits update:open(false) on Escape key', async () => {
    const wrapper = mount(MDrawer, { props: { open: true }, attachTo: document.body })
    const panel = document.querySelector<HTMLElement>('.m-drawer')!
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:open')).toHaveLength(1)
    expect(wrapper.emitted('update:open')![0]).toEqual([false])
    wrapper.unmount()
  })

  it('emits update:open(false) on backdrop click in modal mode', async () => {
    const wrapper = mount(MDrawer, {
      props: { open: true, overlay: true },
      attachTo: document.body,
    })
    const backdrop = document.querySelector<HTMLElement>('.m-drawer-backdrop')!
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:open')).toHaveLength(1)
    expect(wrapper.emitted('update:open')![0]).toEqual([false])
    wrapper.unmount()
  })

  it('no backdrop rendered in non-modal mode', () => {
    const wrapper = mount(MDrawer, { props: { open: true }, attachTo: document.body })
    expect(document.querySelector('.m-drawer-backdrop')).toBeFalsy()
    wrapper.unmount()
  })

  it('renders backdrop in modal mode', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true, overlay: true },
      attachTo: document.body,
    })
    expect(document.querySelector('.m-drawer-backdrop')).toBeTruthy()
    wrapper.unmount()
  })

  it('does not emit update:open when clicking inside the panel', async () => {
    const wrapper = mount(MDrawer, {
      props: { open: true },
      slots: { default: '<button id="inner">Action</button>' },
      attachTo: document.body,
    })
    document.querySelector<HTMLElement>('.m-drawer')!.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:open')).toBeUndefined()
    wrapper.unmount()
  })

  it('emits update:open(false) on click-outside in non-modal mode', async () => {
    const wrapper = mount(MDrawer, { props: { open: true }, attachTo: document.body })
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:open')).toHaveLength(1)
    expect(wrapper.emitted('update:open')![0]).toEqual([false])
    wrapper.unmount()
  })

  it('applies width style to panel', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true, width: '500px' },
      attachTo: document.body,
    })
    const panel = document.querySelector<HTMLElement>('.m-drawer')!
    expect(panel.style.width).toBe('500px')
    wrapper.unmount()
  })

  it('applies placement class (right by default)', () => {
    const wrapper = mount(MDrawer, { props: { open: true }, attachTo: document.body })
    expect(document.querySelector('.m-drawer--right')).toBeTruthy()
    wrapper.unmount()
  })

  it('applies left placement class', () => {
    const wrapper = mount(MDrawer, {
      props: { open: true, placement: 'left' },
      attachTo: document.body,
    })
    expect(document.querySelector('.m-drawer--left')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits update:open(false) when close button is clicked', async () => {
    const wrapper = mount(MDrawer, {
      props: { open: true },
      slots: { header: '<span>Title</span>' },
      attachTo: document.body,
    })
    const closeBtn = document.querySelector<HTMLElement>('[aria-label="Close drawer"]')!
    closeBtn.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:open')).toHaveLength(1)
    expect(wrapper.emitted('update:open')![0]).toEqual([false])
    wrapper.unmount()
  })
})
