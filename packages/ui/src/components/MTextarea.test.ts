import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MTextarea from './MTextarea.vue'

describe('MTextarea', () => {
  it('renders modelValue as the textarea value', () => {
    const wrapper = mount(MTextarea, { props: { modelValue: 'Hello' } })
    expect(wrapper.find<HTMLTextAreaElement>('textarea').element.value).toBe('Hello')
  })

  it('sets the placeholder', () => {
    const wrapper = mount(MTextarea, { props: { placeholder: 'Add a note' } })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Add a note')
  })

  it('defaults to 3 rows', () => {
    const wrapper = mount(MTextarea)
    expect(wrapper.find('textarea').attributes('rows')).toBe('3')
  })

  it('applies the no-resize class by default', () => {
    const wrapper = mount(MTextarea)
    expect(wrapper.find('textarea').classes()).toContain('m-textarea--resize-none')
  })

  it('applies the resize variant class', () => {
    const wrapper = mount(MTextarea, { props: { resize: 'vertical' } })
    expect(wrapper.find('textarea').classes()).toContain('m-textarea--resize-vertical')
  })

  it('disables the textarea when disabled', () => {
    const wrapper = mount(MTextarea, { props: { disabled: true } })
    expect(wrapper.find<HTMLTextAreaElement>('textarea').element.disabled).toBe(true)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(MTextarea)
    const textarea = wrapper.find<HTMLTextAreaElement>('textarea')
    textarea.element.value = 'typed'
    await textarea.trigger('input')
    expect(wrapper.emitted('update:modelValue')).toEqual([['typed']])
  })
})
