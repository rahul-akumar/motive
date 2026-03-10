<script setup lang="ts">
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Clock,
  FileBarChart2,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-vue-next'
import { useMotion } from '@vueuse/motion'
import { MTooltip } from '@motive/ui'

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
  {
    id: 'drivers',
    label: 'Drivers',
    href: '/drivers',
    icon: Users,
  },
  {
    id: 'trips',
    label: 'Trips & Loads',
    href: '/trips',
    icon: Route,
  },
  {
    id: 'eld',
    label: 'ELD / HOS',
    href: '/eld',
    icon: Clock,
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: FileBarChart2,
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
  expanded: { width: 220, transition: { duration: 220, ease: 'easeInOut' } },
  collapsed: { width: 48, transition: { duration: 220, ease: 'easeInOut' } },
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
      <X :size="16" aria-hidden="true" />
    </button>

    <!-- Logo -->
    <div class="sidebar__logo">
      <div class="sidebar__logo-wrap">
        <svg
          class="sidebar__logo-svg"
          aria-label="Motive"
          fill="none"
          viewBox="0 0 86 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.6003 4.89116H10.0753L3.31154 16.3393H0V19.7259H5.28792L10.8221 10.3504V19.7192H15.2862L20.7945 10.3233V19.7192H24.5823V4.89116H20.037L14.6003 14.0866V4.89116Z"
            fill="white"
          />
          <path
            d="M33.4728 4.71886H33.4444C29.3713 4.71886 26.1003 8.10547 26.1003 12.3049C26.1003 16.5043 29.3713 19.8909 33.4444 19.8909H33.4728C37.5473 19.8909 40.7885 16.4718 40.7885 12.3049C40.7885 8.13797 37.5473 4.71886 33.4728 4.71886ZM33.4728 16.0979H33.4444C31.4369 16.0979 29.888 14.4033 29.888 12.3049C29.888 10.2066 31.4369 8.51191 33.4444 8.51191H33.4728C35.4235 8.51191 37.0049 10.235 37.0049 12.3049C37.0022 14.4005 35.4533 16.0952 33.4728 16.0952V16.0979Z"
            fill="white"
          />
          <path
            d="M47.0964 16.3398V8.19564H50.4242V4.89571H47.0964V0H43.3087V4.89299H41.1578V8.19293H43.3101V19.7197H50.4242V16.333L47.0964 16.3398Z"
            fill="white"
          />
          <path d="M55.8138 4.89116H52.0261V19.7192H55.8138V4.89251V4.89116Z" fill="white" />
          <path d="M55.8099 0H52.0317V3.3785H55.8099V0Z" fill="white" />
          <path
            d="M68.4504 4.89543L64.8412 14.5947L61.2321 4.89543H57.1819L62.9109 19.7208H66.7229L72.4856 4.90356H68.4504C68.4504 4.90356 68.4504 4.89407 68.4504 4.89543Z"
            fill="white"
          />
          <path
            d="M79.2198 16.5222C80.7422 16.5222 81.6902 15.6323 81.9482 14.8547H85.7364C85.5928 16.0915 83.9561 19.8885 79.217 19.8885C74.9385 19.8885 71.7773 16.6672 71.7773 12.2944C71.7773 8.00958 75.0238 4.70155 79.1012 4.70155C82.9782 4.70155 86 8.09492 86 12.2375C86 12.6682 85.9715 13.072 85.9431 13.3591H75.6619C75.9178 15.1717 77.0095 16.5222 79.2198 16.5222ZM75.7784 10.6552H82.2721C81.8657 9.16515 80.8649 8.06652 79.113 8.06652C77.2772 8.06652 76.2084 9.13126 75.7826 10.6552H75.7784Z"
            fill="white"
          />
        </svg>
      </div>
    </div>

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
              <component
                :is="item.icon"
                :size="16"
                :stroke-width="1.5"
                aria-hidden="true"
                class="sidebar__icon"
              />
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
              <Settings :size="16" :stroke-width="1.5" aria-hidden="true" class="sidebar__icon" />
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
              <component
                :is="collapsed ? PanelLeftOpen : PanelLeftClose"
                :size="16"
                :stroke-width="1.5"
                aria-hidden="true"
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
  min-width: 48px;
  max-width: 220px;
  min-height: 100vh;
  background-color: var(--bg-base);
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.sidebar__close-btn {
  display: none;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 0.875rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  /* gap and padding animate together with sidebar width */
  transition:
    gap 220ms ease-in-out,
    padding 220ms ease-in-out;
}

.sidebar__logo-wrap {
  overflow: hidden;
  max-width: 70px;
  flex-shrink: 0;
  transition: max-width 220ms ease-in-out;
}

.sidebar__logo-svg {
  height: 16px;
  width: 69px; /* 86/20 * 16 */
  display: block;
}

.sidebar__nav {
  flex: 1;
  padding: 0.5rem 0;
  overflow-y: auto;
}

.sidebar__nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

/* Nav item padding/gap animate in sync with sidebar width */
.sidebar-nav-item {
  transition:
    gap 220ms ease-in-out,
    padding 220ms ease-in-out,
    color 100ms ease,
    background-color 100ms ease;
  display: flex;
  align-items: center;
}

.sidebar__label {
  font-size: 1rem;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  /* animate width and opacity in sync with the sidebar */
  max-width: 200px;
  opacity: 1;
  transition:
    max-width 220ms ease-in-out,
    opacity 180ms ease-in-out;
}

.sidebar__bottom {
  padding: 0.5rem 0;
  border-top: 1px solid var(--border);
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
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  margin-top: 0.25rem;
  cursor: pointer;
  border-top: 1px solid var(--border);
  position: relative;
  transition:
    gap 220ms ease-in-out,
    padding 220ms ease-in-out,
    background-color 100ms ease;
}

.sidebar__user:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.sidebar__user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background: var(--avatar-bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--avatar-text);
  flex-shrink: 0;
  letter-spacing: 0.04em;
}

.sidebar__user-info {
  overflow: hidden;
  /* animate width and opacity in sync with the sidebar */
  max-width: 200px;
  opacity: 1;
  transition:
    max-width 220ms ease-in-out,
    opacity 180ms ease-in-out;
}

.sidebar__user-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.03em;
}

/* ── Collapsed state: all transitions already defined above ── */

/* Shrink labels to zero — CSS transition does the animation */
.sidebar--collapsed .sidebar__label,
.sidebar--collapsed .sidebar__user-info {
  max-width: 0;
  opacity: 0;
}

/* Clip logo to just the M */
.sidebar--collapsed .sidebar__logo-wrap {
  max-width: 20px;
}

/* Minimize logo area when collapsed */
.sidebar--collapsed .sidebar__logo {
  gap: 0;
  padding: 1rem 0.75rem;
}

.sidebar--collapsed .sidebar-nav-item {
  gap: 0;
  padding: 0.5rem 0.875rem;
}

.sidebar--collapsed .sidebar__user {
  gap: 0;
  padding: 0.625rem 0.625rem;
}

/* ── Mobile: sidebar becomes a fixed overlay drawer ── */
@media (max-width: 768px) {
  .sidebar {
    width: 220px !important;
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    min-height: unset;
    z-index: 50;
    transform: translateX(-100%);
    transition:
      transform 0.25s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;
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
