import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearch } from '~/composables/useSearch'

// useSearch uses localStorage which is available in jsdom but not in SSR context.
// The composable guards with import.meta.client so we need to ensure it's treated as client.
vi.stubGlobal('import', { meta: { client: true } })

describe('useSearch', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty recentSearches', () => {
    const { recentSearches } = useSearch()
    expect(recentSearches.value).toHaveLength(0)
  })

  it('addRecentSearch adds a trimmed entry', () => {
    const { recentSearches, addRecentSearch } = useSearch()
    addRecentSearch('  dallas  ')
    expect(recentSearches.value[0]).toBe('dallas')
  })

  it('addRecentSearch deduplicates entries (moves to front)', () => {
    const { recentSearches, addRecentSearch } = useSearch()
    addRecentSearch('alpha')
    addRecentSearch('beta')
    addRecentSearch('alpha')
    expect(recentSearches.value[0]).toBe('alpha')
    expect(recentSearches.value.filter((s) => s === 'alpha')).toHaveLength(1)
  })

  it('addRecentSearch ignores empty/whitespace-only strings', () => {
    const { recentSearches, addRecentSearch } = useSearch()
    addRecentSearch('   ')
    addRecentSearch('')
    expect(recentSearches.value).toHaveLength(0)
  })

  it('caps the list at MAX_ENTRIES (8)', () => {
    const { recentSearches, addRecentSearch } = useSearch()
    for (let i = 0; i < 10; i++) addRecentSearch(`query-${i}`)
    expect(recentSearches.value).toHaveLength(8)
  })

  it('removeRecentSearch deletes a specific entry', () => {
    const { recentSearches, addRecentSearch, removeRecentSearch } = useSearch()
    addRecentSearch('keep')
    addRecentSearch('remove-me')
    removeRecentSearch('remove-me')
    expect(recentSearches.value.includes('remove-me')).toBe(false)
    expect(recentSearches.value.includes('keep')).toBe(true)
  })

  it('clearRecentSearches empties the list', () => {
    const { recentSearches, addRecentSearch, clearRecentSearches } = useSearch()
    addRecentSearch('one')
    addRecentSearch('two')
    clearRecentSearches()
    expect(recentSearches.value).toHaveLength(0)
  })
})
