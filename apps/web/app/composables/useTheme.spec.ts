import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme, THEMES, HUE_PRESETS } from '~/composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.removeProperty('--mtv-tint')
    document.documentElement.style.removeProperty('--mtv-hue')
    // Reset to neutral default between tests
    const { applyTheme, setNeutral } = useTheme()
    applyTheme('arc')
    setNeutral()
  })

  it('THEMES contains exactly the surviving theme ids', () => {
    const ids = THEMES.map((t) => t.id)
    expect(ids).toEqual(['arc', 'console', 'legacy'])
  })

  it('each theme has required fields', () => {
    for (const t of THEMES) {
      expect(t).toHaveProperty('id')
      expect(t).toHaveProperty('name')
      expect(t).toHaveProperty('description')
      expect(t).toHaveProperty('accent')
    }
  })

  it('applyTheme changes currentTheme', () => {
    const { currentTheme, applyTheme } = useTheme()
    applyTheme('console')
    expect(currentTheme.value).toBe('console')
  })

  it('activeTheme reflects currently applied theme', () => {
    const { activeTheme, applyTheme } = useTheme()
    applyTheme('legacy')
    expect(activeTheme.value?.id).toBe('legacy')
  })

  it('setHue enables tint and writes the hue to the document + storage', () => {
    const { arcHue, arcTint, setHue } = useTheme()
    setHue(58)
    expect(arcHue.value).toBe(58)
    expect(arcTint.value).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--mtv-tint')).toBe('1')
    expect(document.documentElement.style.getPropertyValue('--mtv-hue')).toBe('58')
    expect(localStorage.getItem('motive-arc-hue')).toBe('58')
    expect(localStorage.getItem('motive-arc-tint')).toBe('1')
  })

  it('setNeutral disables tint', () => {
    const { arcTint, setHue, setNeutral } = useTheme()
    setHue(120)
    setNeutral()
    expect(arcTint.value).toBe(false)
    expect(document.documentElement.style.getPropertyValue('--mtv-tint')).toBe('0')
  })

  it('HUE_PRESETS expose the migrated hues', () => {
    expect(HUE_PRESETS.map((p) => p.hue)).toEqual([27, 58, 248, 286])
  })

  it('loadSavedTheme migrates a removed theme id to arc + its hue', () => {
    localStorage.setItem('motive-theme', 'danger-red')
    const { currentTheme, arcHue, arcTint, loadSavedTheme } = useTheme()
    loadSavedTheme()
    expect(currentTheme.value).toBe('arc')
    expect(arcHue.value).toBe(27)
    expect(arcTint.value).toBe(true)
  })

  it('loadSavedTheme resolves renamed ids (stealth → arc, console-legacy → legacy)', () => {
    localStorage.setItem('motive-theme', 'console-legacy')
    const { currentTheme, loadSavedTheme } = useTheme()
    loadSavedTheme()
    expect(currentTheme.value).toBe('legacy')

    localStorage.setItem('motive-theme', 'stealth')
    loadSavedTheme()
    expect(currentTheme.value).toBe('arc')
  })

  it('loadSavedTheme restores a saved hue/tint for arc', () => {
    localStorage.setItem('motive-theme', 'arc')
    localStorage.setItem('motive-arc-hue', '200')
    localStorage.setItem('motive-arc-tint', '1')
    const { currentTheme, arcHue, arcTint, loadSavedTheme } = useTheme()
    loadSavedTheme()
    expect(currentTheme.value).toBe('arc')
    expect(arcHue.value).toBe(200)
    expect(arcTint.value).toBe(true)
  })

  it('loadSavedTheme falls back to default for unknown saved value', () => {
    localStorage.setItem('motive-theme', 'nonexistent-theme')
    const { currentTheme, loadSavedTheme } = useTheme()
    loadSavedTheme()
    expect(currentTheme.value).toBe('arc')
  })
})
