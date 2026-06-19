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
    rules: {
      // Design-system adoption nudge (advisory — warning, does not fail CI):
      // steer new UI toward the shared @motive/ui components. Raw native
      // elements remain valid for genuinely custom controls and native-semantics
      // cases (e.g. a native <select> for locale/region) — silence locally with
      // an eslint-disable-next-line and a one-line reason when intentional.
      'vue/no-restricted-html-elements': [
        'warn',
        {
          element: 'button',
          message:
            'Prefer <MButton> from @motive/ui; keep a raw <button> only for genuinely custom controls.',
        },
        { element: 'select', message: 'Prefer <MSelect> from @motive/ui.' },
        {
          element: 'input',
          message: 'Prefer <MInput> from @motive/ui for text inputs (MCheckbox for checkboxes).',
        },
      ],
    },
  },
  // Formatting is owned by Prettier (runs in the pre-commit hook); disable every
  // eslint stylistic rule that would otherwise fight it. Must be applied last.
  prettier,
)
