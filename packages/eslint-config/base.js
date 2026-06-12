import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

/**
 * Shared base ESLint flat config for plain TypeScript packages.
 * Spike note: minimal rule surface — recommended sets only, unused-vars as warn.
 * Formatting is owned by Prettier; `prettier` (eslint-config-prettier) is applied
 * LAST to disable every stylistic rule that would otherwise fight the formatter.
 */
export const base = [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // TypeScript handles undefined-symbol checking; core no-undef produces
      // false positives on globals and compiler macros. (typescript-eslint guidance)
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]

// Re-export so Vue config (and any future leaf) can place prettier last itself.
export { prettier }

// Default = base + prettier-disable last. Use for plain TS packages.
export default [...base, prettier]
