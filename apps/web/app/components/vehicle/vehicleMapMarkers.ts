import type { FleetVehicleStatus } from '@motive/shared'

type Leaflet = typeof import('leaflet')

export const STATUS_COLORS: Record<FleetVehicleStatus, string> = {
  active: '#4ade80',
  idle: '#fbbf24',
  'out-of-service': '#f87171',
  maintenance: '#94a3b8',
}

export const SEARCH_ZONE_STYLES = {
  active: {
    circleColor: 'rgba(248, 113, 113, 0.3)',
    circleFill: 'rgba(248, 113, 113, 0.04)',
    circleDash: '8, 6',
    circleWeight: 1.5,
    sectorColor: 'rgba(248, 113, 113, 0.6)',
    sectorFill: 'rgba(248, 113, 113, 0.12)',
  },
  frozen: {
    circleColor: 'rgba(74, 222, 128, 0.5)',
    circleFill: 'rgba(74, 222, 128, 0.06)',
    circleDash: '',
    circleWeight: 2,
    sectorColor: 'rgba(74, 222, 128, 0.4)',
    sectorFill: 'rgba(74, 222, 128, 0.08)',
  },
} as const

export const INCIDENT_HEX: Record<string, string> = {
  jamming: '#d97706',
  'theft-attempt': '#f26040',
  'unauthorized-movement': '#e52222',
}

/** Map a trail-segment speed (mph) to a green→amber→red rgba stroke color. */
export function speedToColor(speed: number): string {
  const t = Math.min(speed / 105, 1)
  if (t > 0.6) return `rgba(74, 222, 128, ${0.5 + t * 0.3})`
  if (t > 0.3) return `rgba(251, 191, 36, ${0.5 + t * 0.3})`
  return `rgba(248, 113, 113, ${0.5 + (1 - t) * 0.3})`
}

/** Solid status dot for a non-jammed vehicle. */
export function createVehicleStatusIcon(L: Leaflet, color: string) {
  const { readCSSColor } = useCssColors()
  const dotColor = readCSSColor('--mtv-color-foreground-default', '#ffffff')
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid ${dotColor};
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "><div style="width: 8px; height: 8px; background: ${dotColor}; border-radius: 50%;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

/** Pulsing red "jammed" last-known-location marker. */
export function createJammedIcon(L: Leaflet) {
  const { readCSSColor } = useCssColors()
  const fg = readCSSColor('--mtv-color-foreground-default', '#ffffff')
  return L.divIcon({
    className: '',
    html: `<div class="jammed-marker">
      <div class="jammed-marker__ring"></div>
      <div class="jammed-marker__dot">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${fg}" stroke-width="2.5">
          <path d="M2 12 L22 12 M12 2 L12 22" transform="rotate(45 12 12)"/>
          <circle cx="12" cy="12" r="8"/>
        </svg>
      </div>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}

/** Triangular heading-arrow tip, rotated to the last-known heading. */
export function createArrowIcon(L: Leaflet, heading: number) {
  const { readCSSColor } = useCssColors()
  const arrowColor = readCSSColor('--fleet-status-idle', '#fbbf24')
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 0; height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 12px solid ${arrowColor};
      transform: rotate(${heading}deg);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

/** Square warning marker for a prior incident, tinted by incident color. */
export function createIncidentIcon(L: Leaflet, hex: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
        width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        background: ${hex}33;
        border: 1.5px solid ${hex};
        border-radius: 4px;
      "><svg width="12" height="12" viewBox="0 0 24 24" fill="${hex}" stroke="none">
        <path d="M12 2L2 22h20L12 2zm0 6v6m0 2v2"/>
      </svg></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

/** "CONTAINED" badge shown at the top of a frozen search zone. */
export function createContainedBadgeIcon(L: Leaflet) {
  const { readCSSColor } = useCssColors()
  const driving = readCSSColor('--fleet-status-driving', '#4ade80')
  return L.divIcon({
    className: '',
    html: `<div style="
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: rgba(22, 101, 52, 0.85);
      border: 1px solid rgba(74, 222, 128, 0.5);
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: ${driving};
      white-space: nowrap;
      pointer-events: none;
    ">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${driving}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
      CONTAINED
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [50, 16],
  })
}
