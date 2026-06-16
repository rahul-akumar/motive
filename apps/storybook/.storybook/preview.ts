import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { MotionPlugin } from '@vueuse/motion'
import '../styles/tailwind.css'

setup((app) => {
  app.use(MotionPlugin)
})

/**
 * Apply the toolbar-selected theme to the preview root, mirroring
 * applyTheme/applyTint in apps/web/app/composables/useTheme.ts so stories
 * render exactly as the app does. Hue presets match useTheme's HUE_PRESETS.
 */
function applyStorybookTheme(theme: string, arcHue: string) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  const tinted = arcHue !== 'neutral'
  root.style.setProperty('--mtv-tint', tinted ? '1' : '0')
  if (tinted) root.style.setProperty('--mtv-hue', arcHue)
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Motive theme',
      defaultValue: 'arc',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'arc', title: 'Arc' },
          { value: 'console', title: 'Console' },
          { value: 'legacy', title: 'Legacy' },
        ],
        dynamicTitle: true,
      },
    },
    arcHue: {
      description: 'Arc tint hue (applies on the Arc theme)',
      defaultValue: 'neutral',
      toolbar: {
        title: 'Arc tint',
        icon: 'contrast',
        items: [
          { value: 'neutral', title: 'Neutral (no tint)' },
          { value: '27', title: 'Red' },
          { value: '58', title: 'Amber' },
          { value: '248', title: 'Slate' },
          { value: '286', title: 'Violet' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      applyStorybookTheme(context.globals.theme, context.globals.arcHue)
      return story()
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
