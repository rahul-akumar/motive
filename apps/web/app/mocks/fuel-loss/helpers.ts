// Shared time helpers for the fuel-loss seed events.
// `now` anchors every relative timestamp so the dataset stays internally consistent.
const now = new Date()

export function ago(days = 0, hours = 0, minutes = 0): Date {
  return new Date(now.getTime() - days * 86_400_000 - hours * 3_600_000 - minutes * 60_000)
}

export function addMins(date: Date, m: number): Date {
  return new Date(date.getTime() + m * 60_000)
}
