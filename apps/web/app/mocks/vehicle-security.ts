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
      location: { lat: 32.18, lng: -110.92 },
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
      location: { lat: 32.2, lng: -110.95 },
      date: new Date('2025-07-22'),
      type: 'unauthorized-movement',
    },
  ],
}

export const JAMMED_VEHICLE_ID = TARGET_VEHICLE_ID
