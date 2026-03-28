import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['app/**/*.{test,spec}.ts'],
    environmentOptions: {
      nuxt: {
        rootDir: '.',
      },
    },
  },
})
