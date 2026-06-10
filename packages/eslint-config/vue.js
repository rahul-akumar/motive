import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'
import { base, prettier } from './base.js'

/**
 * Shared ESLint flat config for Vue 3 + TypeScript packages.
 * Order: base (TS) → vue/flat-recommended → SFC parser+rule overrides → prettier LAST.
 * `prettier` must come after the vue configs so it can disable their stylistic rules.
 */
export const vueConfig = [
  ...base,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-undef': 'off',
      // Optional props in TS <script setup> are intentionally default-less;
      // the component owns the fallback. TS already documents optionality.
      'vue/require-default-prop': 'off',
    },
  },
  // Formatting belongs to Prettier — disable conflicting stylistic rules last.
  prettier,
]

export default vueConfig
