import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MSelect from './MSelect.vue'

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma', disabled: true },
]

describe('MSelect', () => {
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
})
