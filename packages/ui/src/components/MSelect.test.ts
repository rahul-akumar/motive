import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MSelect from './MSelect.vue'

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma', disabled: true },
]

describe('MSelect', () => {
  // Menus teleport to <body> and aren't auto-removed between mounts; clear so
  // document-wide queries (esp. searchable filtering) see only the active menu.
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the trigger button', () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'alpha', options: OPTIONS },
      attachTo: document.body,
    })
    expect(wrapper.find('button[role="combobox"]').exists()).toBe(true)
  })

  it('shows selected option label', () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'beta', options: OPTIONS },
      attachTo: document.body,
    })
    expect(wrapper.find('.m-select__value').text()).toBe('Beta')
  })

  it('shows placeholder when no option matches', () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: '', options: OPTIONS, placeholder: 'Pick one' },
      attachTo: document.body,
    })
    expect(wrapper.find('.m-select__value').text()).toBe('Pick one')
  })

  it('opens listbox on trigger click', async () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'alpha', options: OPTIONS },
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    expect(document.querySelector('[role="listbox"]')).toBeTruthy()
  })

  it('shows newly selected option label when modelValue changes', async () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'alpha', options: OPTIONS },
      attachTo: document.body,
    })
    await wrapper.setProps({ modelValue: 'beta' })
    expect(wrapper.find('.m-select__value').text()).toBe('Beta')
  })

  it('trigger has aria-expanded false when closed', () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'alpha', options: OPTIONS },
      attachTo: document.body,
    })
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'alpha', options: OPTIONS, disabled: true },
      attachTo: document.body,
    })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('renders hidden input when name prop is set', () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'beta', options: OPTIONS, name: 'region' },
      attachTo: document.body,
    })
    const hidden = wrapper.find('input[type="hidden"]')
    expect(hidden.exists()).toBe(true)
    expect(hidden.attributes('name')).toBe('region')
    expect(hidden.attributes('value')).toBe('beta')
  })

  it('does not render hidden input when name is absent', () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'alpha', options: OPTIONS },
      attachTo: document.body,
    })
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
  })

  it('sets aria-label on trigger', () => {
    const wrapper = mount(MSelect, {
      props: { modelValue: 'alpha', options: OPTIONS, ariaLabel: 'Region' },
      attachTo: document.body,
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Region')
  })

  describe('searchable', () => {
    it('renders no search field by default', async () => {
      const wrapper = mount(MSelect, {
        props: { modelValue: 'alpha', options: OPTIONS },
        attachTo: document.body,
      })
      await wrapper.find('button').trigger('click')
      expect(document.querySelector('.m-select__search')).toBeNull()
    })

    it('renders a search field when searchable', async () => {
      const wrapper = mount(MSelect, {
        props: { modelValue: 'alpha', options: OPTIONS, searchable: true },
        attachTo: document.body,
      })
      await wrapper.find('button').trigger('click')
      expect(document.querySelector('.m-select__search-input')).toBeTruthy()
    })

    it('filters options by query (case-insensitive)', async () => {
      const wrapper = mount(MSelect, {
        props: { modelValue: 'alpha', options: OPTIONS, searchable: true },
        attachTo: document.body,
      })
      await wrapper.find('button').trigger('click')
      const input = document.querySelector('.m-select__search-input') as HTMLInputElement
      input.value = 'be'
      input.dispatchEvent(new Event('input'))
      await wrapper.vm.$nextTick()
      const opts = document.querySelectorAll('[role="option"]')
      expect(opts.length).toBe(1)
      expect(opts[0]?.textContent?.trim()).toBe('Beta')
    })

    it('shows an empty state when nothing matches', async () => {
      const wrapper = mount(MSelect, {
        props: { modelValue: 'alpha', options: OPTIONS, searchable: true },
        attachTo: document.body,
      })
      await wrapper.find('button').trigger('click')
      const input = document.querySelector('.m-select__search-input') as HTMLInputElement
      input.value = 'zzz'
      input.dispatchEvent(new Event('input'))
      await wrapper.vm.$nextTick()
      expect(document.querySelectorAll('[role="option"]').length).toBe(0)
      expect(document.querySelector('.m-select__empty')).toBeTruthy()
    })

    it('resets the query after closing', async () => {
      const wrapper = mount(MSelect, {
        props: { modelValue: 'alpha', options: OPTIONS, searchable: true },
        attachTo: document.body,
      })
      await wrapper.find('button').trigger('click')
      const input = document.querySelector('.m-select__search-input') as HTMLInputElement
      input.value = 'be'
      input.dispatchEvent(new Event('input'))
      await wrapper.vm.$nextTick()
      // close and reopen
      await wrapper.find('button').trigger('click')
      await wrapper.find('button').trigger('click')
      const reopened = document.querySelector('.m-select__search-input') as HTMLInputElement
      expect(reopened.value).toBe('')
      expect(document.querySelectorAll('[role="option"]').length).toBe(OPTIONS.length)
    })
  })
})
