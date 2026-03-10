export type ThemeId = 'stealth' | 'danger-red' | 'amber-ops' | 'slate' | 'arc'

export interface Theme {
  id: ThemeId
  name: string
  description: string
  accent: string
  bgBase: string
  bgCard: string
  textPrimary: string
}

export const THEMES: Theme[] = [
  {
    id: 'stealth',
    name: 'Stealth',
    description: 'Precision black. Surgical, zero noise, razor-sharp.',
    accent: '#e2e2e2',
    bgBase: '#0a0a0a',
    bgCard: '#0f0f0f',
    textPrimary: '#d8d8d8',
  },
  {
    id: 'danger-red',
    name: 'Danger Red',
    description: 'Alert command. Warm-red surfaces, command center on alert.',
    accent: '#dc2626',
    bgBase: '#0e0b0b',
    bgCard: '#130f0f',
    textPrimary: '#ede8e8',
  },
  {
    id: 'amber-ops',
    name: 'Amber Ops',
    description: 'Night vision. Cockpit phosphor warmth, AN/PVS aesthetic.',
    accent: '#d97706',
    bgBase: '#0d0b08',
    bgCard: '#121009',
    textPrimary: '#e8d9bc',
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Enterprise terminal. Cool blue-black, Bloomberg authority.',
    accent: '#64748b',
    bgBase: '#0b0d0f',
    bgCard: '#10131a',
    textPrimary: '#dde3ec',
  },
  {
    id: 'arc',
    name: 'Arc',
    description: 'Futurist HUD. Deep violet-black, Blade Runner glow.',
    accent: '#7c3aed',
    bgBase: '#0a090f',
    bgCard: '#0f0d18',
    textPrimary: '#e0dcf0',
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
      localStorage.setItem(STORAGE_KEY, id)
    }
    currentTheme.value = id
  }

  function loadSavedTheme() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
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
