import { feature } from 'topojson-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TopoJSON = any

export interface FleetMapGeoData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  states: any
}

export function useFleetMap() {
  const geoData = ref<FleetMapGeoData | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      const topo = await $fetch<TopoJSON>('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      const states = feature(topo, topo.objects.states)
      geoData.value = { states }
    } catch {
      error.value = 'Failed to load map data'
    } finally {
      loading.value = false
    }
  })

  return { geoData, loading, error }
}
