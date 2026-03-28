export type ThemeId =
  | 'stealth'
  | 'danger-red'
  | 'amber-ops'
  | 'slate'
  | 'arc'
  | 'console'
  | 'console-legacy'

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
    id: 'stealth',
    name: 'Stealth',
    description: 'Precision black. Surgical, zero noise, razor-sharp.',
    accent: 'oklch(0.913 0.000 0)',
    bgBase: 'oklch(0.168 0.000 0)',
    bgCard: 'oklch(0.191 0.000 0)',
    textPrimary: 'oklch(0.876 0.000 0)',
  },
  {
    id: 'danger-red',
    name: 'Danger Red',
    description: 'Alert command. Warm-red surfaces, command center on alert.',
    accent: 'oklch(0.537 0.210 18.0)',
    bgBase: 'oklch(0.159 0.012 19.2)',
    bgCard: 'oklch(0.185 0.017 19.2)',
    textPrimary: 'oklch(0.950 0.005 18.0)',
  },
  {
    id: 'amber-ops',
    name: 'Amber Ops',
    description: 'Night vision. Cockpit phosphor warmth, AN/PVS aesthetic.',
    accent: 'oklch(0.666 0.157 58.3)',
    bgBase: 'oklch(0.158 0.009 71.7)',
    bgCard: 'oklch(0.181 0.013 71.7)',
    textPrimary: 'oklch(0.893 0.034 80.7)',
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Enterprise terminal. Cool blue-black, Bloomberg authority.',
    accent: 'oklch(0.532 0.044 248.0)',
    bgBase: 'oklch(0.176 0.010 248.0)',
    bgCard: 'oklch(0.210 0.021 255.5)',
    textPrimary: 'oklch(0.903 0.013 255.5)',
  },
  {
    id: 'arc',
    name: 'Arc',
    description: 'Futurist HUD. Deep violet-black, Blade Runner glow.',
    accent: 'oklch(0.476 0.257 286.4)',
    bgBase: 'oklch(0.162 0.016 295.5)',
    bgCard: 'oklch(0.183 0.031 295.5)',
    textPrimary: 'oklch(0.909 0.019 295.5)',
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
    id: 'console-legacy',
    name: 'Console Legacy',
    description: 'Split chrome. Black sidebar, white main — classic terminal discipline.',
    accent: 'oklch(0.623 0.188 259.8)',
    bgBase: 'oklch(0.979 0.000 0)',
    bgCard: 'oklch(1.000 0.000 0)',
    textPrimary: 'oklch(0.178 0.000 0)',
    sidebarBg: 'oklch(0.000 0.000 0)',
    layout: 'flat',
  },
]

const STORAGE_KEY = 'motive-theme'
const DEFAULT_THEME: ThemeId = 'stealth'

// Singleton reactive state
const currentTheme = ref<ThemeId>(DEFAULT_THEME)

export function useTheme() {
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
  }

  function loadSavedTheme() {
    if (!import.meta.client) return
    let saved: ThemeId | null = null
    try {
      saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    } catch (e) {
      console.warn('[useTheme] Failed to read saved theme:', e)
    }
    const valid = THEMES.find((t) => t.id === saved)
    const id = valid ? saved! : DEFAULT_THEME
    applyTheme(id)
  }

  const activeTheme = computed(() => THEMES.find((t) => t.id === currentTheme.value) ?? THEMES[0])

  return {
    currentTheme: readonly(currentTheme),
    activeTheme,
    themes: THEMES,
    applyTheme,
    loadSavedTheme,
  }
}
