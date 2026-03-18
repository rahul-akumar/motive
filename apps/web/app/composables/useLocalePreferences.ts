export type LocaleCode = 'en-US' | 'en-GB' | 'pt-BR'

export interface LocaleOption {
  code: LocaleCode
  name: string
}

export const LOCALES: LocaleOption[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
]

const STORAGE_KEY = 'motive-locale'
const DEFAULT_LOCALE: LocaleCode = 'en-US'

// Singleton reactive state
const currentLocale = ref<LocaleCode>(DEFAULT_LOCALE)

export function useLocalePreferences() {
  const { setLocale } = useI18n()

  function applyLocale(code: LocaleCode) {
    setLocale(code)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, code)
    }
    currentLocale.value = code
  }

  function loadSavedLocale() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY) as LocaleCode | null
    const valid = LOCALES.find((l) => l.code === saved)
    const code = valid ? saved! : DEFAULT_LOCALE
    applyLocale(code)
  }

  return {
    currentLocale: readonly(currentLocale),
    availableLocales: LOCALES,
    applyLocale,
    loadSavedLocale,
  }
}
