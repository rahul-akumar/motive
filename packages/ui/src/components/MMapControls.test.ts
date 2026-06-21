import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Truck, MapPin } from 'lucide-vue-next'
import MMapControls from './MMapControls.vue'
import type { MMapControlsLayer } from './MMapControls.vue'

const layers: MMapControlsLayer[] = [
  { id: 'traffic', label: 'Traffic', icon: MapPin },
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: Truck,
    children: [
      { id: 'trucks', label: 'Trucks', icon: Truck },
      { id: 'vans', label: 'Vans', icon: Truck },
    ],
  },
]

describe('MMapControls', () => {
  it('always renders the zoom-in and zoom-out controls', () => {
    const wrapper = mount(MMapControls)
    expect(wrapper.find('[aria-label="Zoom in"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Zoom out"]').exists()).toBe(true)
  })

  it('emits zoomIn and zoomOut on click', async () => {
    const wrapper = mount(MMapControls)
    await wrapper.find('[aria-label="Zoom in"]').trigger('click')
    await wrapper.find('[aria-label="Zoom out"]').trigger('click')
    expect(wrapper.emitted('zoomIn')).toHaveLength(1)
    expect(wrapper.emitted('zoomOut')).toHaveLength(1)
  })

  it('hides fit-all by default and shows + emits it when enabled', async () => {
    const off = mount(MMapControls)
    expect(off.find('[aria-label="Fit all in view"]').exists()).toBe(false)

    const on = mount(MMapControls, { props: { showFitAll: true } })
    const fit = on.find('[aria-label="Fit all in view"]')
    expect(fit.exists()).toBe(true)
    await fit.trigger('click')
    expect(on.emitted('fitAll')).toHaveLength(1)
  })

  it('toggles the live indicator with showLiveIndicator', () => {
    expect(mount(MMapControls).find('.m-map-controls__live').exists()).toBe(false)
    expect(
      mount(MMapControls, { props: { showLiveIndicator: true } })
        .find('.m-map-controls__live')
        .exists(),
    ).toBe(true)
  })

  it('hides the layers control when there are no layers', () => {
    const wrapper = mount(MMapControls)
    expect(wrapper.find('[aria-label="Toggle map layers"]').exists()).toBe(false)
  })

  it('opens the layers popup and emits toggleLayer for a simple layer', async () => {
    const wrapper = mount(MMapControls, { props: { layers } })
    await wrapper.find('[aria-label="Toggle map layers"]').trigger('click')
    expect(wrapper.find('.m-map-controls__layers-popup').exists()).toBe(true)

    await wrapper.find('[title="Traffic"]').trigger('click')
    expect(wrapper.emitted('toggleLayer')).toEqual([['traffic']])
  })

  it('expands a layer group to reveal its children', async () => {
    const wrapper = mount(MMapControls, { props: { layers } })
    await wrapper.find('[aria-label="Toggle map layers"]').trigger('click')

    expect(wrapper.find('[title="Trucks"]').exists()).toBe(false)
    await wrapper.find('[aria-label="Expand Vehicles"]').trigger('click')
    expect(wrapper.find('[title="Trucks"]').exists()).toBe(true)

    await wrapper.find('[title="Trucks"]').trigger('click')
    expect(wrapper.emitted('toggleLayer')).toEqual([['trucks']])
  })
})
