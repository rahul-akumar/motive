import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { MotionPlugin } from '@vueuse/motion'
import '../styles/tailwind.css'

setup((app) => {
  app.use(MotionPlugin)
})

const preview: Preview = {
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
