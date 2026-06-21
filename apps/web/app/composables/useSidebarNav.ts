import {
  LayoutDashboard,
  Truck,
  ShieldCheck,
  ClipboardCheck,
  Fuel,
  CreditCard,
  Wrench,
  Users,
  Radio,
  Bell,
  GraduationCap,
  MessageSquare,
  FileText,
  BarChart3,
  ClipboardList,
  Tablet,
  Store,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { MBadgeColor } from '@motive/ui'

export interface SidebarNavItem {
  id: string
  label: string
  href: string
  icon: Component
  wip?: boolean
  badge?: { label: string; color: MBadgeColor }
}

/**
 * Sidebar navigation model — the grouped nav items plus the standalone marketplace
 * entry. Items are filtered against the active region's module config so disabled
 * modules drop out of the menu.
 */
export function useSidebarNav() {
  const { t } = useI18n()
  const { regionModuleConfig } = useRegion()

  const navGroups = computed(() => {
    const cfg = regionModuleConfig.value
    const filter = (items: SidebarNavItem[]) =>
      items.filter((item) => cfg[item.id as keyof typeof cfg]?.enabled !== false)

    return [
      {
        items: filter([
          { id: 'dashboard', label: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
          { id: 'fleet', label: t('nav.fleet'), href: '/fleet', icon: Truck },
          { id: 'safety', label: t('nav.safety'), href: '/safety', icon: ShieldCheck },
          {
            id: 'compliance',
            label: t('nav.compliance'),
            href: '/compliance',
            icon: ClipboardCheck,
          },
          { id: 'fuel', label: t('nav.fuel'), href: '/fuel', icon: Fuel },
          { id: 'cards', label: t('nav.cards'), href: '/cards', icon: CreditCard },
          { id: 'maintenance', label: t('nav.maintenance'), href: '/maintenance', icon: Wrench },
          { id: 'workforce', label: t('nav.workforce'), href: '/workforce', icon: Users },
          { id: 'dispatch', label: t('nav.dispatch'), href: '/dispatch', icon: Radio },
          { id: 'alerts', label: t('nav.alerts'), href: '/alerts', icon: Bell, wip: true },
        ]),
      },
      {
        items: filter([
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
          {
            id: 'documents',
            label: t('nav.documents'),
            href: '/documents',
            icon: FileText,
            wip: true,
          },
        ]),
      },
      {
        items: filter([
          {
            id: 'analytics',
            label: t('nav.analytics'),
            href: '/analytics',
            icon: BarChart3,
            wip: true,
          },
          {
            id: 'reports',
            label: t('nav.reports'),
            href: '/reports',
            icon: ClipboardList,
            wip: true,
          },
          { id: 'devices', label: t('nav.devices'), href: '/devices', icon: Tablet, wip: true },
        ]),
      },
    ]
  })

  const marketplaceItem = computed(() => ({
    id: 'marketplace',
    label: t('nav.marketplace'),
    href: '/marketplace',
    icon: Store,
    wip: true,
  }))

  return { navGroups, marketplaceItem }
}
