<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const { fleetVehicles } = useFleetData()

const vehicleId = computed(() => (route.params.id as string) ?? '')

const breadcrumb = computed(() => {
  const vehicle = fleetVehicles.value.find((v) => v.id === vehicleId.value)
  const label = vehicle ? vehicle.unitNumber : vehicleId.value
  return [
    { label: 'Fleet', to: '/fleet/live' },
    { label: 'Vehicles', to: '/fleet/vehicles' },
    { label },
  ]
})

const tabs = computed(() => [
  { label: 'Live', href: `/fleet/vehicles/${vehicleId.value}/live` },
  { label: 'History', href: `/fleet/vehicles/${vehicleId.value}/history` },
  { label: 'Summary', href: `/fleet/vehicles/${vehicleId.value}/summary` },
  { label: 'Health', href: `/fleet/vehicles/${vehicleId.value}/health` },
  { label: 'Telematics', href: `/fleet/vehicles/${vehicleId.value}/telematics` },
  {
    label: 'Assets',
    href: `/fleet/vehicles/${vehicleId.value}/devices`,
    badge: { label: t('common.beta'), color: 'info' as const },
  },
])
</script>

<template>
  <LayoutAppShell>
    <LayoutAppMainDetail :breadcrumb="breadcrumb" :full-bleed="true">
      <template #tabs>
        <LayoutAppSubNav :tabs="tabs" />
      </template>
      <slot />
    </LayoutAppMainDetail>
  </LayoutAppShell>
</template>
