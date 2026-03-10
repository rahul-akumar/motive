export interface OverlayDef {
  id: string
  label: string
  icon: string
  tileUrl: (key: string, dark: boolean) => string
  opacity: number
  zIndex: number
}

const OVERLAYS: OverlayDef[] = [
  {
    id: 'flow',
    label: 'Traffic Flow',
    icon: 'Gauge',
    tileUrl: (key) =>
      `https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${key}&tileSize=256`,
    opacity: 0.8,
    zIndex: 200,
  },
  {
    id: 'incidents',
    label: 'Incidents',
    icon: 'AlertTriangle',
    tileUrl: (key, dark) =>
      `https://api.tomtom.com/traffic/map/4/tile/incidents/${dark ? 's2' : 's1'}/{z}/{x}/{y}.png?key=${key}&tileSize=256`,
    opacity: 0.9,
    zIndex: 210,
  },
  {
    id: 'satellite',
    label: 'Satellite',
    icon: 'Globe',
    tileUrl: (key) =>
      `https://api.tomtom.com/map/1/tile/sat/main/{z}/{x}/{y}.jpg?key=${key}&tileSize=256`,
    opacity: 1,
    zIndex: 190,
  },
]

export function useTomTomOverlays() {
  const activeOverlayIds = ref<Set<string>>(new Set())

  function toggleOverlay(id: string) {
    const next = new Set(activeOverlayIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    activeOverlayIds.value = next
  }

  return {
    allOverlays: OVERLAYS,
    activeOverlayIds,
    toggleOverlay,
  }
}
