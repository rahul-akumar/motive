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
} from 'lucide-vue-next'

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
</script>

<template>
  <aside :class="['sidebar', { 'sidebar--open': isOpen }]">
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
      <div class="sidebar__logo-icon" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" rx="0" fill="var(--logo-bg)" />
          <path d="M3 16L6 9H18L21 16H3Z" fill="var(--logo-text)" opacity="0.9" />
          <circle cx="8" cy="17.5" r="2" fill="var(--logo-text)" />
          <circle cx="16" cy="17.5" r="2" fill="var(--logo-text)" />
        </svg>
      </div>
      <span class="sidebar__logo-text font-mono-data">MOTIVE</span>
    </div>

    <!-- Main Nav -->
    <nav class="sidebar__nav" aria-label="Main navigation">
      <ul role="list" class="sidebar__nav-list">
        <li v-for="item in navItems" :key="item.id">
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
        </li>
      </ul>
    </nav>

    <!-- Bottom Nav -->
    <div class="sidebar__bottom">
      <ul role="list" class="sidebar__nav-list">
        <li>
          <button
            type="button"
            class="sidebar-nav-item sidebar-nav-item--btn"
            aria-label="Open appearance settings"
            @click="emit('openSettings')"
          >
            <Settings :size="16" :stroke-width="1.5" aria-hidden="true" class="sidebar__icon" />
            <span class="sidebar__label">Settings</span>
          </button>
        </li>
      </ul>

      <!-- User Profile -->
      <div class="sidebar__user">
        <div class="sidebar__user-avatar" aria-hidden="true">JD</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">John Dispatch</div>
          <div class="sidebar__user-role">Fleet Manager</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
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
}

.sidebar__logo-icon {
  flex-shrink: 0;
}

.sidebar__logo-text {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--text-primary);
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
  gap: 0;
}

.sidebar__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.sidebar__label {
  font-size: 0.8125rem;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  transition: background-color 100ms ease;
  border-top: 1px solid var(--border);
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

/* ── Mobile: sidebar becomes a fixed overlay drawer ── */
@media (max-width: 768px) {
  .sidebar {
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
