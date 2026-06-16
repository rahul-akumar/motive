import type { DailyFuelWasteData } from '@motive/shared'
import type { RegionCode } from '~/composables/useRegion'

// 7-day fuel waste = unproductive idling + fuel loss, pre-aggregated per day.
// US in gallons; UK and MX in litres (matching the idling seed-data magnitudes).
export const fuelWasteByRegion: Record<RegionCode, DailyFuelWasteData[]> = {
  us: [
    { date: '2026-02-26', label: 'Thu', idling: 14.2, fuelLoss: 6.8 },
    { date: '2026-02-27', label: 'Fri', idling: 17.6, fuelLoss: 9.4 },
    { date: '2026-02-28', label: 'Sat', idling: 9.8, fuelLoss: 4.1 },
    { date: '2026-03-01', label: 'Sun', idling: 6.3, fuelLoss: 2.7 },
    { date: '2026-03-02', label: 'Mon', idling: 19.1, fuelLoss: 11.2 },
    { date: '2026-03-03', label: 'Tue', idling: 16.4, fuelLoss: 8.5 },
    { date: '2026-03-04', label: 'Today', idling: 18.4, fuelLoss: 9.1 },
  ],
  mx: [
    { date: '2026-02-26', label: 'Thu', idling: 48.5, fuelLoss: 22.0 },
    { date: '2026-02-27', label: 'Fri', idling: 57.2, fuelLoss: 28.6 },
    { date: '2026-02-28', label: 'Sat', idling: 31.4, fuelLoss: 14.3 },
    { date: '2026-03-01', label: 'Sun', idling: 20.7, fuelLoss: 9.1 },
    { date: '2026-03-02', label: 'Mon', idling: 63.8, fuelLoss: 35.4 },
    { date: '2026-03-03', label: 'Tue', idling: 55.1, fuelLoss: 27.9 },
    { date: '2026-03-04', label: 'Today', idling: 60.3, fuelLoss: 30.2 },
  ],
  uk: [
    { date: '2026-02-26', label: 'Thu', idling: 34.6, fuelLoss: 15.2 },
    { date: '2026-02-27', label: 'Fri', idling: 41.9, fuelLoss: 19.8 },
    { date: '2026-02-28', label: 'Sat', idling: 22.3, fuelLoss: 9.6 },
    { date: '2026-03-01', label: 'Sun', idling: 14.1, fuelLoss: 6.2 },
    { date: '2026-03-02', label: 'Mon', idling: 46.7, fuelLoss: 24.5 },
    { date: '2026-03-03', label: 'Tue', idling: 39.2, fuelLoss: 18.7 },
    { date: '2026-03-04', label: 'Today', idling: 43.5, fuelLoss: 21.4 },
  ],
}
