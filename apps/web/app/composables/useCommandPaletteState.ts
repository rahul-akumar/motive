/**
 * Shared open/closed state for the command palette, so the global keyboard
 * shortcut (plugin) and the panel component stay in sync via one source of
 * truth. Backed by Nuxt useState so it's a singleton across the app.
 */
export function useCommandPaletteState() {
  const isOpen = useState('command-palette-open', () => false)

  return {
    isOpen,
    open: () => {
      isOpen.value = true
    },
    close: () => {
      isOpen.value = false
    },
    toggle: () => {
      isOpen.value = !isOpen.value
    },
  }
}
