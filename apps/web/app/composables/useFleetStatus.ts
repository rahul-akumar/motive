import type { DriverStatus } from '@motive/shared'

/**
 * Fleet driver status — single source of truth for colors and labels.
 * Colors reference the CSS custom properties defined in main.css so they
 * automatically participate in theme changes.
 */

export const FLEET_STATUS_COLORS: Record<DriverStatus, string> = {
  driving: 'var(--fleet-status-driving)',
  idle: 'var(--fleet-status-idle)',
  alert: 'var(--fleet-status-alert)',
  offline: 'var(--fleet-status-offline)',
  sleeper: 'var(--fleet-status-sleeper)',
}

export const FLEET_STATUS_LABELS: Record<DriverStatus, string> = {
  driving: 'Driving',
  idle: 'Idle',
  alert: 'Alert',
  offline: 'Offline',
  sleeper: 'Sleeper',
}

/** Returns the appropriate HOS bar color token based on remaining percentage. */
export function hosBarColor(percent: number, hasViolation: boolean): string {
  if (hasViolation || percent <= 0) return 'var(--fleet-status-alert)'
  if (percent <= 18) return 'var(--fleet-status-idle)' // ~2h of 11h remaining
  return 'var(--fleet-status-driving)'
}
