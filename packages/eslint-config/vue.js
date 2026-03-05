/**
 * ESLint configuration for Vue 3 packages
 * @type {import('eslint').Linter.Config}
 */
export default {
  extends: ['plugin:vue/vue3-recommended', 'prettier'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/define-macros-order': ['error', { order: ['defineProps', 'defineEmits'] }],
  },
}
