<script setup lang="ts">
import { User, Settings, BellOff, LogOut } from 'lucide-vue-next'
import { MDropdown, type MDropdownItem } from '@motive/ui'

const emit = defineEmits<{
  openPreferences: []
}>()

const isOpen = ref(false)
const triggerEl = ref<HTMLElement | null>(null)

const menuItems: MDropdownItem[] = [
  {
    label: 'Profile',
    icon: User,
    action: () => {},
  },
  {
    label: 'Preferences',
    icon: Settings,
    action: () => emit('openPreferences'),
  },
  {
    label: 'Pause notifications',
    icon: BellOff,
    divider: true,
    items: [
      { label: '30 minutes', action: () => {} },
      { label: '1 hour', action: () => {} },
      { label: '2 hours', action: () => {} },
      { label: 'Until tomorrow', action: () => {} },
      { label: 'Until next week', action: () => {} },
      { label: 'Custom…', action: () => {} },
    ],
  },
  {
    label: 'Sign out',
    icon: LogOut,
    variant: 'danger',
    divider: true,
    action: () => {},
  },
]

function open(anchorElement: HTMLElement) {
  triggerEl.value = anchorElement
  isOpen.value = true
}

defineExpose({ open })
</script>

<template>
  <MDropdown v-model:open="isOpen" :items="menuItems" :anchor-el="triggerEl" placement="right" />
</template>
