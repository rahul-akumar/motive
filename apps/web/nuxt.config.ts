// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: ['@nuxt/fonts', '@nuxt/eslint', '@nuxt/test-utils', '@vueuse/motion/nuxt'],

  fonts: {
    families: [
      {
        name: 'Barlow',
        provider: 'google',
        weights: [400, 500, 600, 700],
      },
      {
        name: 'Barlow Condensed',
        provider: 'google',
        weights: [600, 700, 800],
      },
      {
        name: 'IBM Plex Mono',
        provider: 'google',
        weights: [400, 500, 600],
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],
})
