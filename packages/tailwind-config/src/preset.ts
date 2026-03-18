import type { Config } from 'tailwindcss'
import { mtvColors, tokens } from './tokens'

/**
 * Motive Tailwind CSS Preset
 *
 * Import this preset in your app's tailwind.config.ts:
 * ```ts
 * import { motivePreset } from '@motive/tailwind-config'
 * export default { presets: [motivePreset] }
 * ```
 */
export const motivePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        mtv: mtvColors,
      },
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      lineHeight: tokens.lineHeight,
      letterSpacing: tokens.letterSpacing,
      borderRadius: tokens.borderRadius,
    },
  },
}
