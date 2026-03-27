import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MTooltip from './MTooltip.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('MTooltip', () => {
  it('renders slot content', () => {
    const wrapper = mount(MTooltip, {
      props: { content: 'Tip text' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    expect(wrapper.text()).toContain('Hover me')
  })

  it('tooltip is initially hidden', () => {
    mount(MTooltip, {
      props: { content: 'Tip text' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    // tooltip is in a Teleport — check document for absence
    expect(document.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('shows tooltip on mouseenter', async () => {
    const wrapper = mount(MTooltip, {
      props: { content: 'Tip text' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.m-tooltip-wrapper').trigger('mouseenter')
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy()
    expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('Tip text')
  })

  it('hides tooltip on mouseleave', async () => {
    const wrapper = mount(MTooltip, {
      props: { content: 'Tip text' },
      slots: { default: '<button>Hover me</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.m-tooltip-wrapper').trigger('mouseenter')
    await wrapper.find('.m-tooltip-wrapper').trigger('mouseleave')
    await wrapper.vm.$nextTick()
    expect(document.querySelector('[role="tooltip"]')).toBeFalsy()
    wrapper.unmount()
  })

  it('shows tooltip on focusin', async () => {
    const wrapper = mount(MTooltip, {
      props: { content: 'Focus tip' },
      slots: { default: '<button>Focus me</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.m-tooltip-wrapper').trigger('focusin')
    expect(document.querySelector('[role="tooltip"]')).toBeTruthy()
  })

  it('hides tooltip on focusout', async () => {
    const wrapper = mount(MTooltip, {
      props: { content: 'Focus tip' },
      slots: { default: '<button>Focus me</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.m-tooltip-wrapper').trigger('focusin')
    await wrapper.find('.m-tooltip-wrapper').trigger('focusout')
    await wrapper.vm.$nextTick()
    expect(document.querySelector('[role="tooltip"]')).toBeFalsy()
    wrapper.unmount()
  })

  it('does not show tooltip when disabled', async () => {
    const wrapper = mount(MTooltip, {
      props: { content: 'Hidden', disabled: true },
      slots: { default: '<button>Hover</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.m-tooltip-wrapper').trigger('mouseenter')
    await wrapper.vm.$nextTick()
    expect(document.querySelector('[role="tooltip"]')).toBeFalsy()
    wrapper.unmount()
  })

  it('tooltip has a unique id attribute', async () => {
    const wrapper = mount(MTooltip, {
      props: { content: 'Tip' },
      slots: { default: '<button>X</button>' },
      attachTo: document.body,
    })
    await wrapper.find('.m-tooltip-wrapper').trigger('mouseenter')
    const tip = document.querySelector('[role="tooltip"]')
    expect(tip?.id).toMatch(/^m-tooltip-/)
  })
})
