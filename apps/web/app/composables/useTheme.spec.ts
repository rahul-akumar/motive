import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme, THEMES } from '~/composables/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset to default between tests
    const { applyTheme } = useTheme()
    applyTheme('stealth')
  })

  it('THEMES constant contains all expected theme ids', () => {
    const ids = THEMES.map((t) => t.id)
    expect(ids).toContain('stealth')
    expect(ids).toContain('danger-red')
    expect(ids).toContain('amber-ops')
    expect(ids).toContain('slate')
    expect(ids).toContain('arc')
    expect(ids).toContain('console')
    expect(ids).toContain('console-legacy')
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
    applyTheme('arc')
    expect(currentTheme.value).toBe('arc')
  })

  it('activeTheme reflects currently applied theme', () => {
    const { activeTheme, applyTheme } = useTheme()
    applyTheme('slate')
    expect(activeTheme.value?.id).toBe('slate')
  })

  it('loadSavedTheme restores persisted theme', () => {
    localStorage.setItem('motive-theme', 'amber-ops')
    const { currentTheme, loadSavedTheme } = useTheme()
    loadSavedTheme()
    expect(currentTheme.value).toBe('amber-ops')
  })

  it('loadSavedTheme falls back to default for unknown saved value', () => {
    localStorage.setItem('motive-theme', 'nonexistent-theme')
    const { currentTheme, loadSavedTheme } = useTheme()
    loadSavedTheme()
    expect(currentTheme.value).toBe('stealth')
  })
})
