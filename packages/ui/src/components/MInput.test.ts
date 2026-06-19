import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MInput from './MInput.vue'

describe('MInput', () => {
  it('renders an input reflecting modelValue', () => {
    const wrapper = mount(MInput, { props: { modelValue: 'hello' } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('hello')
  })

  it('defaults to type text and size md', () => {
    const wrapper = mount(MInput)
    const input = wrapper.find('input')
    expect(input.attributes('type')).toBe('text')
    expect(input.classes()).toContain('m-input--md')
  })

  it('applies the requested type and size modifier', () => {
    const wrapper = mount(MInput, { props: { type: 'search', size: 'sm' } })
    expect(wrapper.find('input').attributes('type')).toBe('search')
    expect(wrapper.find('input').classes()).toContain('m-input--sm')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(MInput, { props: { modelValue: '' } })
    const input = wrapper.find('input')
    input.element.value = 'typed'
    await input.trigger('input')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['typed'])
  })

  it('renders placeholder', () => {
    const wrapper = mount(MInput, { props: { placeholder: 'Search…' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search…')
  })

  it('reflects disabled and readonly', () => {
    const wrapper = mount(MInput, { props: { disabled: true, readonly: true } })
    const input = wrapper.find('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('readonly')).toBeDefined()
  })

  it('sets the invalid modifier and aria-invalid', () => {
    const wrapper = mount(MInput, { props: { invalid: true } })
    const input = wrapper.find('input')
    expect(input.classes()).toContain('m-input--invalid')
    expect(input.attributes('aria-invalid')).toBe('true')
  })
})
