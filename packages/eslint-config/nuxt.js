/**
 * ESLint configuration for Nuxt apps
 * Note: Nuxt 4 apps use @nuxt/eslint module which auto-generates config.
 * This file provides additional shared rules on top of Nuxt's defaults.
 * @type {import('eslint').Linter.Config}
 */
export default {
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
  },
}
