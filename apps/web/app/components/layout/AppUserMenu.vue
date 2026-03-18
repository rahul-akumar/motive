<script setup lang="ts">
import { User, Settings, BellOff, LogOut } from 'lucide-vue-next'
import { MDropdown, type MDropdownItem } from '@motive/ui'

const emit = defineEmits<{
  openPreferences: []
}>()

const { t } = useI18n()

const isOpen = ref(false)
const triggerEl = ref<HTMLElement | null>(null)

const menuItems = computed<MDropdownItem[]>(() => [
  {
    label: t('userMenu.profile'),
    icon: User,
    action: () => {},
  },
  {
    label: t('userMenu.preferences'),
    icon: Settings,
    action: () => emit('openPreferences'),
  },
  {
    label: t('userMenu.pauseNotifications'),
    icon: BellOff,
    divider: true,
    items: [
      { label: t('userMenu.thirtyMinutes'), action: () => {} },
      { label: t('userMenu.oneHour'), action: () => {} },
      { label: t('userMenu.twoHours'), action: () => {} },
      { label: t('userMenu.untilTomorrow'), action: () => {} },
      { label: t('userMenu.untilNextWeek'), action: () => {} },
      { label: t('userMenu.custom'), action: () => {} },
    ],
  },
  {
    label: t('userMenu.signOut'),
    icon: LogOut,
    variant: 'danger',
    divider: true,
    action: () => {},
  },
])

function open(anchorElement: HTMLElement) {
  triggerEl.value = anchorElement
  isOpen.value = true
}

defineExpose({ open })
</script>

<template>
  <MDropdown v-model:open="isOpen" :items="menuItems" :anchor-el="triggerEl" placement="right" />
</template>
