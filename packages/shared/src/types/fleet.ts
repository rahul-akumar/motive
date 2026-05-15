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

// ── Vehicle Device (installed hardware) ──────────────────────────────────────

export type VehicleDeviceType =
  | 'vehicle-gateway'
  | 'asset-gateway'
  | 'beacon'
  | 'visionlink'
  | 'komtrax'
  | 'engine-immobilizer'

export type VehicleDeviceStatus =
  | 'online'
  | 'offline'
  | 'signal-jammed'
  | 'activated'
  | 'armed'
  | 'disarmed'
  | 'error'

export interface VehicleDeviceSensor {
  label: string
  value: string
  status: 'normal' | 'warning' | 'critical'
}

export interface VehicleDevice {
  id: string
  vehicleId: string
  type: VehicleDeviceType
  name: string
  serialNumber: string
  firmwareVersion: string
  status: VehicleDeviceStatus
  installedAt: Date
  lastHeartbeat: Date
  dependsOn?: string
  sensors?: VehicleDeviceSensor[]
}

// ── Signal Jamming ───────────────────────────────────────────────────────────

export type SignalEventPhase =
  | 'normal'
  | 'degraded'
  | 'jammed'
  | 'immobilizer-armed'
  | 'immobilizer-activated'
  | 'recovered'

export interface SignalTimelineEntry {
  phase: SignalEventPhase
  timestamp: Date
  description: string
  signalStrength?: number
  location?: { lat: number; lng: number }
}

export interface JammingEvent {
  id: string
  vehicleId: string
  lastKnownLocation: { lat: number; lng: number; address: string }
  lastKnownSpeed: number
  lastKnownHeading: number
  degradedAt: Date
  jammedAt: Date
  immobilizerActivatedAt?: Date
  isActive: boolean
  routeTrail?: Array<{ lat: number; lng: number; speed?: number }>
  timeline: SignalTimelineEntry[]
  priorIncidents: Array<{
    id: string
    location: { lat: number; lng: number }
    date: Date
    type: 'jamming' | 'theft-attempt' | 'unauthorized-movement'
  }>
}
