import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatPreferences,
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
  useFormatPreferences,
} from '~/composables/useFormatPreferences'

describe('useFormatPreferences constants', () => {
  it('TIMEZONE_OPTIONS has entries with value, label, and group', () => {
    expect(TIMEZONE_OPTIONS.length).toBeGreaterThan(0)
    for (const tz of TIMEZONE_OPTIONS) {
      expect(tz.value).toBeTruthy()
      expect(tz.label).toBeTruthy()
      expect(tz.group).toBeTruthy()
    }
  })

  it('DATE_FORMAT_OPTIONS has 6 formats', () => {
    expect(DATE_FORMAT_OPTIONS).toHaveLength(6)
    const values = DATE_FORMAT_OPTIONS.map((o) => o.value)
    expect(values).toContain('MM/DD/YYYY')
    expect(values).toContain('DD/MM/YYYY')
    expect(values).toContain('YYYY-MM-DD')
    expect(values).toContain('DD MMM YYYY')
    expect(values).toContain('MMM DD, YYYY')
    expect(values).toContain('DD.MM.YYYY')
  })

  it('TIME_FORMAT_OPTIONS has 12h and 24h', () => {
    expect(TIME_FORMAT_OPTIONS).toHaveLength(2)
    const values = TIME_FORMAT_OPTIONS.map((o) => o.value)
    expect(values).toContain('12h')
    expect(values).toContain('24h')
  })

  it('DISTANCE_UNIT_OPTIONS has miles and kilometers', () => {
    const values = DISTANCE_UNIT_OPTIONS.map((o) => o.value)
    expect(values).toContain('miles')
    expect(values).toContain('kilometers')
  })

  it('WEIGHT_UNIT_OPTIONS has lbs and kg', () => {
    const values = WEIGHT_UNIT_OPTIONS.map((o) => o.value)
    expect(values).toContain('lbs')
    expect(values).toContain('kg')
  })

  it('TEMPERATURE_UNIT_OPTIONS has fahrenheit and celsius', () => {
    const values = TEMPERATURE_UNIT_OPTIONS.map((o) => o.value)
    expect(values).toContain('fahrenheit')
    expect(values).toContain('celsius')
  })

  it('VOLUME_UNIT_OPTIONS has gallons and liters', () => {
    const values = VOLUME_UNIT_OPTIONS.map((o) => o.value)
    expect(values).toContain('gallons')
    expect(values).toContain('liters')
  })

  it('SPEED_UNIT_OPTIONS has mph and km/h', () => {
    const values = SPEED_UNIT_OPTIONS.map((o) => o.value)
    expect(values).toContain('mph')
    expect(values).toContain('km/h')
  })

  it('FUEL_EFFICIENCY_UNIT_OPTIONS has mpg, L/100km, and km/L', () => {
    const values = FUEL_EFFICIENCY_UNIT_OPTIONS.map((o) => o.value)
    expect(values).toContain('mpg')
    expect(values).toContain('L/100km')
    expect(values).toContain('km/L')
  })

  it('PRESSURE_UNIT_OPTIONS has psi, kPa, and bar', () => {
    const values = PRESSURE_UNIT_OPTIONS.map((o) => o.value)
    expect(values).toContain('psi')
    expect(values).toContain('kPa')
    expect(values).toContain('bar')
  })

  it('FIRST_DAY_OF_WEEK_OPTIONS has sunday and monday', () => {
    const values = FIRST_DAY_OF_WEEK_OPTIONS.map((o) => o.value)
    expect(values).toContain('sunday')
    expect(values).toContain('monday')
  })
})

describe('useFormatPreferences', () => {
  beforeEach(() => {
    // Reset to defaults
    formatPreferences.value = {
      timezone: 'America/Chicago',
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
    localStorage.clear()
  })

  it('applyFormatPreferences updates state', () => {
    const { applyFormatPreferences } = useFormatPreferences()
    applyFormatPreferences({ timezone: 'Europe/London', distanceUnit: 'kilometers' })
    expect(formatPreferences.value.timezone).toBe('Europe/London')
    expect(formatPreferences.value.distanceUnit).toBe('kilometers')
    // Other fields remain unchanged
    expect(formatPreferences.value.dateFormat).toBe('MM/DD/YYYY')
  })

  it('applyFormatPreferences persists to localStorage', () => {
    const { applyFormatPreferences } = useFormatPreferences()
    applyFormatPreferences({ dateFormat: 'DD/MM/YYYY' })
    const stored = JSON.parse(localStorage.getItem('motive-format-preferences')!)
    expect(stored.dateFormat).toBe('DD/MM/YYYY')
  })

  it('loadSavedFormatPreferences restores from localStorage', () => {
    localStorage.setItem(
      'motive-format-preferences',
      JSON.stringify({
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        distanceUnit: 'kilometers',
        weightUnit: 'kg',
        temperatureUnit: 'celsius',
        volumeUnit: 'liters',
      }),
    )
    const { loadSavedFormatPreferences } = useFormatPreferences()
    loadSavedFormatPreferences()
    expect(formatPreferences.value.timezone).toBe('UTC')
    expect(formatPreferences.value.dateFormat).toBe('YYYY-MM-DD')
    expect(formatPreferences.value.timeFormat).toBe('24h')
    expect(formatPreferences.value.distanceUnit).toBe('kilometers')
    expect(formatPreferences.value.weightUnit).toBe('kg')
    expect(formatPreferences.value.temperatureUnit).toBe('celsius')
    expect(formatPreferences.value.volumeUnit).toBe('liters')
  })

  it('loadSavedFormatPreferences handles missing fields gracefully', () => {
    localStorage.setItem('motive-format-preferences', JSON.stringify({ timezone: 'Europe/Paris' }))
    const { loadSavedFormatPreferences } = useFormatPreferences()
    loadSavedFormatPreferences()
    expect(formatPreferences.value.timezone).toBe('Europe/Paris')
    // Defaults for unset fields
    expect(formatPreferences.value.dateFormat).toBe('MM/DD/YYYY')
    expect(formatPreferences.value.distanceUnit).toBe('miles')
  })

  it('loadSavedFormatPreferences handles corrupted localStorage', () => {
    localStorage.setItem('motive-format-preferences', 'not-json')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { loadSavedFormatPreferences } = useFormatPreferences()
    loadSavedFormatPreferences()
    // Should remain at defaults without throwing
    expect(formatPreferences.value.dateFormat).toBe('MM/DD/YYYY')
    warnSpy.mockRestore()
  })
})
