export type DateFormatCode =
  | 'MM/DD/YYYY'
  | 'DD/MM/YYYY'
  | 'YYYY-MM-DD'
  | 'DD MMM YYYY'
  | 'MMM DD, YYYY'
  | 'DD.MM.YYYY'
export type TimeFormatCode = '12h' | '24h'
export type DistanceUnit = 'miles' | 'kilometers'
export type SpeedUnit = 'mph' | 'km/h'
export type WeightUnit = 'lbs' | 'kg'
export type TemperatureUnit = 'fahrenheit' | 'celsius'
export type VolumeUnit = 'gallons' | 'liters'
export type FuelEfficiencyUnit = 'mpg' | 'L/100km' | 'km/L'
export type PressureUnit = 'psi' | 'kPa' | 'bar'
export type FirstDayOfWeek = 'sunday' | 'monday'

export interface FormatPreferences {
  timezone: string
  dateFormat: DateFormatCode
  timeFormat: TimeFormatCode
  distanceUnit: DistanceUnit
  speedUnit: SpeedUnit
  weightUnit: WeightUnit
  temperatureUnit: TemperatureUnit
  volumeUnit: VolumeUnit
  fuelEfficiencyUnit: FuelEfficiencyUnit
  pressureUnit: PressureUnit
  firstDayOfWeek: FirstDayOfWeek
}

export interface TimezoneOption {
  value: string
  label: string
  group: string
}

export interface SelectOption<T = string> {
  value: T
  label: string
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // Americas
  { value: 'America/New_York', label: 'Eastern (New York)', group: 'Americas' },
  { value: 'America/Chicago', label: 'Central (Chicago)', group: 'Americas' },
  { value: 'America/Denver', label: 'Mountain (Denver)', group: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Pacific (Los Angeles)', group: 'Americas' },
  { value: 'America/Anchorage', label: 'Alaska (Anchorage)', group: 'Americas' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (Honolulu)', group: 'Americas' },
  { value: 'America/Phoenix', label: 'Phoenix (no DST)', group: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto', group: 'Americas' },
  { value: 'America/Mexico_City', label: 'Mexico City', group: 'Americas' },
  { value: 'America/Bogota', label: 'Bogotá', group: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', group: 'Americas' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires', group: 'Americas' },
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)', group: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (CET)', group: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', group: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)', group: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)', group: 'Europe' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET)', group: 'Europe' },
  // Asia & Pacific
  { value: 'Asia/Dubai', label: 'Dubai (GST)', group: 'Asia & Pacific' },
  { value: 'Asia/Kolkata', label: 'India (IST)', group: 'Asia & Pacific' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', group: 'Asia & Pacific' },
  { value: 'Asia/Shanghai', label: 'China (CST)', group: 'Asia & Pacific' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', group: 'Asia & Pacific' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', group: 'Asia & Pacific' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)', group: 'Asia & Pacific' },
  // Other
  { value: 'UTC', label: 'UTC', group: 'Other' },
]

export const DATE_FORMAT_OPTIONS: SelectOption<DateFormatCode>[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
]

export const TIME_FORMAT_OPTIONS: SelectOption<TimeFormatCode>[] = [
  { value: '12h', label: '12-hour (2:30 PM)' },
  { value: '24h', label: '24-hour (14:30)' },
]

export const DISTANCE_UNIT_OPTIONS: SelectOption<DistanceUnit>[] = [
  { value: 'miles', label: 'Miles (mi)' },
  { value: 'kilometers', label: 'Kilometers (km)' },
]

export const SPEED_UNIT_OPTIONS: SelectOption<SpeedUnit>[] = [
  { value: 'mph', label: 'Miles per hour (mph)' },
  { value: 'km/h', label: 'Kilometers per hour (km/h)' },
]

export const WEIGHT_UNIT_OPTIONS: SelectOption<WeightUnit>[] = [
  { value: 'lbs', label: 'Pounds (lbs)' },
  { value: 'kg', label: 'Kilograms (kg)' },
]

export const TEMPERATURE_UNIT_OPTIONS: SelectOption<TemperatureUnit>[] = [
  { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
  { value: 'celsius', label: 'Celsius (°C)' },
]

export const VOLUME_UNIT_OPTIONS: SelectOption<VolumeUnit>[] = [
  { value: 'gallons', label: 'Gallons (gal)' },
  { value: 'liters', label: 'Liters (L)' },
]

export const FUEL_EFFICIENCY_UNIT_OPTIONS: SelectOption<FuelEfficiencyUnit>[] = [
  { value: 'mpg', label: 'Miles per gallon (MPG)' },
  { value: 'L/100km', label: 'Liters per 100 km (L/100km)' },
  { value: 'km/L', label: 'Kilometers per liter (km/L)' },
]

export const PRESSURE_UNIT_OPTIONS: SelectOption<PressureUnit>[] = [
  { value: 'psi', label: 'Pounds per square inch (psi)' },
  { value: 'kPa', label: 'Kilopascals (kPa)' },
  { value: 'bar', label: 'Bar (bar)' },
]

export const FIRST_DAY_OF_WEEK_OPTIONS: SelectOption<FirstDayOfWeek>[] = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
]

const STORAGE_KEY = 'motive-format-preferences'

const DEFAULT_PREFERENCES: FormatPreferences = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Chicago',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  distanceUnit: 'miles',
  speedUnit: 'mph',
  weightUnit: 'lbs',
  temperatureUnit: 'fahrenheit',
  volumeUnit: 'gallons',
  fuelEfficiencyUnit: 'mpg',
  pressureUnit: 'psi',
  firstDayOfWeek: 'sunday',
}

// Singleton state
export const formatPreferences = ref<FormatPreferences>({ ...DEFAULT_PREFERENCES })

export function useFormatPreferences() {
  function applyFormatPreferences(prefs: Partial<FormatPreferences>) {
    Object.assign(formatPreferences.value, prefs)
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formatPreferences.value))
      } catch (e) {
        console.warn('[useFormatPreferences] Failed to persist preferences:', e)
      }
    }
  }

  function loadSavedFormatPreferences() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FormatPreferences>
        formatPreferences.value = { ...DEFAULT_PREFERENCES, ...parsed }
      }
    } catch (e) {
      console.warn('[useFormatPreferences] Failed to load saved preferences:', e)
    }
  }

  return {
    formatPreferences: readonly(formatPreferences),
    applyFormatPreferences,
    loadSavedFormatPreferences,
    TIMEZONE_OPTIONS,
    DATE_FORMAT_OPTIONS,
    TIME_FORMAT_OPTIONS,
    DISTANCE_UNIT_OPTIONS,
    SPEED_UNIT_OPTIONS,
    WEIGHT_UNIT_OPTIONS,
    TEMPERATURE_UNIT_OPTIONS,
    VOLUME_UNIT_OPTIONS,
    FUEL_EFFICIENCY_UNIT_OPTIONS,
    PRESSURE_UNIT_OPTIONS,
    FIRST_DAY_OF_WEEK_OPTIONS,
  }
}
