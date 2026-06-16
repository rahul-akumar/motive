import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
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
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-undef': 'off',
      // Base's TS-specific block only matches .ts files, so .vue files would
      // otherwise fall back to core no-unused-vars (no '^_' ignore pattern).
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Optional props in TS <script setup> are intentionally default-less;
      // the component owns the fallback. TS already documents optionality.
      'vue/require-default-prop': 'off',
    },
  },
  // Formatting belongs to Prettier — disable conflicting stylistic rules last.
  prettier,
]

export default vueConfig
