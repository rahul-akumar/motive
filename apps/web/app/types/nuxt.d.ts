import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    moduleName?: string
    mainVariant?: 'default' | 'map' | 'globe'
  }
}
