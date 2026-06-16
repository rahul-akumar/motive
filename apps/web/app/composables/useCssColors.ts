/**
 * Helpers for reading CSS custom properties at runtime and resolving design
 * tokens to browser-computed colors.
 *
 * SVG presentation attributes, canvas, and WebGL shaders don't understand
 * `oklch()` or `var(--token)` — these helpers bridge the gap so D3 / Leaflet /
 * MapLibre layers can be driven by the same tokens as the rest of the UI.
 */
export function useCssColors() {
  /**
   * Raw computed value of a CSS custom property read off `:root`.
   * Returns `serverFallback` (default empty string) when not running on the client.
   */
  function getCSSVar(name: string, serverFallback = ''): string {
    if (!import.meta.client) return serverFallback
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  /**
   * Resolve a CSS var to a browser-computed `rgb()` string via a throwaway DOM
   * node, so `oklch` tokens can be used as SVG/canvas/WebGL color values.
   * Returns `fallback` when not on the client or when resolution yields nothing.
   */
  function readCSSColor(varName: string, fallback: string): string {
    if (!import.meta.client) return fallback
    const el = document.createElement('div')
    el.style.display = 'none'
    el.style.color = `var(${varName})`
    document.body.appendChild(el)
    const resolved = getComputedStyle(el).color
    document.body.removeChild(el)
    return resolved || fallback
  }

  return { getCSSVar, readCSSColor }
}
