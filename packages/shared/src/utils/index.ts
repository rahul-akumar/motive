/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'motive'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
