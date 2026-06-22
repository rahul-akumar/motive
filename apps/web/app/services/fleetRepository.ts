import type { FleetVehicle, FleetDriver, FleetAsset } from '@motive/shared'
import type { RegionCode } from '~/composables/useRegion'
import {
  linkedVehiclesByRegion,
  linkedDriversByRegion,
  linkedAssetsByRegion,
} from '~/mocks/fleet-linked'

/**
 * Region-scoped access to fleet data (US/EU/…).
 *
 * This is the single seam between the app and the fleet data source. Today it
 * reads in-memory mock fixtures; a real region-aware backend would slot in
 * behind the same functions without touching consumers.
 *
 * - The `*ForRegion` helpers return the current snapshot synchronously and back
 *   the reactive computeds in useFleetData.
 * - The async `get*` getters are the backend-shaped fetch path (used by
 *   refresh); they're what a network-backed implementation would provide.
 *
 * Keep this boring — plain functions, no DI or interfaces.
 */

export function vehiclesForRegion(region: RegionCode): FleetVehicle[] {
  return linkedVehiclesByRegion[region]
}

export function driversForRegion(region: RegionCode): FleetDriver[] {
  return linkedDriversByRegion[region]
}

export function assetsForRegion(region: RegionCode): FleetAsset[] {
  return linkedAssetsByRegion[region]
}

/** Simulated network latency so the loading state is exercised in the mock. */
const MOCK_LATENCY_MS = 800

function simulateLatency(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
}

/**
 * Dev-only fault injection. Defaults to 0 (off) so normal UX is untouched; set a
 * probability (0–1) to make the async getters fail, exercising the error/retry
 * states rendered by <AsyncBoundary>. A real backend would surface real errors.
 */
let mockFailureRate = 0

export function setFleetMockFailureRate(rate: number): void {
  mockFailureRate = Math.min(1, Math.max(0, rate))
}

function maybeFail(): void {
  if (mockFailureRate > 0 && Math.random() < mockFailureRate) {
    throw new Error('Simulated fleet fetch failure')
  }
}

export async function getVehicles(region: RegionCode): Promise<FleetVehicle[]> {
  await simulateLatency()
  maybeFail()
  return vehiclesForRegion(region)
}

export async function getDrivers(region: RegionCode): Promise<FleetDriver[]> {
  await simulateLatency()
  maybeFail()
  return driversForRegion(region)
}

export async function getAssets(region: RegionCode): Promise<FleetAsset[]> {
  await simulateLatency()
  maybeFail()
  return assetsForRegion(region)
}
