import type {
  FuelLossEvent,
  IdlingEvent,
  FuelEventType,
  FuelDropStatus,
  FleetVehicle,
} from '@motive/shared'
import { currentRegion } from '~/composables/useRegion'
import { linkedVehiclesByRegion } from '~/mocks/fleet-linked'

// ── Unified row shape ────────────────────────────────────────
export interface FuelEventRow {
  id: string
  type: FuelEventType
  vehicleId: string
  vehicleName: string
  vehicleMMY: string
  driverId: string | null
  driverName: string | null
  location: string
  locationLat: number
  locationLng: number
  startTime: Date
  endTime: Date
  /** fuel-loss only */
  fuelDrop?: number
  fuelStart?: number
  fuelEnd?: number
  /** idling only */
  durationMins?: number
  fuelWasted?: number
  status: FuelDropStatus
}

// ── Vehicle lookup ───────────────────────────────────────────
function getVehicle(vehicleId: string): FleetVehicle | undefined {
  const vehicles = linkedVehiclesByRegion[currentRegion.value]
  return vehicles.find((v) => v.id === vehicleId)
}

function vehicleMMY(v: FleetVehicle | undefined): string {
  if (!v) return ''
  return `${v.year} ${v.make} ${v.model}`
}

// ── Row mappers ──────────────────────────────────────────────
export function mapFuelLossToRow(e: FuelLossEvent): FuelEventRow {
  const vehicle = getVehicle(e.vehicleId)
  return {
    id: e.id,
    type: 'fuel-loss',
    vehicleId: e.vehicleId,
    vehicleName: vehicle?.unitNumber ?? e.vehicleId,
    vehicleMMY: vehicleMMY(vehicle),
    driverId: vehicle?.driverId ?? null,
    driverName: vehicle?.driverName ?? null,
    location: e.location.address,
    locationLat: e.location.lat,
    locationLng: e.location.lng,
    startTime: e.startTime,
    endTime: e.endTime,
    fuelDrop: e.fuelDrop,
    fuelStart: e.fuelStart,
    fuelEnd: e.fuelEnd,
    status: e.status,
  }
}

export function mapIdlingToRow(e: IdlingEvent): FuelEventRow {
  const vehicle = getVehicle(e.vehicleId)
  return {
    id: e.id,
    type: 'idling',
    vehicleId: e.vehicleId,
    vehicleName: vehicle?.unitNumber ?? e.vehicleId,
    vehicleMMY: vehicleMMY(vehicle),
    driverId: vehicle?.driverId ?? null,
    driverName: vehicle?.driverName ?? null,
    location: e.location.address,
    locationLat: e.location.lat,
    locationLng: e.location.lng,
    startTime: e.startTime,
    endTime: e.endTime,
    durationMins: e.durationMins,
    fuelWasted: e.fuelWasted,
    status: e.status,
  }
}

// ── Find a single event by id ────────────────────────────────
export function findFuelEventRowById(
  id: string,
  fuelLossEvents: FuelLossEvent[],
  idlingEvents: IdlingEvent[],
): FuelEventRow | null {
  const fl = fuelLossEvents.find((e) => e.id === id)
  if (fl) return mapFuelLossToRow(fl)

  const idle = idlingEvents.find((e) => e.id === id)
  if (idle) return mapIdlingToRow(idle)

  return null
}
