import type { FuelLossEvent } from '@motive/shared'
import type { RegionCode } from '~/composables/useRegion'
import { seedEventsUS } from './us'
import { seedEventsUK } from './uk'
import { seedEventsMX } from './mx'

// ── Region seed map ──────────────────────────────────────────
export const fuelLossByRegion: Record<RegionCode, FuelLossEvent[]> = {
  us: seedEventsUS,
  mx: seedEventsMX,
  uk: seedEventsUK,
}
