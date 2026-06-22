import { useEventListener } from '@vueuse/core'

/** Whether the event target is a field where typing should not trigger shortcuts. */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable
  )
}

/**
 * Global command-palette shortcuts: Cmd/Ctrl+K toggles it from anywhere, and
 * "/" opens it when the user isn't typing in a field. Toggling shared state
 * keeps the AppSearchPanel in sync.
 */
export default defineNuxtPlugin(() => {
  const { toggle, open } = useCommandPaletteState()

  useEventListener(window, 'keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      toggle()
      return
    }
    if (e.key === '/' && !isEditableTarget(e.target)) {
      e.preventDefault()
      open()
    }
  })
})
