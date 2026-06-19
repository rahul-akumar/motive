import type { StorybookConfig } from '@storybook/vue3-vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    '../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal(config) {
    config.plugins = config.plugins ?? []
    // vue() must run BEFORE Storybook's vue-docgen plugin, which appends
    // `_sfc_main.__docgenInfo = {...}` to the source expecting an already-compiled
    // SFC. Appending vue() instead lets docgen mangle the raw .vue first, and prop
    // types like `Set<string>` then make the SFC parser see `<string>` as an
    // unclosed tag ("Element is missing end tag"). Prepend so vue() compiles first.
    config.plugins.unshift(vue())
    config.plugins.push(tailwindcss())
    // @motive/ui is raw .vue source; don't pre-bundle it so editing a component
    // while the dev server runs doesn't leave a stale module graph.
    config.optimizeDeps = config.optimizeDeps ?? {}
    config.optimizeDeps.exclude = [...(config.optimizeDeps.exclude ?? []), '@motive/ui']
    return config
  },
}

export default config
