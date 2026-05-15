import type { VehicleDevice, JammingEvent } from '@motive/shared'

// We attach devices to VEH-US-003 (Tucson, AZ corridor — I-10)
const TARGET_VEHICLE_ID = 'VEH-US-003'

function ago(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000)
}

// ── Devices installed on the target vehicle ──────────────────────────────────

const vehicleGateway: VehicleDevice = {
  id: 'DEV-VG-001',
  vehicleId: TARGET_VEHICLE_ID,
  type: 'vehicle-gateway',
  name: 'MV-VG400 Vehicle Gateway',
  serialNumber: 'VG-2024-83721-A',
  firmwareVersion: '4.2.1',
  status: 'signal-jammed',
  installedAt: new Date('2024-06-15'),
  lastHeartbeat: ago(5),
}

const engineImmobilizer: VehicleDevice = {
  id: 'DEV-EI-001',
  vehicleId: TARGET_VEHICLE_ID,
  type: 'engine-immobilizer',
  name: 'MV-EI200 Engine Immobilizer',
  serialNumber: 'EI-2024-44109-B',
  firmwareVersion: '2.1.0',
  status: 'activated',
  installedAt: new Date('2024-06-15'),
  lastHeartbeat: ago(5),
  dependsOn: 'DEV-VG-001',
  sensors: [
    { label: 'GPS', value: 'Jammed', status: 'critical' },
    { label: 'Cellular', value: 'Jammed', status: 'critical' },
    { label: 'Jamming', value: 'Detected', status: 'critical' },
    { label: 'Battery', value: '94%', status: 'normal' },
    { label: 'Relay', value: 'Engaged', status: 'critical' },
    { label: 'Tamper', value: 'Clear', status: 'normal' },
    { label: 'Accelerometer', value: 'Stationary', status: 'normal' },
    { label: 'Ignition', value: 'Off', status: 'normal' },
  ],
}

export const mockVehicleDevices: VehicleDevice[] = [vehicleGateway, engineImmobilizer]

// ── Active jamming event ─────────────────────────────────────────────────────

export const mockJammingEvent: JammingEvent = {
  id: 'JAM-001',
  vehicleId: TARGET_VEHICLE_ID,
  lastKnownLocation: {
    lat: 32.15,
    lng: -110.87,
    address: 'I-10 Westbound, mile marker 264, Tucson AZ',
  },
  lastKnownSpeed: 75,
  lastKnownHeading: 315,
  degradedAt: ago(8),
  jammedAt: ago(5),
  immobilizerActivatedAt: ago(3),
  isActive: true,
  routeTrail: [
    { lat: 31.984, lng: -110.541, speed: 105 },
    { lat: 31.985, lng: -110.556, speed: 105 },
    { lat: 31.986, lng: -110.565, speed: 102 },
    { lat: 31.987, lng: -110.578, speed: 100 },
    { lat: 31.988, lng: -110.588, speed: 98 },
    { lat: 31.991, lng: -110.6, speed: 95 },
    { lat: 31.994, lng: -110.611, speed: 92 },
    { lat: 31.998, lng: -110.623, speed: 90 },
    { lat: 31.999, lng: -110.632, speed: 88 },
    { lat: 31.998, lng: -110.644, speed: 85 },
    { lat: 31.997, lng: -110.653, speed: 85 },
    { lat: 31.998, lng: -110.661, speed: 82 },
    { lat: 32.0, lng: -110.671, speed: 80 },
    { lat: 32.002, lng: -110.68, speed: 80 },
    { lat: 32.006, lng: -110.689, speed: 78 },
    { lat: 32.014, lng: -110.701, speed: 78 },
    { lat: 32.022, lng: -110.712, speed: 77 },
    { lat: 32.031, lng: -110.725, speed: 76 },
    { lat: 32.041, lng: -110.738, speed: 75 },
    { lat: 32.046, lng: -110.748, speed: 75 },
    { lat: 32.052, lng: -110.758, speed: 75 },
    { lat: 32.062, lng: -110.774, speed: 75 },
    { lat: 32.071, lng: -110.788, speed: 74 },
    { lat: 32.083, lng: -110.808, speed: 74 },
    { lat: 32.095, lng: -110.826, speed: 72 },
    { lat: 32.105, lng: -110.842, speed: 68 },
    { lat: 32.113, lng: -110.855, speed: 60 },
    { lat: 32.122, lng: -110.862, speed: 45 },
    { lat: 32.133, lng: -110.865, speed: 25 },
    { lat: 32.142, lng: -110.868, speed: 10 },
    { lat: 32.15, lng: -110.87, speed: 0 },
  ],
  timeline: [
    {
      phase: 'normal',
      timestamp: ago(12),
      description: 'All systems nominal. GPS and cellular operating normally.',
      signalStrength: 94,
      location: { lat: 32.122, lng: -110.838 },
    },
    {
      phase: 'degraded',
      timestamp: ago(8),
      description: 'Signal strength dropping. Possible interference detected.',
      signalStrength: 42,
      location: { lat: 32.133, lng: -110.849 },
    },
    {
      phase: 'jammed',
      timestamp: ago(5),
      description: 'GPS and cellular signals lost. Jamming confirmed.',
      signalStrength: 0,
      location: { lat: 32.142, lng: -110.858 },
    },
    {
      phase: 'immobilizer-armed',
      timestamp: ago(4),
      description: 'Engine immobilizer armed. Waiting for confirmation.',
      signalStrength: 0,
      location: { lat: 32.146, lng: -110.864 },
    },
    {
      phase: 'immobilizer-activated',
      timestamp: ago(3),
      description: 'Engine immobilizer activated. Fuel cut-off engaged.',
      signalStrength: 0,
      location: { lat: 32.15, lng: -110.87 },
    },
  ],
  priorIncidents: [
    {
      id: 'INC-101',
      location: { lat: 32.165, lng: -110.885 },
      date: new Date('2025-11-03'),
      type: 'jamming',
    },
    {
      id: 'INC-102',
      location: { lat: 32.12, lng: -110.82 },
      date: new Date('2025-09-18'),
      type: 'theft-attempt',
    },
    {
      id: 'INC-103',
      location: { lat: 32.4, lng: -111.15 },
      date: new Date('2025-07-22'),
      type: 'unauthorized-movement',
    },
    {
      id: 'INC-104',
      location: { lat: 32.25, lng: -109.83 },
      date: new Date('2025-04-11'),
      type: 'jamming',
    },
    {
      id: 'INC-105',
      location: { lat: 32.35, lng: -108.71 },
      date: new Date('2025-01-08'),
      type: 'theft-attempt',
    },
    {
      id: 'INC-106',
      location: { lat: 32.76, lng: -111.55 },
      date: new Date('2024-09-27'),
      type: 'jamming',
    },
    {
      id: 'INC-107',
      location: { lat: 33.37, lng: -112.03 },
      date: new Date('2024-05-14'),
      type: 'unauthorized-movement',
    },
  ],
}

export const JAMMED_VEHICLE_ID = TARGET_VEHICLE_ID
