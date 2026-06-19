import type { Ref } from 'vue'
import { useMotion } from '@vueuse/motion'

export type LogoVariant = 'expanded' | 'collapsed'

/**
 * Staggered entrance/exit animation for the 7-part MOTIVE wordmark in the
 * sidebar. Each letter (M, O, T, I-stem, I-dot, V, E) gets its own `useMotion`
 * instance with a spring-in / tween-out variant set, delayed by index so the
 * letters cascade.
 *
 * Owns the per-letter SVG template refs and exposes them for binding; the host
 * keeps the sidebar width animation and the `collapsed` / localStorage state and
 * drives both via {@link setLetterVariants}.
 *
 * @param collapsed reactive collapsed state — read to pick the correct initial variant
 */
export function useLogoAnimation(collapsed: Ref<boolean>) {
  const logoLetterM = ref<SVGElement | null>(null)
  const logoLetterO = ref<SVGElement | null>(null)
  const logoLetterT = ref<SVGElement | null>(null)
  const logoLetterIStem = ref<SVGElement | null>(null)
  const logoLetterIDot = ref<SVGElement | null>(null)
  const logoLetterV = ref<SVGElement | null>(null)
  const logoLetterE = ref<SVGElement | null>(null)

  function letterVariantsFor(index: number) {
    const startsCollapsed = collapsed.value
    return {
      initial: startsCollapsed ? { opacity: 0, y: 4 } : { opacity: 1, y: 0 },
      expanded: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 22,
          mass: 0.8,
          delay: index * 35,
        },
      },
      collapsed: {
        opacity: 0,
        transition: { type: 'tween' as const, duration: 120, ease: 'easeIn' as const, delay: 0 },
      },
    }
  }

  const { variant: variantM } = useMotion(logoLetterM, letterVariantsFor(0))
  const { variant: variantO } = useMotion(logoLetterO, letterVariantsFor(1))
  const { variant: variantT } = useMotion(logoLetterT, letterVariantsFor(2))
  const { variant: variantIStem } = useMotion(logoLetterIStem, letterVariantsFor(3))
  const { variant: variantIDot } = useMotion(logoLetterIDot, letterVariantsFor(4))
  const { variant: variantV } = useMotion(logoLetterV, letterVariantsFor(5))
  const { variant: variantE } = useMotion(logoLetterE, letterVariantsFor(6))

  const letterVariants = [
    variantM,
    variantO,
    variantT,
    variantIStem,
    variantIDot,
    variantV,
    variantE,
  ]

  /** Drive every letter to the given variant (called on mount and on toggle). */
  function setLetterVariants(target: LogoVariant) {
    letterVariants.forEach((lv) => {
      lv.value = target
    })
  }

  return {
    logoLetterM,
    logoLetterO,
    logoLetterT,
    logoLetterIStem,
    logoLetterIDot,
    logoLetterV,
    logoLetterE,
    setLetterVariants,
  }
}
