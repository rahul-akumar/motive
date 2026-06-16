export type ThemeId = 'arc' | 'console' | 'legacy'

export interface Theme {
  id: ThemeId
  name: string
  description: string
  accent: string
  bgBase: string
  bgCard: string
  textPrimary: string
  layout?: 'card' | 'flat'
  sidebarBg?: string
}

export const THEMES: Theme[] = [
  {
    id: 'arc',
    name: 'Arc',
    description: 'Precision black. Surgical, zero noise — shift the hue to taste.',
    accent: 'oklch(0.913 0.000 0)',
    bgBase: 'oklch(0.168 0.000 0)',
    bgCard: 'oklch(0.191 0.000 0)',
    textPrimary: 'oklch(0.876 0.000 0)',
  },
  {
    id: 'console',
    name: 'Console',
    description: 'Flat dark. Edge-to-edge layout, blue accent, zero elevation.',
    accent: 'oklch(0.623 0.188 259.8)',
    bgBase: 'oklch(0.000 0.000 0)',
    bgCard: 'oklch(0.178 0.000 0)',
    textPrimary: 'oklch(0.928 0.000 0)',
    layout: 'flat',
  },
  {
    id: 'legacy',
    name: 'Legacy',
    description: 'Split chrome. Black sidebar, white main — classic terminal discipline.',
    accent: 'oklch(0.623 0.188 259.8)',
    bgBase: 'oklch(0.979 0.000 0)',
    bgCard: 'oklch(1.000 0.000 0)',
    textPrimary: 'oklch(0.178 0.000 0)',
    sidebarBg: 'oklch(0.000 0.000 0)',
    layout: 'flat',
  },
]

export interface HuePreset {
  id: string
  hue: number
}

/** Quick-pick hues for the Arc tint control. Values are the accent hues of the
 *  former danger-red / amber-ops / slate / violet tinted themes. */
export const HUE_PRESETS: HuePreset[] = [
  { id: 'red', hue: 27 },
  { id: 'amber', hue: 58 },
  { id: 'slate', hue: 248 },
  { id: 'violet', hue: 286 },
]

/** Former standalone themes → the hue they collapse into on the Arc slider. */
const DELETED_HUE_MAP: Record<string, number> = {
  'danger-red': 27,
  'amber-ops': 58,
  slate: 248,
}

/** Renamed themes → their current id, so persisted values keep resolving. */
const RENAMED_THEME_MAP: Record<string, ThemeId> = {
  stealth: 'arc',
  'console-legacy': 'legacy',
}

const STORAGE_KEY = 'motive-theme'
const HUE_STORAGE_KEY = 'motive-arc-hue'
const TINT_STORAGE_KEY = 'motive-arc-tint'
const DEFAULT_THEME: ThemeId = 'arc'
const DEFAULT_HUE = 27

// Singleton reactive state
const currentTheme = ref<ThemeId>(DEFAULT_THEME)
const arcHue = ref<number>(DEFAULT_HUE)
const arcTint = ref<boolean>(false)

export function useTheme() {
  /** Push the current hue/tint to the document root and persist them. */
  function applyTint() {
    if (import.meta.client) {
      const root = document.documentElement
      root.style.setProperty('--mtv-tint', arcTint.value ? '1' : '0')
      root.style.setProperty('--mtv-hue', String(arcHue.value))
      try {
        localStorage.setItem(HUE_STORAGE_KEY, String(arcHue.value))
        localStorage.setItem(TINT_STORAGE_KEY, arcTint.value ? '1' : '0')
      } catch (e) {
        console.warn('[useTheme] Failed to persist tint:', e)
      }
    }
  }

  function applyTheme(id: ThemeId) {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', id)
      try {
        localStorage.setItem(STORAGE_KEY, id)
      } catch (e) {
        console.warn('[useTheme] Failed to persist theme:', e)
      }
    }
    currentTheme.value = id
    applyTint()
  }

  /** Set the Arc tint hue and enable tinting. */
  function setHue(hue: number) {
    arcHue.value = hue
    arcTint.value = true
    applyTint()
  }

  /** Disable tinting — Arc returns to pure neutral. */
  function setNeutral() {
    arcTint.value = false
    applyTint()
  }

  function loadSavedTheme() {
    if (!import.meta.client) return

    let savedTheme: string | null = null
    let savedHue: string | null = null
    let savedTint: string | null = null
    try {
      savedTheme = localStorage.getItem(STORAGE_KEY)
      savedHue = localStorage.getItem(HUE_STORAGE_KEY)
      savedTint = localStorage.getItem(TINT_STORAGE_KEY)
    } catch (e) {
      console.warn('[useTheme] Failed to read saved theme:', e)
    }

    // Restore tint preferences first so they apply on whichever theme loads.
    if (savedHue !== null) {
      const parsed = Number(savedHue)
      if (Number.isFinite(parsed)) arcHue.value = parsed
    }
    if (savedTint !== null) arcTint.value = savedTint === '1'

    // Migrate a removed theme id → Arc with the equivalent hue.
    if (savedTheme !== null && savedTheme in DELETED_HUE_MAP) {
      arcHue.value = DELETED_HUE_MAP[savedTheme]!
      arcTint.value = true
      applyTheme(DEFAULT_THEME)
      return
    }

    // Resolve renamed ids (stealth → arc, console-legacy → legacy).
    const resolved = (savedTheme && RENAMED_THEME_MAP[savedTheme]) || savedTheme
    const valid = THEMES.find((t) => t.id === resolved)
    applyTheme(valid ? (resolved as ThemeId) : DEFAULT_THEME)
  }

  const activeTheme = computed(() => THEMES.find((t) => t.id === currentTheme.value) ?? THEMES[0])

  return {
    currentTheme: readonly(currentTheme),
    arcHue: readonly(arcHue),
    arcTint: readonly(arcTint),
    activeTheme,
    themes: THEMES,
    huePresets: HUE_PRESETS,
    applyTheme,
    setHue,
    setNeutral,
    loadSavedTheme,
  }
}

/** Theme ids that render on a light background. */
const LIGHT_THEMES = new Set(['light', 'legacy'])

/**
 * Whether the active theme renders on a dark background. Reads the root
 * `data-theme` attribute; treats anything not in {@link LIGHT_THEMES} (and the
 * server) as dark. Used by map/chart layers that need a concrete light/dark
 * choice (tile sets, marker colors) rather than a CSS variable.
 */
export function isDarkTheme(): boolean {
  if (!import.meta.client) return true
  return !LIGHT_THEMES.has(document.documentElement.getAttribute('data-theme') ?? '')
}

/**
 * Run `onThemeChange` whenever the root `data-theme` attribute changes,
 * disconnecting automatically on unmount. Client-only no-op on the server.
 * Call at setup top level (it registers its own onMounted/onUnmounted hooks).
 */
export function useThemeObserver(onThemeChange: () => void) {
  if (!import.meta.client) return
  onMounted(() => {
    const observer = new MutationObserver(() => onThemeChange())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    onUnmounted(() => observer.disconnect())
  })
}
