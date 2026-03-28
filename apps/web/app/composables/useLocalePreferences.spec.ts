import { describe, it, expect } from 'vitest'
import { LOCALES, DEFAULT_LOCALE } from '~/composables/useLocalePreferences'

// useLocalePreferences depends on useI18n (Nuxt i18n) which requires a full
// i18n context. These tests cover only the pure constants and exported values.

describe('useLocalePreferences constants', () => {
  it('LOCALES includes all supported locale codes', () => {
    const codes = LOCALES.map((l) => l.code)
    expect(codes).toContain('en-US')
    expect(codes).toContain('en-GB')
    expect(codes).toContain('pt-BR')
  })

  it('each locale option has a code and human-readable name', () => {
    for (const locale of LOCALES) {
      expect(typeof locale.code).toBe('string')
      expect(locale.code.length).toBeGreaterThan(0)
      expect(typeof locale.name).toBe('string')
      expect(locale.name.length).toBeGreaterThan(0)
    }
  })

  it('DEFAULT_LOCALE is en-US', () => {
    expect(DEFAULT_LOCALE).toBe('en-US')
  })

  it('DEFAULT_LOCALE is present in LOCALES', () => {
    expect(LOCALES.find((l) => l.code === DEFAULT_LOCALE)).toBeDefined()
  })
})
