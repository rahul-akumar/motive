import { formatPreferences, type DateFormatCode, type TimeFormatCode } from './useFormatPreferences'

// ── Unit conversion constants ────────────────────────────────────────────────
const MILES_TO_KM = 1.60934
const LBS_TO_KG = 0.453592
const GALLONS_TO_LITERS = 3.78541
const PSI_TO_KPA = 6.89476
const PSI_TO_BAR = 0.0689476

function fahrenheitToCelsius(f: number): number {
  return (f - 32) * (5 / 9)
}

// ── Date formatting internals ────────────────────────────────────────────────
function getIntlDateOptions(dateFormat: DateFormatCode): Intl.DateTimeFormatOptions {
  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return { month: '2-digit', day: '2-digit', year: 'numeric' }
    case 'DD/MM/YYYY':
      return { day: '2-digit', month: '2-digit', year: 'numeric' }
    case 'YYYY-MM-DD':
      return { year: 'numeric', month: '2-digit', day: '2-digit' }
    case 'DD MMM YYYY':
      return { day: '2-digit', month: 'short', year: 'numeric' }
    case 'MMM DD, YYYY':
      return { month: 'short', day: '2-digit', year: 'numeric' }
    case 'DD.MM.YYYY':
      return { day: '2-digit', month: '2-digit', year: 'numeric' }
    default:
      return { month: '2-digit', day: '2-digit', year: 'numeric' }
  }
}

function getIntlLocaleForDateFormat(dateFormat: DateFormatCode): string {
  // Use specific locales to enforce correct part ordering
  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return 'en-US'
    case 'DD/MM/YYYY':
      return 'en-GB'
    case 'YYYY-MM-DD':
      return 'sv-SE' // Swedish locale produces YYYY-MM-DD natively
    case 'DD MMM YYYY':
      return 'en-GB'
    case 'MMM DD, YYYY':
      return 'en-US'
    case 'DD.MM.YYYY':
      return 'de-DE' // German locale uses dots as separator
    default:
      return 'en-US'
  }
}

function getTimeOptions(timeFormat: TimeFormatCode): Intl.DateTimeFormatOptions {
  return {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  }
}

export function useFormatters() {
  const prefs = formatPreferences

  function formatDate(date: Date | string | number): string {
    const d = new Date(date)
    const locale = getIntlLocaleForDateFormat(prefs.value.dateFormat)
    const opts: Intl.DateTimeFormatOptions = {
      ...getIntlDateOptions(prefs.value.dateFormat),
      timeZone: prefs.value.timezone,
    }
    return new Intl.DateTimeFormat(locale, opts).format(d)
  }

  function formatTime(date: Date | string | number): string {
    const d = new Date(date)
    const opts: Intl.DateTimeFormatOptions = {
      ...getTimeOptions(prefs.value.timeFormat),
      timeZone: prefs.value.timezone,
    }
    return new Intl.DateTimeFormat('en-US', opts).format(d)
  }

  function formatDateTime(date: Date | string | number): string {
    const d = new Date(date)
    const locale = getIntlLocaleForDateFormat(prefs.value.dateFormat)
    const opts: Intl.DateTimeFormatOptions = {
      ...getIntlDateOptions(prefs.value.dateFormat),
      ...getTimeOptions(prefs.value.timeFormat),
      timeZone: prefs.value.timezone,
    }
    return new Intl.DateTimeFormat(locale, opts).format(d)
  }

  function formatRelativeTime(date: Date | string | number): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // ── Unit formatters ──────────────────────────────────────────────────────
  function formatDistance(value: number, opts?: { decimals?: number }): string {
    const decimals = opts?.decimals ?? 0
    if (prefs.value.distanceUnit === 'kilometers') {
      const km = value * MILES_TO_KM
      return `${km.toLocaleString(undefined, { maximumFractionDigits: decimals })} km`
    }
    return `${value.toLocaleString(undefined, { maximumFractionDigits: decimals })} mi`
  }

  function formatWeight(value: number, opts?: { decimals?: number }): string {
    const decimals = opts?.decimals ?? 0
    if (prefs.value.weightUnit === 'kg') {
      const kg = value * LBS_TO_KG
      return `${kg.toLocaleString(undefined, { maximumFractionDigits: decimals })} kg`
    }
    return `${value.toLocaleString(undefined, { maximumFractionDigits: decimals })} lbs`
  }

  function formatTemperature(value: number, opts?: { decimals?: number }): string {
    const decimals = opts?.decimals ?? 0
    if (prefs.value.temperatureUnit === 'celsius') {
      const c = fahrenheitToCelsius(value)
      return `${c.toLocaleString(undefined, { maximumFractionDigits: decimals })}°C`
    }
    return `${value.toLocaleString(undefined, { maximumFractionDigits: decimals })}°F`
  }

  function formatVolume(value: number, opts?: { decimals?: number }): string {
    const decimals = opts?.decimals ?? 1
    if (prefs.value.volumeUnit === 'liters') {
      const l = value * GALLONS_TO_LITERS
      return `${l.toLocaleString(undefined, { maximumFractionDigits: decimals })} L`
    }
    return `${value.toLocaleString(undefined, { maximumFractionDigits: decimals })} gal`
  }

  function formatSpeed(value: number, opts?: { decimals?: number }): string {
    const decimals = opts?.decimals ?? 0
    if (prefs.value.speedUnit === 'km/h') {
      const kmh = value * MILES_TO_KM
      return `${kmh.toLocaleString(undefined, { maximumFractionDigits: decimals })} km/h`
    }
    return `${value.toLocaleString(undefined, { maximumFractionDigits: decimals })} mph`
  }

  function formatFuelEfficiency(value: number, opts?: { decimals?: number }): string {
    const decimals = opts?.decimals ?? 1
    switch (prefs.value.fuelEfficiencyUnit) {
      case 'L/100km': {
        // MPG to L/100km: 235.215 / mpg
        const l100 = value > 0 ? 235.215 / value : 0
        return `${l100.toLocaleString(undefined, { maximumFractionDigits: decimals })} L/100km`
      }
      case 'km/L': {
        // MPG to km/L: mpg * 0.425144
        const kml = value * 0.425144
        return `${kml.toLocaleString(undefined, { maximumFractionDigits: decimals })} km/L`
      }
      default:
        return `${value.toLocaleString(undefined, { maximumFractionDigits: decimals })} MPG`
    }
  }

  function formatPressure(value: number, opts?: { decimals?: number }): string {
    const decimals = opts?.decimals ?? 1
    switch (prefs.value.pressureUnit) {
      case 'kPa': {
        const kpa = value * PSI_TO_KPA
        return `${kpa.toLocaleString(undefined, { maximumFractionDigits: decimals })} kPa`
      }
      case 'bar': {
        const b = value * PSI_TO_BAR
        return `${b.toLocaleString(undefined, { maximumFractionDigits: decimals })} bar`
      }
      default:
        return `${value.toLocaleString(undefined, { maximumFractionDigits: decimals })} psi`
    }
  }

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    formatDistance,
    formatSpeed,
    formatWeight,
    formatTemperature,
    formatVolume,
    formatFuelEfficiency,
    formatPressure,
  }
}
