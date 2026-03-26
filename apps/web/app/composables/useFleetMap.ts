import { feature } from 'topojson-client'
import { currentRegion } from '~/composables/useRegion'
import type { RegionCode } from '~/composables/useRegion'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TopoJSON = any

export interface FleetMapGeoData {
  /** GeoJSON FeatureCollection — US state features or a single country feature for MX/UK */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featureCollection: { type: string; features: any[] }
  region: RegionCode
}

// ISO 3166-1 numeric country codes used in world-atlas
const COUNTRY_IDS: Partial<Record<RegionCode, string>> = {
  mx: '484',
  uk: '826',
}

export function useFleetMap() {
  const geoData = ref<FleetMapGeoData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function loadGeoData() {
    loading.value = true
    error.value = null
    geoData.value = null
    const region = currentRegion.value
    try {
      if (region === 'us') {
        const topo = await $fetch<TopoJSON>(
          'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const states = feature(topo, topo.objects.states) as any
        geoData.value = { featureCollection: states, region: 'us' }
      } else {
        const id = COUNTRY_IDS[region]
        const topo = await $fetch<TopoJSON>(
          'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json',
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const countries = feature(topo, topo.objects.countries) as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const countryFeature = countries.features.find((f: any) => f.id === id)
        if (!countryFeature) throw new Error(`No country feature for region: ${region}`)
        geoData.value = {
          featureCollection: { type: 'FeatureCollection', features: [countryFeature] },
          region,
        }
      }
    } catch {
      error.value = 'Failed to load map data'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadGeoData)
  watch(currentRegion, loadGeoData)

  return { geoData, loading, error }
}
