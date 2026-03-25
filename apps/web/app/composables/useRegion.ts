export type RegionCode = 'us' | 'mx' | 'uk'

export type ModuleId =
  | 'dashboard'
  | 'fleet'
  | 'safety'
  | 'compliance'
  | 'fuel'
  | 'cards'
  | 'maintenance'
  | 'workforce'
  | 'dispatch'
  | 'alerts'
  | 'coaching'
  | 'messages'
  | 'documents'
  | 'analytics'
  | 'reports'
  | 'devices'
  | 'marketplace'

export interface ModuleConfig {
  /** Whether the module is accessible and shown in the sidebar. */
  enabled: boolean
  /**
   * Optional layout variant hint consumed by the module's page.
   * e.g. 'default' | 'simplified' | 'uk-specific'
   */
  layout?: string
}

export interface RegionOption {
  code: RegionCode
  name: string
  flag: string
}

export const REGIONS: RegionOption[] = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'mx', name: 'México', flag: '🇲🇽' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
]

// ── Module config per region ──────────────────────────────────────────────────
// All modules enabled by default; override only the differences below.
const US_CONFIG: Record<ModuleId, ModuleConfig> = {
  dashboard: { enabled: true },
  fleet: { enabled: true },
  safety: { enabled: true },
  compliance: { enabled: true },
  fuel: { enabled: true },
  cards: { enabled: true },
  maintenance: { enabled: true },
  workforce: { enabled: true },
  dispatch: { enabled: true },
  alerts: { enabled: true },
  coaching: { enabled: true },
  messages: { enabled: true },
  documents: { enabled: true },
  analytics: { enabled: true },
  reports: { enabled: true },
  devices: { enabled: true },
  marketplace: { enabled: true },
}

/** Exported for direct import in the route middleware guard. */
export const REGION_MODULE_CONFIGS: Record<RegionCode, Record<ModuleId, ModuleConfig>> = {
  us: US_CONFIG,

  mx: {
    ...US_CONFIG,
    // ELD/HOS compliance module is disabled — Mexico uses different regulatory framework
    compliance: { enabled: false },
    // Cards module not available in Mexico region
    cards: { enabled: false },
    // Safety uses simplified layout (fewer event types tracked)
    safety: { enabled: true, layout: 'simplified' },
  },

  uk: {
    ...US_CONFIG,
    // Cards module not available in UK region
    cards: { enabled: false },
    // Compliance uses UK-specific tachograph layout
    compliance: { enabled: true, layout: 'uk-specific' },
    // Workforce module not available in UK region
    workforce: { enabled: false },
  },
}

// ── Singleton state (exported for direct use by data composables) ─────────────
const STORAGE_KEY = 'motive-region'
const DEFAULT_REGION: RegionCode = 'us'

/** Exported ref — data composables import this directly to avoid router dependency. */
export const currentRegion = ref<RegionCode>(DEFAULT_REGION)

// ── Composable ────────────────────────────────────────────────────────────────
export function useRegion() {
  const router = useRouter()
  const route = useRoute()

  const regionModuleConfig = computed(() => REGION_MODULE_CONFIGS[currentRegion.value])

  function applyRegion(code: RegionCode) {
    currentRegion.value = code
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, code)
    }
    // Keep region in URL query; remove param entirely when back on default
    const query = { ...route.query }
    if (code === DEFAULT_REGION) {
      delete query.region
    } else {
      query.region = code
    }
    // Explicit path preserves the locale prefix already in route.path
    router.push({ path: route.path, query })
  }

  function loadSavedRegion() {
    if (!import.meta.client) return
    // URL query param is source of truth (enables bookmarking/sharing)
    const urlRegion = route.query.region as RegionCode | undefined
    if (urlRegion && REGIONS.find((r) => r.code === urlRegion)) {
      currentRegion.value = urlRegion
      localStorage.setItem(STORAGE_KEY, urlRegion)
      return
    }
    // Fall back to localStorage, then default
    const saved = localStorage.getItem(STORAGE_KEY) as RegionCode | null
    const valid = REGIONS.find((r) => r.code === saved)
    const code = valid ? saved! : DEFAULT_REGION
    currentRegion.value = code
    // Reflect non-default region in URL so it's shareable
    if (code !== DEFAULT_REGION) {
      router.push({ path: route.path, query: { ...route.query, region: code } })
    }
  }

  return {
    currentRegion: readonly(currentRegion),
    availableRegions: REGIONS,
    regionModuleConfig,
    applyRegion,
    loadSavedRegion,
  }
}
