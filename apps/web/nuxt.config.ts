// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/jpeg', href: '/motive-wordmark.jpeg' }],
    },
  },

  runtimeConfig: {
    public: {
      tomtomApiKey: '', // reads NUXT_PUBLIC_TOMTOM_API_KEY from .env
    },
  },

  modules: ['@nuxt/fonts', '@nuxt/eslint', '@vueuse/motion/nuxt', '@nuxtjs/i18n'],

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en-US',
    detectBrowserLanguage: false,
    locales: [
      { code: 'en-US', name: 'English (US)', file: 'en-US.json' },
      { code: 'en-GB', name: 'English (UK)', file: 'en-GB.json' },
      { code: 'pt-BR', name: 'Português (Brasil)', file: 'pt-BR.json' },
    ],
    langDir: 'locales/',
  },

  fonts: {
    families: [
      { name: 'Satoshi', provider: 'fontshare', weights: [400, 500, 700] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'IBM Plex Mono', provider: 'google', weights: [400, 500, 600] },
      { name: 'Barlow Condensed', provider: 'google', weights: [600, 700, 800] },
      { name: 'Zodiak', provider: 'fontshare', weights: [400, 500, 600, 700] },
    ],
  },

  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: tailwindcss() as any,
  },

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],
})
