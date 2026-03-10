// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  app: {
    head: {
      title: 'Motive',
      link: [{ rel: 'icon', type: 'image/jpeg', href: '/motive-wordmark.jpeg' }],
    },
  },

  runtimeConfig: {
    public: {
      tomtomApiKey: '', // reads NUXT_PUBLIC_TOMTOM_API_KEY from .env
    },
  },

  modules: ['@nuxt/fonts', '@nuxt/eslint', '@vueuse/motion/nuxt'],

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: tailwindcss() as any,
  },

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],
})
