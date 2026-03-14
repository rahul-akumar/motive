<script setup lang="ts">
import { LayoutDashboard, Truck, Settings, X, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import { MIcon, MTooltip } from '@motive/ui'
import { useMotion } from '@vueuse/motion'

const route = useRoute()

const props = defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  openSettings: []
  close: []
}>()

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    id: 'fleet',
    label: 'Fleet',
    href: '/fleet',
    icon: Truck,
  },
]

function isActive(href: string) {
  return route.path === href
}

function handleNavClick() {
  emit('close')
}

const collapsed = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem('sidebar-collapsed') === 'true'
    : false,
)

const sidebarRef = ref<HTMLElement | null>(null)

const { variant: sidebarVariant } = useMotion(sidebarRef, {
  initial: { width: collapsed.value ? 48 : 220 },
  expanded: {
    width: 220,
    transition: { type: 'spring', stiffness: 320, damping: 28, mass: 1 },
  },
  collapsed: {
    width: 48,
    transition: { type: 'spring', stiffness: 320, damping: 28, mass: 1 },
  },
})

onMounted(() => {
  sidebarVariant.value = collapsed.value ? 'collapsed' : 'expanded'
})

function toggleCollapsed() {
  collapsed.value = !collapsed.value
  sidebarVariant.value = collapsed.value ? 'collapsed' : 'expanded'
  localStorage.setItem('sidebar-collapsed', String(collapsed.value))
}
</script>

<template>
  <aside
    ref="sidebarRef"
    :class="['sidebar', { 'sidebar--open': isOpen, 'sidebar--collapsed': collapsed }]"
  >
    <!-- Mobile close button -->
    <button
      type="button"
      class="sidebar__close-btn"
      aria-label="Close navigation"
      @click="emit('close')"
    >
      <MIcon :icon="X" :size="16" />
    </button>

    <!-- Main Nav -->
    <nav class="sidebar__nav" aria-label="Main navigation">
      <ul role="list" class="sidebar__nav-list">
        <li v-for="item in navItems" :key="item.id">
          <MTooltip :content="item.label" placement="right" :disabled="!collapsed">
            <NuxtLink
              :to="item.href"
              :class="['sidebar-nav-item', { active: isActive(item.href) }]"
              :aria-current="isActive(item.href) ? 'page' : undefined"
              @click="handleNavClick"
            >
              <MIcon :icon="item.icon" :size="18" class="sidebar__icon" />
              <span class="sidebar__label">{{ item.label }}</span>
            </NuxtLink>
          </MTooltip>
        </li>
      </ul>
    </nav>

    <!-- Bottom Nav -->
    <div class="sidebar__bottom">
      <ul role="list" class="sidebar__nav-list">
        <li>
          <MTooltip content="Settings" placement="right" :disabled="!collapsed">
            <button
              type="button"
              class="sidebar-nav-item sidebar-nav-item--btn"
              aria-label="Open appearance settings"
              @click="emit('openSettings')"
            >
              <MIcon :icon="Settings" :size="18" class="sidebar__icon" />
              <span class="sidebar__label">Settings</span>
            </button>
          </MTooltip>
        </li>
        <li>
          <MTooltip :content="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" placement="right">
            <button
              type="button"
              class="sidebar-nav-item sidebar-nav-item--btn"
              :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
              @click="toggleCollapsed"
            >
              <MIcon
                :icon="collapsed ? PanelLeftOpen : PanelLeftClose"
                :size="18"
                class="sidebar__icon"
              />
              <span class="sidebar__label">{{ collapsed ? 'Expand' : 'Collapse' }}</span>
            </button>
          </MTooltip>
        </li>
      </ul>

      <!-- User Profile -->
      <MTooltip content="John Dispatch" placement="right" :disabled="!collapsed">
        <div class="sidebar__user">
          <div class="sidebar__user-avatar" aria-hidden="true">JD</div>
          <div class="sidebar__user-info">
            <div class="sidebar__user-name">John Dispatch</div>
            <div class="sidebar__user-role">Fleet Manager</div>
          </div>
        </div>
      </MTooltip>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-base);
  padding-inline: 6px;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  will-change: width;
  transform: translateZ(0);
  backface-visibility: hidden;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.sidebar__close-btn {
  display: none;
}

.sidebar__nav {
  flex: 1;
  padding: 0.125rem 0;
  overflow-y: auto;
}

.sidebar__nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar__icon {
  justify-self: center;
}

.sidebar-nav-item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  padding: 0.25rem 0;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  transition:
    color 100ms ease,
    background-color 100ms ease;
}

.sidebar-nav-item:hover {
  color: var(--text-primary);
  background-color: hsla(0, 0%, 100%, 0.09);
}

.sidebar-nav-item.active {
  color: var(--text-primary);
  background-color: var(--sidebar-active-bg);
  box-shadow: var(--sidebar-active-glow);
}

.sidebar-nav-item.active svg {
  color: var(--sidebar-active-icon);
}

.sidebar__label {
  font-size: 1rem;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transform: translateX(0);
  /* Enter: delay 60ms so sidebar has started widening first */
  transition:
    opacity 160ms ease-out 60ms,
    transform 180ms ease-out 60ms;
}

.sidebar__bottom {
  padding: 0.5rem 0;
  flex-shrink: 0;
}

/* Button variant of nav item (for Settings) */
.sidebar-nav-item--btn {
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
}

.sidebar__user {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  padding: 0.5rem 0;
  margin-top: 0.25rem;
  cursor: pointer;
  position: relative;
  transition: background-color 100ms ease;
  gap: 0.5rem;
  border-radius: 4px;
}

.sidebar__user:hover {
  background-color: rgba(255, 255, 255, 0.09);
}

.sidebar__user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 25%;
  background: var(--avatar-bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--avatar-text);
  justify-self: center;
  letter-spacing: 0.04em;
}

.sidebar__user-info {
  overflow: hidden;
  opacity: 1;
  transform: translateX(0);
  /* Enter: delay 60ms so sidebar has started widening first */
  transition:
    opacity 160ms ease-out 60ms,
    transform 180ms ease-out 60ms;
}

.sidebar__user-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.03em;
}

/* ── Collapsed state ── */

/* Collapsing: sidebar shrinks — width handled by useMotion spring */
.sidebar--collapsed {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

/* Collapsing: labels slide left and fade out immediately */
.sidebar--collapsed .sidebar__label,
.sidebar--collapsed .sidebar__user-info {
  opacity: 0;
  transform: translateX(-8px);
  /* Exit: no delay, fast ease-in so it's out of the way before sidebar shrinks */
  transition:
    opacity 100ms ease-in 0ms,
    transform 110ms ease-in 0ms;
}

/* ── Mobile: sidebar becomes a fixed overlay drawer ── */
@media (max-width: 768px) {
  .sidebar,
  .sidebar--collapsed {
    width: 220px !important;
    transition:
      transform 0.25s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    min-height: unset;
    z-index: 50;
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar--open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
  }

  .sidebar__close-btn {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0.75rem 0.875rem 0;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    flex-shrink: 0;
  }

  .sidebar__close-btn:hover {
    color: var(--text-primary);
  }
}
</style>
