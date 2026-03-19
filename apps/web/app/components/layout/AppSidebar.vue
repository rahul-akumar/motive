<script setup lang="ts">
import {
  LayoutDashboard,
  Truck,
  Globe,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  ShieldCheck,
  ClipboardCheck,
  Fuel,
  CreditCard,
  Wrench,
  Users,
  Radio,
  GraduationCap,
  MessageSquare,
  FileText,
  BarChart3,
  ClipboardList,
  Tablet,
  Store,
} from 'lucide-vue-next'
import { MIcon, MTooltip, MBadge } from '@motive/ui'
import { useMotion } from '@vueuse/motion'

const { t } = useI18n()
const route = useRoute()

const props = defineProps<{
  isOpen?: boolean
}>()

const emit = defineEmits<{
  openPreferences: [section?: string]
  close: []
}>()

const navGroups = computed(() => [
  {
    items: [
      { id: 'dashboard', label: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
      { id: 'fleet', label: t('nav.fleet'), href: '/fleet', icon: Truck },
      {
        id: 'fleet-3d',
        label: t('nav.fleet3d'),
        href: '/fleet-3d',
        icon: Globe,
        badge: { label: 'Beta', color: 'info' } as const,
      },
      { id: 'safety', label: t('nav.safety'), href: '/safety', icon: ShieldCheck },
      { id: 'compliance', label: t('nav.compliance'), href: '/compliance', icon: ClipboardCheck },
      { id: 'fuel', label: t('nav.fuel'), href: '/fuel', icon: Fuel },
      { id: 'cards', label: t('nav.cards'), href: '/cards', icon: CreditCard },
      { id: 'maintenance', label: t('nav.maintenance'), href: '/maintenance', icon: Wrench },
      { id: 'workforce', label: t('nav.workforce'), href: '/workforce', icon: Users },
      { id: 'dispatch', label: t('nav.dispatch'), href: '/dispatch', icon: Radio },
      { id: 'alerts', label: t('nav.alerts'), href: '/alerts', icon: Bell, wip: true },
    ],
  },
  {
    items: [
      {
        id: 'coaching',
        label: t('nav.coaching'),
        href: '/coaching',
        icon: GraduationCap,
        wip: true,
      },
      {
        id: 'messages',
        label: t('nav.messages'),
        href: '/messages',
        icon: MessageSquare,
        wip: true,
      },
      { id: 'documents', label: t('nav.documents'), href: '/documents', icon: FileText, wip: true },
    ],
  },
  {
    items: [
      {
        id: 'analytics',
        label: t('nav.analytics'),
        href: '/analytics',
        icon: BarChart3,
        wip: true,
      },
      { id: 'reports', label: t('nav.reports'), href: '/reports', icon: ClipboardList, wip: true },
      { id: 'devices', label: t('nav.devices'), href: '/devices', icon: Tablet, wip: true },
    ],
  },
])

const marketplaceItem = computed(() => ({
  id: 'marketplace',
  label: t('nav.marketplace'),
  href: '/marketplace',
  icon: Store,
  wip: true,
}))

function isActive(href: string) {
  if (href === '/') return route.path === '/'
  return route.path === href || route.path.startsWith(href + '/')
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
const userMenuRef = ref<{ open: (anchorEl: HTMLElement) => void } | null>(null)

function openUserMenu(e: MouseEvent) {
  userMenuRef.value?.open(e.currentTarget as HTMLElement)
}

const logoLetterM = ref<SVGElement | null>(null)
const logoLetterO = ref<SVGElement | null>(null)
const logoLetterT = ref<SVGElement | null>(null)
const logoLetterIStem = ref<SVGElement | null>(null)
const logoLetterIDot = ref<SVGElement | null>(null)
const logoLetterV = ref<SVGElement | null>(null)
const logoLetterE = ref<SVGElement | null>(null)

function letterVariantsFor(index: number) {
  const startsCollapsed = collapsed.value
  return {
    initial: startsCollapsed ? { opacity: 0, y: 4 } : { opacity: 1, y: 0 },
    expanded: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 22,
        mass: 0.8,
        delay: index * 35,
      },
    },
    collapsed: {
      opacity: 0,
      transition: { type: 'tween' as const, duration: 120, ease: 'easeIn' as const, delay: 0 },
    },
  }
}

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

const { variant: variantM } = useMotion(logoLetterM, letterVariantsFor(0))
const { variant: variantO } = useMotion(logoLetterO, letterVariantsFor(1))
const { variant: variantT } = useMotion(logoLetterT, letterVariantsFor(2))
const { variant: variantIStem } = useMotion(logoLetterIStem, letterVariantsFor(3))
const { variant: variantIDot } = useMotion(logoLetterIDot, letterVariantsFor(4))
const { variant: variantV } = useMotion(logoLetterV, letterVariantsFor(5))
const { variant: variantE } = useMotion(logoLetterE, letterVariantsFor(6))

const letterVariants = [variantM, variantO, variantT, variantIStem, variantIDot, variantV, variantE]

onMounted(() => {
  const v = collapsed.value ? 'collapsed' : 'expanded'
  sidebarVariant.value = v
  letterVariants.forEach((lv) => {
    lv.value = v
  })
})

function toggleCollapsed() {
  collapsed.value = !collapsed.value
  const target = collapsed.value ? 'collapsed' : 'expanded'
  sidebarVariant.value = target
  letterVariants.forEach((lv) => {
    lv.value = target
  })
  localStorage.setItem('sidebar-collapsed', String(collapsed.value))
}
</script>

<template>
  <aside
    ref="sidebarRef"
    :class="['sidebar', { 'sidebar--open': isOpen, 'sidebar--collapsed': collapsed }]"
  >
    <!-- Logo header -->
    <div class="sidebar__header">
      <svg
        class="sidebar__logo"
        aria-label="Motive"
        fill="none"
        viewBox="0 0 86 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref="logoLetterM"
          d="M14.6003 4.89116H10.0753L3.31154 16.3393H0V19.7259H5.28792L10.8221 10.3504V19.7192H15.2862L20.7945 10.3233V19.7192H24.5823V4.89116H20.037L14.6003 14.0866V4.89116Z"
          fill="currentColor"
        />
        <path
          ref="logoLetterO"
          d="M33.4728 4.71886H33.4444C29.3713 4.71886 26.1003 8.10547 26.1003 12.3049C26.1003 16.5043 29.3713 19.8909 33.4444 19.8909H33.4728C37.5473 19.8909 40.7885 16.4718 40.7885 12.3049C40.7885 8.13797 37.5473 4.71886 33.4728 4.71886ZM33.4728 16.0979H33.4444C31.4369 16.0979 29.888 14.4033 29.888 12.3049C29.888 10.2066 31.4369 8.51191 33.4444 8.51191H33.4728C35.4235 8.51191 37.0049 10.235 37.0049 12.3049C37.0022 14.4005 35.4533 16.0952 33.4728 16.0952V16.0979Z"
          fill="currentColor"
        />
        <path
          ref="logoLetterT"
          d="M47.0964 16.3398V8.19564H50.4242V4.89571H47.0964V0H43.3087V4.89299H41.1578V8.19293H43.3101V19.7197H50.4242V16.333L47.0964 16.3398Z"
          fill="currentColor"
        />
        <path
          ref="logoLetterIStem"
          d="M55.8138 4.89116H52.0261V19.7192H55.8138V4.89251V4.89116Z"
          fill="currentColor"
        />
        <path ref="logoLetterIDot" d="M55.8099 0H52.0317V3.3785H55.8099V0Z" fill="currentColor" />
        <path
          ref="logoLetterV"
          d="M68.4504 4.89543L64.8412 14.5947L61.2321 4.89543H57.1819L62.9109 19.7208H66.7229L72.4856 4.90356H68.4504C68.4504 4.90356 68.4504 4.89407 68.4504 4.89543Z"
          fill="currentColor"
        />
        <path
          ref="logoLetterE"
          d="M79.2198 16.5222C80.7422 16.5222 81.6902 15.6323 81.9482 14.8547H85.7364C85.5928 16.0915 83.9561 19.8885 79.217 19.8885C74.9385 19.8885 71.7773 16.6672 71.7773 12.2944C71.7773 8.00958 75.0238 4.70155 79.1012 4.70155C82.9782 4.70155 86 8.09492 86 12.2375C86 12.6682 85.9715 13.072 85.9431 13.3591H75.6619C75.9178 15.1717 77.0095 16.5222 79.2198 16.5222ZM75.7784 10.6552H82.2721C81.8657 9.16515 80.8649 8.06652 79.113 8.06652C77.2772 8.06652 76.2084 9.13126 75.7826 10.6552H75.7784Z"
          fill="currentColor"
        />
      </svg>
      <MTooltip
        :content="collapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')"
        placement="right"
        :disabled="!collapsed"
      >
        <button
          type="button"
          class="sidebar__collapse-btn"
          :aria-label="collapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')"
          @click="toggleCollapsed"
        >
          <MIcon :icon="collapsed ? PanelLeftOpen : PanelLeftClose" />
        </button>
      </MTooltip>
    </div>

    <!-- Search -->
    <LayoutAppSearchPanel :collapsed="collapsed" />

    <!-- Mobile close button -->
    <button
      type="button"
      class="sidebar__close-btn"
      :aria-label="t('sidebar.closeNavigation')"
      @click="emit('close')"
    >
      <MIcon :icon="X" :size="16" />
    </button>

    <!-- Main Nav -->
    <nav class="sidebar__nav" aria-label="Main navigation">
      <template v-for="(group, groupIndex) in navGroups" :key="groupIndex">
        <hr v-if="groupIndex > 0" class="sidebar__divider" />
        <ul role="list" class="sidebar__nav-list">
          <li v-for="item in group.items" :key="item.id">
            <MTooltip :content="item.label" placement="right" :disabled="!collapsed">
              <NuxtLink
                :to="item.href"
                :class="['sidebar-nav-item', { active: isActive(item.href) }]"
                :aria-current="isActive(item.href) ? 'page' : undefined"
                @click="handleNavClick"
              >
                <MIcon :icon="item.icon" class="sidebar__icon" />
                <span class="sidebar__label">
                  {{ item.label }}
                  <MBadge
                    v-if="item.badge"
                    variant="text"
                    :label="item.badge.label"
                    size="sm"
                    :color="item.badge.color"
                  />
                  <MBadge
                    v-else-if="item.wip"
                    variant="text"
                    label="WIP"
                    size="sm"
                    color="warning"
                  />
                </span>
              </NuxtLink>
            </MTooltip>
          </li>
        </ul>
      </template>
    </nav>

    <!-- Bottom Nav -->
    <div class="sidebar__bottom">
      <!-- Marketplace pinned item -->
      <ul role="list" class="sidebar__nav-list">
        <li>
          <MTooltip :content="marketplaceItem.label" placement="right" :disabled="!collapsed">
            <NuxtLink
              :to="marketplaceItem.href"
              :class="['sidebar-nav-item', { active: isActive(marketplaceItem.href) }]"
              :aria-current="isActive(marketplaceItem.href) ? 'page' : undefined"
              @click="handleNavClick"
            >
              <MIcon :icon="marketplaceItem.icon" class="sidebar__icon" />
              <span class="sidebar__label">{{ marketplaceItem.label }}</span>
            </NuxtLink>
          </MTooltip>
        </li>
      </ul>
      <hr class="sidebar__divider" />

      <!-- User Profile -->
      <MTooltip content="John Dispatch" placement="right" :disabled="!collapsed">
        <div class="sidebar__user" role="button" tabindex="0" @click="openUserMenu">
          <div class="sidebar__user-avatar" aria-hidden="true">JD</div>
          <div class="sidebar__user-info">
            <div class="sidebar__user-name">John Dispatch</div>
          </div>
        </div>
      </MTooltip>
      <LayoutAppUserMenu ref="userMenuRef" @open-preferences="emit('openPreferences')" />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: var(--mtv-color-surface-base);
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

/* ── Header (logo) ── */
.sidebar__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 36px;
  align-items: center;
  padding: 0.5rem 0 0.5rem;
  height: 44px;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar__collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: var(--mtv-color-foreground-muted);
  cursor: pointer;
  transition:
    color 100ms ease,
    background-color 100ms ease;
  flex-shrink: 0;
}

.sidebar__collapse-btn:hover {
  color: var(--mtv-color-foreground-default);
  background-color: oklch(1 0 0 / 0.09);
}

.sidebar__logo {
  height: 16px;
  width: auto;
  color: var(--mtv-color-foreground-default);
  flex-shrink: 0;
  margin-left: 9px;
  /* opacity, transform, transition removed — owned by useMotion on each path */
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
  gap: 0.0625rem;
}

.sidebar__icon {
  justify-self: center;
}

.sidebar__divider {
  border: none;
  border-top: 1px solid var(--mtv-color-border-default);
  margin: 0.25rem 0;
  opacity: 0.5;
}

.sidebar__divider--strong {
  opacity: 1;
  border-top-width: 2px;
}

.sidebar-nav-item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  height: 36px;
  border-radius: 4px;
  color: var(--mtv-color-foreground-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  transition:
    color 100ms ease,
    background-color 100ms ease;
}

.sidebar-nav-item:hover {
  color: var(--mtv-color-foreground-default);
  background-color: oklch(1 0 0 / 0.09);
}

.sidebar-nav-item.active {
  color: var(--mtv-color-foreground-default);
  background-color: var(--sidebar-active-bg);
  box-shadow: var(--sidebar-active-glow);
}

.sidebar-nav-item.active svg {
  color: var(--sidebar-active-icon);
}

.sidebar__label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
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
  background-color: oklab(100% 0 -0.00011 / 0.09);
}

.sidebar__user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 25%;
  background: var(--avatar-bg);
  border: 1px solid var(--mtv-color-border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  color: var(--avatar-text);
  justify-self: center;
  letter-spacing: var(--tracking-wide);
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
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: var(--mtv-color-foreground-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ── Collapsed state ── */

/* Collapsing: sidebar shrinks — width handled by useMotion spring */
.sidebar--collapsed {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

/* Collapsing: labels + user-info slide left and fade out immediately */
.sidebar--collapsed .sidebar__label,
.sidebar--collapsed .sidebar__user-info {
  opacity: 0;
  transform: translateX(-8px);
  pointer-events: none;
  /* Exit: no delay, fast ease-in so it's out of the way before sidebar shrinks */
  transition:
    opacity 100ms ease-in 0ms,
    transform 110ms ease-in 0ms;
}

/* ── Mobile: sidebar becomes a fixed overlay drawer ── */
@media (max-width: 768px) {
  .sidebar__collapse-btn {
    display: none;
  }

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
    box-shadow: 4px 0 24px oklch(0 0 0 / 0.4);
  }

  .sidebar__close-btn {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0.75rem 0.875rem 0;
    background: transparent;
    border: none;
    color: var(--mtv-color-foreground-muted);
    cursor: pointer;
    flex-shrink: 0;
  }

  .sidebar__close-btn:hover {
    color: var(--mtv-color-foreground-default);
  }
}
</style>
