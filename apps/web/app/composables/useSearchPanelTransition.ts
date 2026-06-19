import type { Ref } from 'vue'

/**
 * Morphing transition for the search overlay: the overlay starts at the
 * trigger-bar's rect and springs out to its natural full size, then collapses
 * back on close. Returns hooks for a `<Transition :css="false">` plus helpers
 * the host component uses to position the overlay at open time.
 *
 * - `onBeforeEnter` – hide element; set full width so `onEnter` can measure it
 * - `onEnter`       – measure natural height, snap to trigger size, spring to full
 * - `onLeave`       – lock current height, snap back to trigger size, fade out
 *
 * `transitionend` bubbles from children, so handlers filter on
 * `target === el && propertyName === 'width'`.
 *
 * @param triggerRef the in-flow trigger bar — re-measured as the collapse target on leave
 */
export function useSearchPanelTransition(triggerRef: Ref<HTMLElement | null>) {
  const OVERLAY_WIDTH = 380

  // Captured at open time, reused by enter/leave hooks
  let triggerRect: DOMRect | null = null

  /** Capture the morph-origin rect from whichever anchor is currently visible. */
  function captureTriggerRect(anchor: HTMLElement): DOMRect {
    triggerRect = anchor.getBoundingClientRect()
    return triggerRect
  }

  const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)' // spring overshoot
  const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)' // smooth open for height
  const EASE_IN = 'cubic-bezier(0.55, 0, 1, 0.45)' // snappy collapse

  function addTransitionEnd(el: HTMLElement, property: string, done: () => void, timeout: number) {
    let called = false
    const finish = () => {
      if (called) return
      called = true
      done()
    }
    const handler = (e: Event) => {
      const te = e as TransitionEvent
      if (te.target !== el || te.propertyName !== property) return
      el.removeEventListener('transitionend', handler)
      finish()
    }
    el.addEventListener('transitionend', handler)
    setTimeout(() => {
      el.removeEventListener('transitionend', handler)
      finish()
    }, timeout)
  }

  function onBeforeEnter(el: Element) {
    const htmlEl = el as HTMLElement
    // Keep invisible while we set up for measurement in onEnter
    htmlEl.style.opacity = '0'
    htmlEl.style.width = `${OVERLAY_WIDTH}px`
    htmlEl.style.height = 'auto'
  }

  function onEnter(el: Element, done: () => void) {
    const htmlEl = el as HTMLElement

    // 1. Measure natural height at full width (element is auto-height here)
    void htmlEl.offsetHeight
    const naturalH = htmlEl.offsetHeight

    // 2. Snap to trigger-bar start state
    const r = triggerRect
    const startW = r ? r.width : OVERLAY_WIDTH
    const startH = r ? r.height : 40
    htmlEl.style.width = `${startW}px`
    htmlEl.style.height = `${startH}px`
    htmlEl.style.overflow = 'hidden'
    htmlEl.style.opacity = '0.5'

    // Pre-hide body so it can animate in separately
    const body = htmlEl.querySelector<HTMLElement>('.search-overlay__body')
    if (body) {
      body.style.opacity = '0'
      body.style.transform = 'translateY(-10px)'
    }

    // 3. Commit start state with a reflow, then begin transition
    void htmlEl.offsetHeight

    htmlEl.style.transition = [
      `width 320ms ${SPRING}`,
      `height 290ms ${EASE_OUT}`,
      `opacity 100ms ease`,
    ].join(', ')
    htmlEl.style.width = `${OVERLAY_WIDTH}px`
    htmlEl.style.height = `${naturalH}px`
    htmlEl.style.opacity = '1'

    // Body slides in once the container is mostly open
    setTimeout(() => {
      if (!body) return
      body.style.transition = 'opacity 180ms ease, transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
      body.style.opacity = '1'
      body.style.transform = 'translateY(0)'
    }, 110)

    addTransitionEnd(
      htmlEl,
      'width',
      () => {
        htmlEl.style.overflow = ''
        htmlEl.style.height = 'auto'
        done()
      },
      600,
    )
  }

  function onLeave(el: Element, done: () => void) {
    const htmlEl = el as HTMLElement

    // Lock height to current pixel value so CSS can animate from it
    htmlEl.style.height = `${htmlEl.getBoundingClientRect().height}px`
    htmlEl.style.overflow = 'hidden'

    // Body vanishes first (brief, so the collapse feels clean)
    const body = htmlEl.querySelector<HTMLElement>('.search-overlay__body')
    if (body) {
      body.style.transition = 'opacity 60ms ease'
      body.style.opacity = '0'
    }

    // Force reflow to commit locked height, then start the collapse
    void htmlEl.offsetHeight

    const target = triggerRef.value?.getBoundingClientRect() ?? triggerRect
    htmlEl.style.transition = [
      `width 220ms ${EASE_IN}`,
      `height 200ms ${EASE_IN}`,
      `opacity 150ms ease-in`,
    ].join(', ')
    if (target) {
      htmlEl.style.width = `${target.width}px`
      htmlEl.style.height = `${target.height}px`
    }
    htmlEl.style.opacity = '0'

    addTransitionEnd(htmlEl, 'width', done, 400)
  }

  return { OVERLAY_WIDTH, captureTriggerRect, onBeforeEnter, onEnter, onLeave }
}
