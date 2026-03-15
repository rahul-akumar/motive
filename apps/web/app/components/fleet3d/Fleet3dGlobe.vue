<script setup lang="ts">
import type { Driver } from '@motive/shared'

const STATUS_COLORS: Record<string, string> = {
  driving: '#4ade80',
  idle: '#fbbf24',
  alert: '#f87171',
  offline: '#525252',
  sleeper: '#a78bfa',
}

const props = defineProps<{
  drivers: Driver[]
  selectedDriverId: string | null
}>()

const emit = defineEmits<{
  selectDriver: [id: string | null]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let globe: any = null

onMounted(async () => {
  if (!containerRef.value) return

  const GlobeGL = (await import('globe.gl')).default

  const asDriver = (d: object) => d as Driver

  globe = new GlobeGL(containerRef.value)
    .globeImageUrl('/textures/earth-night.jpg')
    .backgroundColor('rgba(0,0,0,0)')
    .atmosphereColor('rgba(100,130,255,0.3)')
    .atmosphereAltitude(0.15)
    .pointsData(props.drivers)
    .pointLat((d) => asDriver(d).currentLocation.lat)
    .pointLng((d) => asDriver(d).currentLocation.lng)
    .pointAltitude(0.01)
    .pointRadius((d) => (asDriver(d).id === props.selectedDriverId ? 0.6 : 0.4))
    .pointColor((d) => STATUS_COLORS[asDriver(d).status] ?? '#ffffff')
    .pointLabel((d) => {
      const drv = asDriver(d)
      return `<div style="font-family:monospace;font-size:12px;background:rgba(0,0,0,0.7);color:#fff;padding:4px 8px;border-radius:4px">${drv.name}<br/>${drv.status.toUpperCase()}</div>`
    })
    .onPointClick((d) => {
      const drv = asDriver(d)
      emit('selectDriver', drv.id === props.selectedDriverId ? null : drv.id)
    })

  // Initial POV: center of USA
  globe.pointOfView({ lat: 39.5, lng: -98.35, altitude: 2.5 })

  // Resize observer
  const ro = new ResizeObserver(() => {
    if (containerRef.value) {
      globe.width(containerRef.value.clientWidth)
      globe.height(containerRef.value.clientHeight)
    }
  })
  ro.observe(containerRef.value)

  // Store for cleanup
  ;(containerRef.value as HTMLDivElement & { _ro: ResizeObserver })._ro = ro
})

onUnmounted(() => {
  if (containerRef.value) {
    const el = containerRef.value as HTMLDivElement & { _ro?: ResizeObserver }
    el._ro?.disconnect()
  }
  if (globe?._destructor) {
    globe._destructor()
  }
  globe = null
})

// Reactive: update points when drivers change
watch(
  () => props.drivers,
  (next) => {
    if (globe) globe.pointsData(next)
  },
  { deep: false },
)

// Reactive: fly to selected driver
watch(
  () => props.selectedDriverId,
  (id) => {
    if (!globe) return
    const driver = props.drivers.find((d) => d.id === id)
    if (driver) {
      globe.pointOfView(
        { lat: driver.currentLocation.lat, lng: driver.currentLocation.lng, altitude: 1.5 },
        800,
      )
    }
    // Re-render points to update radius
    globe.pointsData([...props.drivers])
  },
)
</script>

<template>
  <div ref="containerRef" class="f3d-globe" />
</template>

<style scoped>
.f3d-globe {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}
</style>
