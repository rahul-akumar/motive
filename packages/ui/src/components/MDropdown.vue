<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted, type Component } from 'vue'
import MCard from './MCard.vue'
import MIcon from './MIcon.vue'

export interface MDropdownItem {
  label: string
  icon?: Component
  action?: () => void
  items?: MDropdownItem[]
  variant?: 'default' | 'danger'
  divider?: boolean
}

export interface MDropdownProps {
  items: MDropdownItem[]
  open: boolean
  anchorEl?: HTMLElement | null
  placement?: 'right' | 'top-right'
}

const props = withDefaults(defineProps<MDropdownProps>(), {
  placement: 'right',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const menuRef = ref<InstanceType<typeof MCard> | null>(null)
const submenuRef = ref<InstanceType<typeof MCard> | null>(null)
const itemRefs = ref<(HTMLElement | null)[]>([])
const menuStyle = ref<Record<string, string>>({})
const submenuStyle = ref<Record<string, string>>({})
const activeSubmenuIndex = ref<number | null>(null)

let openTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.open,
  async (val) => {
    if (!val) {
      activeSubmenuIndex.value = null
      if (openTimer) clearTimeout(openTimer)
      if (closeTimer) clearTimeout(closeTimer)
      return
    }
    await nextTick()
    positionMenu()
  },
)

function positionMenu() {
  if (!props.anchorEl) return
  const rect = props.anchorEl.getBoundingClientRect()
  const menuEl = menuRef.value?.$el as HTMLElement | undefined
  if (!menuEl) return

  const vh = window.innerHeight
  const vw = window.innerWidth
  const mw = menuEl.offsetWidth || 200
  const mh = menuEl.offsetHeight || 200

  let left = rect.right + 12
  let top = rect.top

  if (top + mh > vh - 8) top = Math.max(8, vh - mh - 8)
  if (left + mw > vw - 8) left = Math.max(8, rect.left - mw - 8)

  top -= 6

  menuStyle.value = { top: `${top}px`, left: `${left}px` }
}

async function positionSubmenu(index: number) {
  await nextTick()
  const menuEl = menuRef.value?.$el as HTMLElement | undefined
  const itemEl = itemRefs.value[index]
  if (!menuEl || !itemEl) return

  const menuRect = menuEl.getBoundingClientRect()
  const itemRect = itemEl.getBoundingClientRect()
  const submenuEl = submenuRef.value?.$el as HTMLElement | undefined

  const vh = window.innerHeight
  const vw = window.innerWidth
  const sw = submenuEl?.offsetWidth || 180
  const sh = submenuEl?.offsetHeight || 200

  let left = menuRect.right + 4
  let top = itemRect.top

  if (top + sh > vh - 8) top = Math.max(8, vh - sh - 8)
  if (left + sw > vw - 8) left = Math.max(8, menuRect.left - sw - 4)

  top -= 6

  submenuStyle.value = { top: `${top}px`, left: `${left}px` }
}

function handleItemHover(index: number) {
  const item = props.items[index]
  if (!item?.items) {
    if (openTimer) clearTimeout(openTimer)
    closeTimer = setTimeout(() => {
      activeSubmenuIndex.value = null
    }, 100)
    return
  }
  if (closeTimer) clearTimeout(closeTimer)
  openTimer = setTimeout(async () => {
    activeSubmenuIndex.value = index
    await positionSubmenu(index)
  }, 80)
}

function handleMenuLeave() {
  if (openTimer) clearTimeout(openTimer)
  closeTimer = setTimeout(() => {
    activeSubmenuIndex.value = null
  }, 150)
}

function handleSubmenuEnter() {
  if (closeTimer) clearTimeout(closeTimer)
}

function handleSubmenuLeave() {
  closeTimer = setTimeout(() => {
    activeSubmenuIndex.value = null
  }, 100)
}

function handleItemClick(item: MDropdownItem) {
  if (item.items) return
  item.action?.()
  emit('update:open', false)
}

function handleSubItemClick(item: MDropdownItem) {
  item.action?.()
  emit('update:open', false)
}

function handleClickOutside(e: MouseEvent) {
  if (!props.open) return
  const target = e.target as Node
  const menuEl = menuRef.value?.$el as HTMLElement | undefined
  const submenuEl = submenuRef.value?.$el as HTMLElement | undefined
  if (
    (!menuEl || !menuEl.contains(target)) &&
    (!submenuEl || !submenuEl.contains(target)) &&
    (!props.anchorEl || !props.anchorEl.contains(target))
  ) {
    emit('update:open', false)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    emit('update:open', false)
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  if (openTimer) clearTimeout(openTimer)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="m-dropdown">
      <MCard
        v-if="open"
        ref="menuRef"
        class="m-dropdown"
        :style="menuStyle"
        @mouseleave="handleMenuLeave"
      >
        <div class="m-dropdown__list">
          <template v-for="(item, index) in items" :key="index">
            <div v-if="item.divider" class="m-dropdown__divider" />
            <button
              :ref="
                (el) => {
                  itemRefs[index] = el as HTMLElement
                }
              "
              :class="[
                'm-dropdown__item',
                item.variant === 'danger' && 'm-dropdown__item--danger',
                !!item.items && 'm-dropdown__item--has-sub',
                activeSubmenuIndex === index && 'm-dropdown__item--active',
              ]"
              type="button"
              @click="handleItemClick(item)"
              @mouseenter="handleItemHover(index)"
            >
              <MIcon v-if="item.icon" :icon="item.icon" class="m-dropdown__item-icon" />
              <span class="m-dropdown__item-label">{{ item.label }}</span>
              <svg
                v-if="item.items"
                class="m-dropdown__item-chevron"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </template>
        </div>
      </MCard>
    </Transition>
  </Teleport>

  <!-- Submenu -->
  <Teleport to="body">
    <Transition name="m-dropdown-sub">
      <MCard
        v-if="activeSubmenuIndex !== null && open"
        ref="submenuRef"
        class="m-dropdown"
        :style="submenuStyle"
        @mouseenter="handleSubmenuEnter"
        @mouseleave="handleSubmenuLeave"
      >
        <div class="m-dropdown__list">
          <button
            v-for="(subItem, subIndex) in activeSubmenuIndex !== null
              ? items[activeSubmenuIndex]?.items
              : []"
            :key="subIndex"
            :class="[
              'm-dropdown__item',
              subItem.variant === 'danger' && 'm-dropdown__item--danger',
            ]"
            type="button"
            @click="handleSubItemClick(subItem)"
          >
            <MIcon v-if="subItem.icon" :icon="subItem.icon" class="m-dropdown__item-icon" />
            <span class="m-dropdown__item-label">{{ subItem.label }}</span>
          </button>
        </div>
      </MCard>
    </Transition>
  </Teleport>
</template>

<style scoped>
.m-dropdown {
  position: fixed;
  z-index: 9999;
  min-width: 200px;
  padding: 4px;
}

.m-dropdown__list {
  display: flex;
  flex-direction: column;
}

.m-dropdown__divider {
  height: 1px;
  background-color: var(--mtv-color-border-default);
  margin: 4px 0;
}

.m-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--mtv-color-foreground-default);
  font-size: var(--font-size-sm);
  font-family: inherit;
  font-weight: var(--font-weight-normal);
  cursor: pointer;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  transition: background-color 80ms ease;
}

.m-dropdown__item:hover,
.m-dropdown__item--active {
  background-color: hsla(0, 0%, 100%, 0.08);
}

.m-dropdown__item--danger {
  color: var(--color-danger, #ef4444);
}

.m-dropdown__item--danger:hover {
  background-color: hsla(0, 70%, 50%, 0.1);
}

.m-dropdown__item-icon {
  flex-shrink: 0;
  color: var(--mtv-color-foreground-muted);
}

.m-dropdown__item--danger .m-dropdown__item-icon {
  color: var(--color-danger, #ef4444);
}

.m-dropdown__item-label {
  flex: 1;
  font-size: var(--font-size-base);
}

.m-dropdown__item-chevron {
  flex-shrink: 0;
  color: var(--mtv-color-foreground-muted);
}

/* Main menu transition */
.m-dropdown-enter-active,
.m-dropdown-leave-active {
  transition:
    opacity 120ms ease-out,
    transform 120ms ease-out;
}

.m-dropdown-enter-from,
.m-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Submenu transition (slides in from left) */
.m-dropdown-sub-enter-active,
.m-dropdown-sub-leave-active {
  transition:
    opacity 120ms ease-out,
    transform 120ms ease-out;
}

.m-dropdown-sub-enter-from,
.m-dropdown-sub-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
