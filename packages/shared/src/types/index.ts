/**
 * Motive Shared Types
 * Freight & Fleet Management Domain Types
 */

// ============================================================
// DRIVER TYPES
// ============================================================

export type DriverStatus = 'driving' | 'idle' | 'offline' | 'sleeper' | 'alert'

export interface DriverLocation {
  lat: number
  lng: number
  city: string
  state: string
  address?: string
}

export interface HosData {
  /** Hours remaining for driving (11-hour rule) */
  drivingRemaining: number
  /** Hours remaining on duty (14-hour rule) */
  onDutyRemaining: number
  /** Hours driven today */
  drivingToday: number
  /** Hours on duty today */
  onDutyToday: number
  /** Hours in sleeper berth today */
  sleeperToday: number
  /** Hours off duty today */
  offDutyToday: number
  /** Whether driver has a violation */
  hasViolation: boolean
  /** Cycle hours used (70-hour/8-day rule) */
  cycleUsed: number
  /** Cycle hours remaining */
  cycleRemaining: number
}

export interface Driver {
  id: string
  name: string
  avatar?: string
  initials: string
  licenseNumber: string
  phone: string
  status: DriverStatus
  vehicleId: string
  currentLocation: DriverLocation
  hos: HosData
  etaNextStop?: string
  currentLoad?: string
  milesDrivenToday: number
  lastUpdated: Date
}

// ============================================================
// VEHICLE TYPES
// ============================================================

export type VehicleStatus = 'active' | 'idle' | 'maintenance' | 'offline'

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  status: VehicleStatus
  mileage: number
  fuelLevel: number // 0-100
  driverId?: string
  lastInspection: Date
}

// ============================================================
// KPI TYPES
// ============================================================

export type KpiColor = 'blue' | 'cyan' | 'emerald' | 'amber' | 'red'
export type DeltaType = 'increase' | 'decrease' | 'neutral'

export interface KpiMetric {
  id: string
  title: string
  value: number | string
  displayValue: string
  unit?: string
  delta: number
  deltaLabel: string
  deltaType: DeltaType
  icon: string
  color: KpiColor
  subtitle?: string
}

// ============================================================
// ACTIVITY FEED TYPES
// ============================================================

export type ActivityEventType =
  | 'trip_started'
  | 'trip_completed'
  | 'hos_warning'
  | 'hos_violation'
  | 'geofence_enter'
  | 'geofence_exit'
  | 'fuel_stop'
  | 'alert_triggered'
  | 'driver_login'
  | 'inspection_passed'
  | 'vehicle_idle'
  | 'fuel_loss_detected'

export type ActivitySeverity = 'info' | 'warning' | 'critical' | 'success'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  driverId: string
  driverName: string
  vehicleId?: string
  description: string
  location?: string
  timestamp: Date
  severity: ActivitySeverity
}

// ============================================================
// ALERT TYPES
// ============================================================

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface FleetAlert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  driverId?: string
  driverName?: string
  vehicleId?: string
  timestamp: Date
  dismissed: boolean
  actionLabel?: string
}

// ============================================================
// CHART DATA TYPES
// ============================================================

export interface DailyMilesData {
  date: string
  label: string
  miles: number
  trips: number
}

export interface FleetStatusCount {
  driving: number
  idle: number
  offline: number
  alert: number
  total: number
}

// ============================================================
// DASHBOARD SUMMARY
// ============================================================

export interface DashboardSummary {
  activeDrivers: number
  totalDrivers: number
  milesToday: number
  onTimePercent: number
  activeAlerts: number
  criticalAlerts: number
  fleetStatus: FleetStatusCount
}

// ============================================================
// FUEL LOSS TYPES
// ============================================================

export type FuelDropStatus = 'open' | 'reviewed' | 'dismissed'

export interface FuelLossLocation {
  lat: number
  lng: number
  address: string
}

export interface FuelLossEvent {
  id: string
  vehicleId: string
  vehicleName: string
  driverId?: string
  driverName?: string
  location: FuelLossLocation
  startTime: Date
  endTime: Date
  /** Fuel level at start of stop event (0–100) */
  fuelStart: number
  /** Fuel level at end of stop event (0–100) */
  fuelEnd: number
  /** Percentage points dropped (fuelStart − fuelEnd) */
  fuelDrop: number
  status: FuelDropStatus
}
