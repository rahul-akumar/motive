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

// URL prefix for each non-default locale (en-US has no prefix)
export const LOCALE_URL_PREFIXES: Partial<Record<LocaleCode, string>> = {
  'en-GB': '/en-GB',
  'pt-BR': '/pt-BR',
}

const STORAGE_KEY = 'motive-locale'
export const DEFAULT_LOCALE: LocaleCode = 'en-US'

// Singleton ref — exported directly so the route middleware can keep it in sync
export const currentLocale = ref<LocaleCode>(DEFAULT_LOCALE)

export function useLocalePreferences() {
  const { setLocale, locale: i18nLocale } = useI18n()

  function applyLocale(code: LocaleCode) {
    setLocale(code)
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, code)
      } catch (e) {
        console.warn('[useLocalePreferences] Failed to persist locale:', e)
      }
    }
    currentLocale.value = code
  }

  function loadSavedLocale() {
    if (!import.meta.client) return
    // URL-detected locale (from path prefix) always wins over localStorage
    const urlLocale = i18nLocale.value as LocaleCode
    if (urlLocale !== DEFAULT_LOCALE && LOCALES.find((l) => l.code === urlLocale)) {
      currentLocale.value = urlLocale
      try {
        localStorage.setItem(STORAGE_KEY, urlLocale)
      } catch (e) {
        console.warn('[useLocalePreferences] Failed to persist locale:', e)
      }
      return
    }
    let saved: LocaleCode | null = null
    try {
      saved = localStorage.getItem(STORAGE_KEY) as LocaleCode | null
    } catch (e) {
      console.warn('[useLocalePreferences] Failed to read saved locale:', e)
    }
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
