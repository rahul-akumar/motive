import { describe, it, expect, beforeEach } from 'vitest'
import { formatPreferences } from '~/composables/useFormatPreferences'
import { useFormatters } from '~/composables/useFormatters'

describe('useFormatters', () => {
  beforeEach(() => {
    // Reset to US defaults
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
  })

  describe('formatDate', () => {
    const testDate = new Date('2025-06-15T14:30:00Z')

    it('formats in MM/DD/YYYY style', () => {
      formatPreferences.value.dateFormat = 'MM/DD/YYYY'
      const { formatDate } = useFormatters()
      const result = formatDate(testDate)
      expect(result).toMatch(/06\/15\/2025/)
    })

    it('formats in DD/MM/YYYY style', () => {
      formatPreferences.value.dateFormat = 'DD/MM/YYYY'
      const { formatDate } = useFormatters()
      const result = formatDate(testDate)
      expect(result).toMatch(/15\/06\/2025/)
    })

    it('formats in YYYY-MM-DD style', () => {
      formatPreferences.value.dateFormat = 'YYYY-MM-DD'
      const { formatDate } = useFormatters()
      const result = formatDate(testDate)
      expect(result).toMatch(/2025-06-15/)
    })

    it('respects timezone setting', () => {
      formatPreferences.value.timezone = 'UTC'
      formatPreferences.value.dateFormat = 'MM/DD/YYYY'
      const { formatDate } = useFormatters()
      const result = formatDate(new Date('2025-01-01T00:30:00Z'))
      expect(result).toMatch(/01\/01\/2025/)
    })
  })

  describe('formatTime', () => {
    const testDate = new Date('2025-06-15T14:30:00Z')

    it('formats in 12-hour mode', () => {
      formatPreferences.value.timeFormat = '12h'
      formatPreferences.value.timezone = 'UTC'
      const { formatTime } = useFormatters()
      const result = formatTime(testDate)
      expect(result).toMatch(/2:30\s*PM/i)
    })

    it('formats in 24-hour mode', () => {
      formatPreferences.value.timeFormat = '24h'
      formatPreferences.value.timezone = 'UTC'
      const { formatTime } = useFormatters()
      const result = formatTime(testDate)
      expect(result).toMatch(/14:30/)
    })
  })

  describe('formatDateTime', () => {
    it('combines date and time formatting', () => {
      formatPreferences.value.timezone = 'UTC'
      formatPreferences.value.dateFormat = 'MM/DD/YYYY'
      formatPreferences.value.timeFormat = '12h'
      const { formatDateTime } = useFormatters()
      const result = formatDateTime(new Date('2025-06-15T14:30:00Z'))
      expect(result).toContain('06')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })
  })

  describe('formatRelativeTime', () => {
    it('returns "just now" for recent timestamps', () => {
      const { formatRelativeTime } = useFormatters()
      const result = formatRelativeTime(new Date(Date.now() - 10_000))
      expect(result).toBe('just now')
    })

    it('returns minutes ago', () => {
      const { formatRelativeTime } = useFormatters()
      const result = formatRelativeTime(new Date(Date.now() - 5 * 60_000))
      expect(result).toBe('5m ago')
    })

    it('returns hours ago', () => {
      const { formatRelativeTime } = useFormatters()
      const result = formatRelativeTime(new Date(Date.now() - 3 * 3_600_000))
      expect(result).toBe('3h ago')
    })

    it('returns days ago', () => {
      const { formatRelativeTime } = useFormatters()
      const result = formatRelativeTime(new Date(Date.now() - 2 * 86_400_000))
      expect(result).toBe('2d ago')
    })
  })

  describe('formatDistance', () => {
    it('formats in miles by default', () => {
      const { formatDistance } = useFormatters()
      expect(formatDistance(100)).toBe('100 mi')
    })

    it('converts to kilometers', () => {
      formatPreferences.value.distanceUnit = 'kilometers'
      const { formatDistance } = useFormatters()
      const result = formatDistance(100)
      expect(result).toContain('km')
      // 100 miles ≈ 161 km
      expect(result).toMatch(/161/)
    })

    it('supports decimal places', () => {
      const { formatDistance } = useFormatters()
      const result = formatDistance(100.5, { decimals: 1 })
      expect(result).toContain('mi')
    })
  })

  describe('formatWeight', () => {
    it('formats in lbs by default', () => {
      const { formatWeight } = useFormatters()
      expect(formatWeight(200)).toBe('200 lbs')
    })

    it('converts to kg', () => {
      formatPreferences.value.weightUnit = 'kg'
      const { formatWeight } = useFormatters()
      const result = formatWeight(200)
      expect(result).toContain('kg')
      // 200 lbs ≈ 91 kg
      expect(result).toMatch(/91/)
    })
  })

  describe('formatTemperature', () => {
    it('formats in fahrenheit by default', () => {
      const { formatTemperature } = useFormatters()
      expect(formatTemperature(72)).toBe('72°F')
    })

    it('converts to celsius', () => {
      formatPreferences.value.temperatureUnit = 'celsius'
      const { formatTemperature } = useFormatters()
      const result = formatTemperature(72)
      expect(result).toContain('°C')
      // 72°F ≈ 22°C
      expect(result).toMatch(/22/)
    })
  })

  describe('formatVolume', () => {
    it('formats in gallons by default', () => {
      const { formatVolume } = useFormatters()
      const result = formatVolume(50)
      expect(result).toContain('gal')
    })

    it('converts to liters', () => {
      formatPreferences.value.volumeUnit = 'liters'
      const { formatVolume } = useFormatters()
      const result = formatVolume(50)
      expect(result).toContain('L')
      // 50 gal ≈ 189 L
      expect(result).toMatch(/189/)
    })
  })

  describe('formatSpeed', () => {
    it('formats in mph by default', () => {
      const { formatSpeed } = useFormatters()
      expect(formatSpeed(65)).toBe('65 mph')
    })

    it('converts to km/h', () => {
      formatPreferences.value.speedUnit = 'km/h'
      const { formatSpeed } = useFormatters()
      const result = formatSpeed(65)
      expect(result).toContain('km/h')
      // 65 mph ≈ 105 km/h
      expect(result).toMatch(/105/)
    })
  })

  describe('formatFuelEfficiency', () => {
    it('formats in MPG by default', () => {
      const { formatFuelEfficiency } = useFormatters()
      const result = formatFuelEfficiency(25)
      expect(result).toContain('MPG')
    })

    it('converts to L/100km', () => {
      formatPreferences.value.fuelEfficiencyUnit = 'L/100km'
      const { formatFuelEfficiency } = useFormatters()
      const result = formatFuelEfficiency(25)
      expect(result).toContain('L/100km')
      // 25 MPG ≈ 9.4 L/100km
      expect(result).toMatch(/9\.4/)
    })

    it('converts to km/L', () => {
      formatPreferences.value.fuelEfficiencyUnit = 'km/L'
      const { formatFuelEfficiency } = useFormatters()
      const result = formatFuelEfficiency(25)
      expect(result).toContain('km/L')
      // 25 MPG ≈ 10.6 km/L
      expect(result).toMatch(/10\.6/)
    })
  })

  describe('formatPressure', () => {
    it('formats in psi by default', () => {
      const { formatPressure } = useFormatters()
      const result = formatPressure(32)
      expect(result).toContain('psi')
    })

    it('converts to kPa', () => {
      formatPreferences.value.pressureUnit = 'kPa'
      const { formatPressure } = useFormatters()
      const result = formatPressure(32)
      expect(result).toContain('kPa')
      // 32 psi ≈ 220.6 kPa
      expect(result).toMatch(/220/)
    })

    it('converts to bar', () => {
      formatPreferences.value.pressureUnit = 'bar'
      const { formatPressure } = useFormatters()
      const result = formatPressure(32)
      expect(result).toContain('bar')
      // 32 psi ≈ 2.2 bar
      expect(result).toMatch(/2\.2/)
    })
  })
})
