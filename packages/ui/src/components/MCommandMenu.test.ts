import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MCommandMenu from './MCommandMenu.vue'
import type { MCommandGroup } from './MCommandMenu.vue'

const groups: MCommandGroup[] = [
  {
    id: 'nav',
    label: 'Navigation',
    items: [
      { id: 'fleet', label: 'Fleet' },
      { id: 'fuel', label: 'Fuel' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [{ id: 'theme', label: 'Toggle theme', sublabel: '⌘T' }],
  },
]

describe('MCommandMenu', () => {
  it('renders grouped options with a combobox/listbox structure', () => {
    const wrapper = mount(MCommandMenu, { props: { groups } })
    expect(wrapper.find('[role="combobox"]').exists()).toBe(true)
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
    expect(wrapper.findAll('.m-command__group-label')[0]!.text()).toBe('Navigation')
  })

  it('emits update:modelValue as the user types', async () => {
    const wrapper = mount(MCommandMenu, { props: { groups } })
    const input = wrapper.find('input')
    await input.setValue('fu')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['fu'])
  })

  it('marks the first option active by default via aria-activedescendant', () => {
    const wrapper = mount(MCommandMenu, { props: { groups } })
    const input = wrapper.find('input')
    const firstOption = wrapper.findAll('[role="option"]')[0]!
    expect(input.attributes('aria-activedescendant')).toBe(firstOption.attributes('id'))
    expect(firstOption.attributes('aria-selected')).toBe('true')
  })

  it('moves the active option with ArrowDown and wraps around', async () => {
    const wrapper = mount(MCommandMenu, { props: { groups } })
    const input = wrapper.find('input')
    const options = wrapper.findAll('[role="option"]')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe(options[1]!.attributes('id'))

    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keydown', { key: 'ArrowUp' })
    // wrapped from index 0 back to the last option
    expect(input.attributes('aria-activedescendant')).toBe(options[2]!.attributes('id'))
  })

  it('selects the active item on Enter', async () => {
    const wrapper = mount(MCommandMenu, { props: { groups } })
    const input = wrapper.find('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'fuel' })
  })

  it('selects an item on click', async () => {
    const wrapper = mount(MCommandMenu, { props: { groups } })
    await wrapper.findAll('[role="option"]')[2]!.trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ id: 'theme' })
  })

  it('emits close on Escape', async () => {
    const wrapper = mount(MCommandMenu, { props: { groups } })
    await wrapper.find('input').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('shows the empty text when there are no items', () => {
    const wrapper = mount(MCommandMenu, {
      props: { groups: [], emptyText: 'Nothing matches' },
    })
    expect(wrapper.find('.m-command__empty').text()).toBe('Nothing matches')
    expect(wrapper.find('[role="option"]').exists()).toBe(false)
  })
})
