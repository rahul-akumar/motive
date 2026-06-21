import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MCheckbox from './MCheckbox.vue'

describe('MCheckbox', () => {
  it('renders the label prop', () => {
    const wrapper = mount(MCheckbox, { props: { label: 'Show offline' } })
    expect(wrapper.find('.m-checkbox__label').text()).toBe('Show offline')
  })

  it('falls back to the default slot when no label is set', () => {
    const wrapper = mount(MCheckbox, { slots: { default: '<span class="slotted">Custom</span>' } })
    expect(wrapper.find('.m-checkbox__label').exists()).toBe(false)
    expect(wrapper.find('.slotted').exists()).toBe(true)
  })

  it('reflects modelValue as the input checked state', () => {
    const wrapper = mount(MCheckbox, { props: { modelValue: true } })
    expect(wrapper.find<HTMLInputElement>('input').element.checked).toBe(true)
  })

  it('is unchecked and enabled by default', () => {
    const wrapper = mount(MCheckbox)
    expect(wrapper.find<HTMLInputElement>('input').element.checked).toBe(false)
    expect(wrapper.classes()).not.toContain('m-checkbox--disabled')
  })

  it('applies the disabled class and disables the input when disabled', () => {
    const wrapper = mount(MCheckbox, { props: { disabled: true } })
    expect(wrapper.classes()).toContain('m-checkbox--disabled')
    expect(wrapper.find<HTMLInputElement>('input').element.disabled).toBe(true)
  })

  it('emits update:modelValue with the new checked state on change', async () => {
    const wrapper = mount(MCheckbox, { props: { modelValue: false } })
    const input = wrapper.find<HTMLInputElement>('input')
    input.element.checked = true
    await input.trigger('change')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })
})
