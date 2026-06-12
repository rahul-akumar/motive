import { currentRegion } from '~/composables/useRegion'
import { camerasByRegion } from '~/mocks/cameras'

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

export function useCameraData() {
  const cameras = computed<Camera[]>(() => camerasByRegion[currentRegion.value])
  return { cameras }
}
