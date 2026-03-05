export type ThemeId = 'stealth' | 'danger-red' | 'amber-ops' | 'slate'

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
    description: 'Monochrome. White on charcoal. Zero color.',
    accent: '#e2e2e2',
    bgBase: '#0d0d0d',
    bgCard: '#111111',
    textPrimary: '#e2e2e2',
  },
  {
    id: 'danger-red',
    name: 'Danger Red',
    description: 'Critical ops. Red accent on near-black.',
    accent: '#dc2626',
    bgBase: '#0d0d0d',
    bgCard: '#111111',
    textPrimary: '#e2e2e2',
  },
  {
    id: 'amber-ops',
    name: 'Amber Ops',
    description: 'Muted amber on carbon. Field operations.',
    accent: '#d97706',
    bgBase: '#0d0d0d',
    bgCard: '#111111',
    textPrimary: '#e2e2e2',
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Blue-grey on near-black. Low visibility.',
    accent: '#64748b',
    bgBase: '#0d0d0d',
    bgCard: '#111111',
    textPrimary: '#e2e2e2',
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
