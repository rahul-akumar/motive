import type { Component } from 'vue'

const RIGHT_PANEL_KEY = Symbol('rightPanel')

interface RightPanelContext {
  activePanel: Ref<Component | null>
  setPanel: (component: Component | null) => void
}

/** Called once in the root layout to set up the panel context. */
export function provideRightPanel() {
  const activePanel = shallowRef<Component | null>(null)

  function setPanel(component: Component | null) {
    activePanel.value = component
  }

  provide(RIGHT_PANEL_KEY, { activePanel, setPanel } satisfies RightPanelContext)

  return { activePanel }
}

/** Called in a page setup to register a panel component. Clears on unmount. */
export function useRightPanel(component: Component) {
  const ctx = inject<RightPanelContext>(RIGHT_PANEL_KEY)
  if (!ctx) {
    console.warn(
      'useRightPanel: no RightPanelContext found. Did you call provideRightPanel() in the layout?',
    )
    return
  }

  ctx.setPanel(component)
  onUnmounted(() => {
    if (ctx.activePanel.value === component) {
      ctx.setPanel(null)
    }
  })
}
