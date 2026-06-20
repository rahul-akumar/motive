<script setup lang="ts">
import { useCameraData, type CameraType } from '~/composables/useCameraData'

const { cameras } = useCameraData()

const typeCounts = computed(() => {
  const counts: Record<CameraType, number> = { dashcam: 0, 'ai-omnicam': 0, 'multi-cam-dvr': 0 }
  for (const cam of cameras.value) counts[cam.type]++
  return counts
})
</script>

<template>
  <div class="camera-panel">
    <!-- Type Breakdown -->
    <LayoutPanelSection title="By Type">
      <LayoutPanelKpiRow label="Dashcam" :value="typeCounts.dashcam" />
      <LayoutPanelKpiRow label="AI Omnicam" :value="typeCounts['ai-omnicam']" />
      <LayoutPanelKpiRow label="Multi-Cam DVR" :value="typeCounts['multi-cam-dvr']" />
    </LayoutPanelSection>
  </div>
</template>

<style scoped>
.camera-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
</style>
