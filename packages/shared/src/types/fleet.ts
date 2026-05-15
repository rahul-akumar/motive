/**
 * Fleet Management Types — Vehicles, Drivers, Assets
 * Used by table views, fleet map, and detail panels.
 */

// ── Shared ────────────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number
  lng: number
  city: string
  state: string
}

// ── Vehicle ───────────────────────────────────────────────────────────────────

export type FleetVehicleStatus = 'active' | 'idle' | 'out-of-service' | 'maintenance'

export interface FleetVehicle {
  id: string
  unitNumber: string
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  status: FleetVehicleStatus
  driverId: string | null
  driverName: string | null
  assetId: string | null
  assetName: string | null
  currentLocation: GeoPoint
  defects: number
  cameras: number
  mileage: number
  fuelLevel: number
}

// ── Driver ────────────────────────────────────────────────────────────────────

export type FleetDriverStatus = 'driving' | 'idle' | 'alert' | 'offline' | 'sleeper'

export interface FleetDriverHos {
  breakRemaining: number
  driveRemaining: number
  shiftRemaining: number
  cycleRemaining: number
  hoursToday: number
  hoursThisWeek: number
  hasViolation: boolean
}

export interface FleetDriver {
  id: string
  name: string
  initials: string
  phone: string
  licenseNumber: string
  status: FleetDriverStatus
  vehicleId: string | null
  vehicleUnitNumber: string | null
  assetId: string | null
  assetName: string | null
  currentLocation: GeoPoint
  hos: FleetDriverHos
}

// ── Asset ─────────────────────────────────────────────────────────────────────

export type FleetAssetType = 'trailer' | 'container' | 'generator'

export type FleetAssetSubtype =
  | 'dry-van'
  | 'flatbed'
  | 'reefer'
  | '20ft'
  | '40ft'
  | 'portable'
  | 'stationary'

export type FleetAssetAvailability = 'in-use' | 'available' | 'maintenance' | 'decommissioned'

export type FleetAssetSource = 'GPS' | 'ELD' | 'Manual' | 'BLE'

export interface FleetAsset {
  id: string
  name: string
  type: FleetAssetType
  subtype: FleetAssetSubtype
  driverId: string | null
  driverName: string | null
  vehicleId: string | null
  vehicleUnitNumber: string | null
  currentLocation: GeoPoint
  source: FleetAssetSource
  availability: FleetAssetAvailability
  cameras: number
}
