import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import { User } from 'lucide-vue-next'
import MIcon from './MIcon.vue'

describe('MIcon', () => {
  it('renders the icon component', () => {
    const wrapper = mount(MIcon, { props: { icon: markRaw(User) } })
    expect(wrapper.html()).toBeTruthy()
  })

  it('has aria-hidden by default', () => {
    const wrapper = mount(MIcon, { props: { icon: markRaw(User) } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('passes size prop', () => {
    const wrapper = mount(MIcon, { props: { icon: markRaw(User), size: 24 } })
    expect(wrapper.attributes('width')).toBe('24')
  })

  it('passes strokeWidth prop', () => {
    const wrapper = mount(MIcon, { props: { icon: markRaw(User), strokeWidth: 2 } })
    expect(wrapper.attributes('stroke-width')).toBe('2')
  })

  it('defaults to size 16 and strokeWidth 1.5', () => {
    const wrapper = mount(MIcon, { props: { icon: markRaw(User) } })
    expect(wrapper.attributes('width')).toBe('16')
    expect(wrapper.attributes('stroke-width')).toBe('1.5')
  })
})
