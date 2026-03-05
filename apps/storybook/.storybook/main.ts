import type { StorybookConfig } from '@storybook/vue3-vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal(config) {
    config.plugins = config.plugins ?? []
    config.plugins.push(vue(), tailwindcss())
    return config
  },
}

export default config
