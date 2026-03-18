export type CameraType = 'dashcam' | 'ai-omnicam' | 'multi-cam-dvr'
export type CameraFacing = 'road' | 'dual'
export type CameraStatus =
  | 'online'
  | 'offline'
  | 'pending-setup'
  | 'installation-issue'
  | 'signal-issue'

export type KpiFilter = 'online' | 'offline' | 'pending' | 'issues'

export interface Camera {
  id: string
  vehicle: string
  assetId: string
  type: CameraType
  facing: CameraFacing
  status: CameraStatus
  lastLocation: string
  lastSeen: string
  previewUrl: string | null
}

export const STATUS_SEVERITY: Record<CameraStatus, number> = {
  offline: 0,
  'signal-issue': 1,
  'installation-issue': 2,
  'pending-setup': 3,
  online: 4,
}

export function getStatusGroup(status: CameraStatus): KpiFilter {
  if (status === 'online') return 'online'
  if (status === 'offline') return 'offline'
  if (status === 'pending-setup') return 'pending'
  return 'issues'
}

const CAMERAS: Camera[] = [
  {
    id: 'cam-01',
    vehicle: 'Truck 01',
    assetId: 'asset-001',
    type: 'ai-omnicam',
    facing: 'dual',
    status: 'online',
    lastLocation: 'US-50 E, Sacramento CA',
    lastSeen: '1m ago',
    previewUrl: 'https://picsum.photos/seed/truck01/320/180',
  },
  {
    id: 'cam-02',
    vehicle: 'Truck 02',
    assetId: 'asset-002',
    type: 'dashcam',
    facing: 'road',
    status: 'online',
    lastLocation: 'I-80 W, Sparks NV',
    lastSeen: '3m ago',
    previewUrl: 'https://picsum.photos/seed/truck02/320/180',
  },
  {
    id: 'cam-03',
    vehicle: 'Truck 03',
    assetId: 'asset-003',
    type: 'multi-cam-dvr',
    facing: 'dual',
    status: 'offline',
    lastLocation: 'Last: I-5 S, Stockton CA',
    lastSeen: '3h ago',
    previewUrl: null,
  },
  {
    id: 'cam-04',
    vehicle: 'Truck 04',
    assetId: 'asset-004',
    type: 'dashcam',
    facing: 'road',
    status: 'online',
    lastLocation: 'CA-99 N, Modesto CA',
    lastSeen: '5m ago',
    previewUrl: 'https://picsum.photos/seed/truck04/320/180',
  },
  {
    id: 'cam-05',
    vehicle: 'Truck 05',
    assetId: 'asset-005',
    type: 'ai-omnicam',
    facing: 'dual',
    status: 'signal-issue',
    lastLocation: 'I-15 N, Barstow CA',
    lastSeen: '47m ago',
    previewUrl: null,
  },
  {
    id: 'cam-06',
    vehicle: 'Truck 06',
    assetId: 'asset-006',
    type: 'multi-cam-dvr',
    facing: 'road',
    status: 'online',
    lastLocation: 'I-40 E, Needles CA',
    lastSeen: '2m ago',
    previewUrl: 'https://picsum.photos/seed/truck06/320/180',
  },
  {
    id: 'cam-07',
    vehicle: 'Truck 07',
    assetId: 'asset-007',
    type: 'dashcam',
    facing: 'road',
    status: 'installation-issue',
    lastLocation: 'Depot · Yard 2',
    lastSeen: '2d ago',
    previewUrl: null,
  },
  {
    id: 'cam-08',
    vehicle: 'Truck 08',
    assetId: 'asset-008',
    type: 'ai-omnicam',
    facing: 'dual',
    status: 'online',
    lastLocation: 'I-10 W, Palm Springs CA',
    lastSeen: '8m ago',
    previewUrl: 'https://picsum.photos/seed/truck08/320/180',
  },
  {
    id: 'cam-09',
    vehicle: 'Truck 09',
    assetId: 'asset-009',
    type: 'dashcam',
    facing: 'road',
    status: 'online',
    lastLocation: 'US-395 N, Reno NV',
    lastSeen: '12m ago',
    previewUrl: 'https://picsum.photos/seed/truck09/320/180',
  },
  {
    id: 'cam-10',
    vehicle: 'Truck 10',
    assetId: 'asset-010',
    type: 'multi-cam-dvr',
    facing: 'dual',
    status: 'online',
    lastLocation: 'I-80 E, Salt Lake City UT',
    lastSeen: '6m ago',
    previewUrl: 'https://picsum.photos/seed/truck10/320/180',
  },
  {
    id: 'cam-11',
    vehicle: 'Truck 11',
    assetId: 'asset-011',
    type: 'ai-omnicam',
    facing: 'road',
    status: 'online',
    lastLocation: 'I-15 S, Las Vegas NV',
    lastSeen: '4m ago',
    previewUrl: 'https://picsum.photos/seed/truck11/320/180',
  },
  {
    id: 'cam-12',
    vehicle: 'Truck 12',
    assetId: 'asset-012',
    type: 'dashcam',
    facing: 'road',
    status: 'offline',
    lastLocation: 'Last: I-40 W, Flagstaff AZ',
    lastSeen: '5h ago',
    previewUrl: null,
  },
  {
    id: 'cam-13',
    vehicle: 'Truck 13',
    assetId: 'asset-013',
    type: 'multi-cam-dvr',
    facing: 'dual',
    status: 'online',
    lastLocation: 'I-10 E, Tucson AZ',
    lastSeen: '9m ago',
    previewUrl: 'https://picsum.photos/seed/truck13/320/180',
  },
  {
    id: 'cam-14',
    vehicle: 'Truck 14',
    assetId: 'asset-014',
    type: 'ai-omnicam',
    facing: 'dual',
    status: 'pending-setup',
    lastLocation: 'Depot · Bay 3',
    lastSeen: '—',
    previewUrl: null,
  },
  {
    id: 'cam-15',
    vehicle: 'Truck 15',
    assetId: 'asset-015',
    type: 'dashcam',
    facing: 'road',
    status: 'online',
    lastLocation: 'I-25 N, Albuquerque NM',
    lastSeen: '15m ago',
    previewUrl: 'https://picsum.photos/seed/truck15/320/180',
  },
  {
    id: 'cam-16',
    vehicle: 'Truck 16',
    assetId: 'asset-016',
    type: 'multi-cam-dvr',
    facing: 'road',
    status: 'online',
    lastLocation: 'I-40 E, Amarillo TX',
    lastSeen: '7m ago',
    previewUrl: 'https://picsum.photos/seed/truck16/320/180',
  },
  {
    id: 'cam-17',
    vehicle: 'Truck 17',
    assetId: 'asset-017',
    type: 'ai-omnicam',
    facing: 'dual',
    status: 'online',
    lastLocation: 'I-20 W, Midland TX',
    lastSeen: '11m ago',
    previewUrl: 'https://picsum.photos/seed/truck17/320/180',
  },
  {
    id: 'cam-18',
    vehicle: 'Truck 18',
    assetId: 'asset-018',
    type: 'dashcam',
    facing: 'road',
    status: 'online',
    lastLocation: 'I-10 W, San Antonio TX',
    lastSeen: '2m ago',
    previewUrl: 'https://picsum.photos/seed/truck18/320/180',
  },
  {
    id: 'cam-19',
    vehicle: 'Truck 19',
    assetId: 'asset-019',
    type: 'multi-cam-dvr',
    facing: 'dual',
    status: 'online',
    lastLocation: 'I-35 N, Austin TX',
    lastSeen: '18m ago',
    previewUrl: 'https://picsum.photos/seed/truck19/320/180',
  },
  {
    id: 'cam-20',
    vehicle: 'Truck 20',
    assetId: 'asset-020',
    type: 'ai-omnicam',
    facing: 'road',
    status: 'online',
    lastLocation: 'I-45 S, Houston TX',
    lastSeen: '5m ago',
    previewUrl: 'https://picsum.photos/seed/truck20/320/180',
  },
]

export function useCameraData() {
  return { cameras: CAMERAS }
}
