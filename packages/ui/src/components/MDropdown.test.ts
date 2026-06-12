import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MDropdown from './MDropdown.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

const ITEMS = [
  { label: 'Edit', action: vi.fn() },
  { label: 'Duplicate', action: vi.fn() },
  { divider: true, label: '' },
  { label: 'Delete', variant: 'danger' as const, action: vi.fn() },
]

describe('MDropdown', () => {
  it('renders nothing when closed', () => {
    const wrapper = mount(MDropdown, {
      props: { items: ITEMS, open: false },
      attachTo: document.body,
    })
    expect(document.querySelector('[role="menu"]')).toBeFalsy()
    wrapper.unmount()
  })

  it('renders menu items when open', () => {
    const wrapper = mount(MDropdown, {
      props: { items: ITEMS, open: true },
      attachTo: document.body,
    })
    expect(document.querySelector('[role="menu"]')).toBeTruthy()
    wrapper.unmount()
  })

  it('menu list has role="menu"', () => {
    const wrapper = mount(MDropdown, {
      props: { items: ITEMS, open: true },
      attachTo: document.body,
    })
    expect(document.querySelector('[role="menu"]')).toBeTruthy()
    wrapper.unmount()
  })

  it('item buttons have role="menuitem"', () => {
    const wrapper = mount(MDropdown, {
      props: { items: ITEMS, open: true },
      attachTo: document.body,
    })
    // Scope to the first [role="menu"] to avoid counting any hidden submenu container
    const mainMenu = document.querySelector('[role="menu"]')!
    const menuItems = mainMenu.querySelectorAll('[role="menuitem"]')
    expect(menuItems.length).toBe(3)
    wrapper.unmount()
  })

  it('dividers have role="separator"', () => {
    const wrapper = mount(MDropdown, {
      props: { items: ITEMS, open: true },
      attachTo: document.body,
    })
    expect(document.querySelector('[role="separator"]')).toBeTruthy()
    wrapper.unmount()
  })

  it('renders a labelled divider item as BOTH a separator and a menuitem', () => {
    // `divider: true` on a real item means "draw a leading divider line" — the
    // item itself must still render (regression guard: it once got suppressed).
    const wrapper = mount(MDropdown, {
      props: {
        items: [
          { label: 'Profile', action: vi.fn() },
          { label: 'Sign out', divider: true, action: vi.fn() },
        ],
        open: true,
      },
      attachTo: document.body,
    })
    const mainMenu = document.querySelector('[role="menu"]')!
    expect(mainMenu.querySelectorAll('[role="menuitem"]').length).toBe(2)
    expect(mainMenu.querySelectorAll('[role="separator"]').length).toBe(1)
    expect(mainMenu.textContent).toContain('Sign out')
    wrapper.unmount()
  })

  it('emits update:open false when item with action is clicked', async () => {
    const wrapper = mount(MDropdown, {
      props: { items: ITEMS, open: true },
      attachTo: document.body,
    })
    const mainMenu = document.querySelector('[role="menu"]')!
    const firstItem = mainMenu.querySelector<HTMLElement>('[role="menuitem"]')!
    firstItem.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('calls item action on click', async () => {
    const action = vi.fn()
    const wrapper = mount(MDropdown, {
      props: { items: [{ label: 'Go', action }], open: true },
      attachTo: document.body,
    })
    const btn = document.querySelector<HTMLElement>('[role="menu"] [role="menuitem"]')!
    btn.click()
    await wrapper.vm.$nextTick()
    expect(action).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('item with sub-items has aria-haspopup="menu"', () => {
    const withSub = [{ label: 'More', items: [{ label: 'Sub A', action: vi.fn() }] }]
    const wrapper = mount(MDropdown, {
      props: { items: withSub, open: true },
      attachTo: document.body,
    })
    const btn = document.querySelector<HTMLElement>('[role="menu"] [role="menuitem"]')!
    expect(btn?.getAttribute('aria-haspopup')).toBe('menu')
    wrapper.unmount()
  })
})
