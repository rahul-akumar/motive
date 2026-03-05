/**
 * Shared motion variants for consistent animations across the dashboard.
 * Uses @vueuse/motion v-motion directive variants.
 */

export function useMotionPresets() {
  /** Fade up — used for card/section entry animations */
  const fadeUp = {
    initial: { opacity: 0, y: 16 },
    enter: { opacity: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } },
  }

  /** Fade in — used for overlays, page transitions */
  const fadeIn = {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: 250, ease: 'easeOut' } },
  }

  /** Slide in from left — used for activity feed items */
  const slideInLeft = {
    initial: { opacity: 0, x: -12 },
    enter: { opacity: 1, x: 0, transition: { duration: 250, ease: 'easeOut' } },
  }

  /** Staggered fade up — apply delay via :delay prop on v-motion */
  function fadeUpStagger(index: number) {
    return {
      initial: { opacity: 0, y: 16 },
      enter: {
        opacity: 1,
        y: 0,
        transition: { duration: 400, ease: 'easeOut', delay: index * 80 },
      },
    }
  }

  return { fadeUp, fadeIn, slideInLeft, fadeUpStagger }
}
