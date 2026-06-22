import Fuse from 'fuse.js'
import { Truck, Users, Package, Palette, Globe, Clock } from 'lucide-vue-next'
import type { MCommandGroup, MCommandItemView } from '@motive/ui'
import { THEMES } from '~/composables/useTheme'
import { REGIONS } from '~/composables/useRegion'

type CommandType = 'navigation' | 'vehicle' | 'driver' | 'asset' | 'action'

interface CommandItem extends MCommandItemView {
  type: CommandType
  keywords: string
  run: () => void | Promise<void>
}

const GROUP_LABEL: Record<CommandType, string> = {
  navigation: 'Navigation',
  vehicle: 'Vehicles',
  driver: 'Drivers',
  asset: 'Assets',
  action: 'Actions',
}
const GROUP_ORDER: CommandType[] = ['navigation', 'vehicle', 'driver', 'asset', 'action']
const PER_GROUP_CAP = 6
const RECENT_PREFIX = 'recent:'

/**
 * Builds the command-palette corpus from real app surfaces — navigation
 * (useSidebarNav), fleet entities (useFleetData), and global actions (theme,
 * region) — and ranks it with Fuse.js. Returns grouped, capped results ready
 * for <MCommandMenu>, plus a `runById` to execute a chosen item.
 */
export function useCommandPalette() {
  const query = ref('')
  const router = useRouter()
  const { navGroups, marketplaceItem } = useSidebarNav()
  const { fleetVehicles, fleetDrivers, fleetAssets } = useFleetData()
  const { applyTheme, activeTheme } = useTheme()
  const { applyRegion } = useRegion()
  const { recentSearches, addRecentSearch, loadRecentSearches } = useSearch()

  const corpus = computed<CommandItem[]>(() => {
    const items: CommandItem[] = []

    // Navigation — reuse the sidebar nav model so the palette stays in sync.
    for (const nav of [...navGroups.value.flatMap((g) => g.items), marketplaceItem.value]) {
      items.push({
        id: `nav:${nav.id}`,
        label: nav.label,
        icon: nav.icon,
        type: 'navigation',
        keywords: nav.label,
        run: () => void router.push(nav.href),
      })
    }

    // Vehicles — deep link to the live detail view.
    for (const v of fleetVehicles.value) {
      items.push({
        id: `vehicle:${v.id}`,
        label: v.unitNumber,
        sublabel: `${v.make} ${v.model}`,
        icon: Truck,
        type: 'vehicle',
        keywords: `${v.unitNumber} ${v.make} ${v.model} ${v.driverName ?? ''} ${v.currentLocation.city}`,
        run: () => void router.push(`/fleet/vehicles/${v.id}/live`),
      })
    }

    // Drivers — route to the drivers list (no per-driver detail route today).
    for (const d of fleetDrivers.value) {
      items.push({
        id: `driver:${d.id}`,
        label: d.name,
        sublabel: d.vehicleUnitNumber ?? undefined,
        icon: Users,
        type: 'driver',
        keywords: `${d.name} ${d.vehicleUnitNumber ?? ''} ${d.currentLocation.city}`,
        run: () => void router.push('/fleet/drivers'),
      })
    }

    // Assets — route to the assets list.
    for (const a of fleetAssets.value) {
      items.push({
        id: `asset:${a.id}`,
        label: a.name,
        sublabel: a.type,
        icon: Package,
        type: 'asset',
        keywords: `${a.name} ${a.type}`,
        run: () => void router.push('/fleet/assets'),
      })
    }

    // Actions — switch theme (skip the active one).
    for (const theme of THEMES) {
      if (theme.id === activeTheme.value?.id) continue
      items.push({
        id: `action:theme:${theme.id}`,
        label: `Switch theme: ${theme.name}`,
        icon: Palette,
        type: 'action',
        keywords: `theme appearance ${theme.name}`,
        run: () => applyTheme(theme.id),
      })
    }

    // Actions — switch region.
    for (const region of REGIONS) {
      items.push({
        id: `action:region:${region.code}`,
        label: `Switch region: ${region.name}`,
        sublabel: region.flag,
        icon: Globe,
        type: 'action',
        keywords: `region ${region.name} ${region.code}`,
        run: () => applyRegion(region.code),
      })
    }

    return items
  })

  const fuse = computed(
    () =>
      new Fuse(corpus.value, {
        keys: [
          { name: 'label', weight: 2 },
          { name: 'sublabel', weight: 1 },
          { name: 'keywords', weight: 1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
  )

  // Ranked results. With no query, show navigation + actions (skip the long
  // entity lists); with a query, fuzzy-rank the whole corpus.
  const results = computed<CommandItem[]>(() => {
    const q = query.value.trim()
    if (!q) return corpus.value.filter((i) => i.type === 'navigation' || i.type === 'action')
    return fuse.value.search(q).map((r) => r.item)
  })

  const toView = (i: CommandItem): MCommandItemView => ({
    id: i.id,
    label: i.label,
    sublabel: i.sublabel,
    icon: i.icon,
  })

  const groups = computed<MCommandGroup[]>(() => {
    const byType = new Map<CommandType, CommandItem[]>()
    for (const item of results.value) {
      const arr = byType.get(item.type) ?? []
      if (arr.length < PER_GROUP_CAP) arr.push(item)
      byType.set(item.type, arr)
    }

    const out: MCommandGroup[] = []

    // Recent searches surface first when the query is empty.
    if (!query.value.trim() && recentSearches.value.length) {
      out.push({
        id: 'recent',
        label: 'Recent',
        items: recentSearches.value.map((s) => ({
          id: `${RECENT_PREFIX}${s}`,
          label: s,
          icon: Clock,
        })),
      })
    }

    for (const type of GROUP_ORDER) {
      const arr = byType.get(type)
      if (arr?.length) out.push({ id: type, label: GROUP_LABEL[type], items: arr.map(toView) })
    }
    return out
  })

  const byId = computed(() => new Map(corpus.value.map((i) => [i.id, i])))

  /** Execute the selected item: recent rows refill the query; everything else runs. */
  function runById(id: string): void {
    if (id.startsWith(RECENT_PREFIX)) {
      query.value = id.slice(RECENT_PREFIX.length)
      return
    }
    byId.value.get(id)?.run()
  }

  /** Persist the current query into recent searches (call on a real selection). */
  function recordSearch(): void {
    const q = query.value.trim()
    if (q) addRecentSearch(q)
  }

  return { query, groups, runById, recordSearch, loadRecentSearches }
}
