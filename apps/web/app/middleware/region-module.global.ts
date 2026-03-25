import { currentRegion, REGION_MODULE_CONFIGS } from '~/composables/useRegion'
import type { ModuleId } from '~/composables/useRegion'
import {
  currentLocale,
  LOCALE_URL_PREFIXES,
  DEFAULT_LOCALE,
} from '~/composables/useLocalePreferences'
import type { LocaleCode } from '~/composables/useLocalePreferences'

/**
 * Maps the `moduleName` page meta field (PascalCase) to the moduleId used in
 * REGION_MODULE_CONFIGS. moduleName is set via definePageMeta in each page.
 */
const MODULE_NAME_MAP: Record<string, ModuleId> = {
  Dashboard: 'dashboard',
  Fleet: 'fleet',
  Safety: 'safety',
  Compliance: 'compliance',
  Fuel: 'fuel',
  Cards: 'cards',
  Maintenance: 'maintenance',
  Workforce: 'workforce',
  Dispatch: 'dispatch',
  Alerts: 'alerts',
  Coaching: 'coaching',
  Messages: 'messages',
  Documents: 'documents',
  Analytics: 'analytics',
  Reports: 'reports',
  Devices: 'devices',
  Marketplace: 'marketplace',
}

const DEFAULT_REGION = 'us'

/** Detect which locale is encoded in the URL path prefix. */
function detectPathLocale(path: string): LocaleCode {
  const entry = (Object.entries(LOCALE_URL_PREFIXES) as [LocaleCode, string][]).find(
    ([, prefix]) => path.startsWith(prefix + '/') || path === prefix,
  )
  return entry ? entry[0] : DEFAULT_LOCALE
}

export default defineNuxtRouteMiddleware((to) => {
  const region = currentRegion.value
  const savedLocale = currentLocale.value

  // ── 1. Detect locale from the incoming URL path ────────────────────────────
  const urlLocale = detectPathLocale(to.path)

  // If the URL has an explicit non-default locale prefix, that wins — sync our ref.
  if (urlLocale !== DEFAULT_LOCALE) {
    currentLocale.value = urlLocale
  }

  // The locale we want in the final URL.
  // Explicit URL locale > saved user preference > default.
  const effectiveLocale = urlLocale !== DEFAULT_LOCALE ? urlLocale : savedLocale
  const localePrefix = LOCALE_URL_PREFIXES[effectiveLocale] ?? ''

  // Does the path need a locale prefix prepended? (saved preference, URL has none)
  const needsLocalePrefix = localePrefix !== '' && urlLocale === DEFAULT_LOCALE

  // ── 2. Preserve region query param on every navigation ────────────────────
  const needsRegion = region !== DEFAULT_REGION && to.query.region !== region

  // Single redirect when either fix is needed — uses { path, query, hash } only
  // (never spread `...to`; spreading the route object passes `name` which Vue Router
  //  can resolve without the locale prefix, silently dropping it).
  if (needsLocalePrefix || needsRegion) {
    return navigateTo({
      path: needsLocalePrefix ? localePrefix + to.path : to.path,
      query: needsRegion ? { ...to.query, region } : to.query,
      hash: to.hash,
    })
  }

  // ── 3. Block access to disabled modules ───────────────────────────────────
  const moduleName = to.meta.moduleName as string | undefined
  if (!moduleName) return

  const moduleId = MODULE_NAME_MAP[moduleName]
  if (!moduleId) return

  const config = REGION_MODULE_CONFIGS[region]
  if (config[moduleId]?.enabled === false) {
    // Redirect home preserving both locale prefix and region param in one navigation
    return navigateTo({
      path: localePrefix ? localePrefix + '/' : '/',
      query: region !== DEFAULT_REGION ? { region } : {},
    })
  }
})
