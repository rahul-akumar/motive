import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    moduleName?: string
    breadcrumb?: { label: string; to?: string }[]
  }
}
