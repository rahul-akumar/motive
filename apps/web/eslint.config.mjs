// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  // Formatting is owned by Prettier (runs in the pre-commit hook); disable every
  // eslint stylistic rule that would otherwise fight it. Must be applied last.
  prettier,
)
