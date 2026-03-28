const STORAGE_KEY = 'motive-search-recent'
const MAX_ENTRIES = 8

export function useSearch() {
  const recentSearches = ref<string[]>([])

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches.value))
  }

  function loadRecentSearches() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      recentSearches.value = raw ? (JSON.parse(raw) as string[]) : []
    } catch (e) {
      console.warn('[useSearch] Failed to parse localStorage data:', e)
      recentSearches.value = []
    }
  }

  function addRecentSearch(q: string) {
    if (!import.meta.client) return
    const trimmed = q.trim()
    if (!trimmed) return
    const filtered = recentSearches.value.filter((s) => s !== trimmed)
    recentSearches.value = [trimmed, ...filtered].slice(0, MAX_ENTRIES)
    persist()
  }

  function removeRecentSearch(q: string) {
    recentSearches.value = recentSearches.value.filter((s) => s !== q)
    persist()
  }

  function clearRecentSearches() {
    recentSearches.value = []
    if (!import.meta.client) return
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    recentSearches,
    loadRecentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  }
}
