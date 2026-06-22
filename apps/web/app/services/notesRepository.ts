/**
 * Persistence seam for event notes. Today it simulates a network round-trip
 * against in-memory state; a real backend would slot in behind `saveNote`
 * without touching callers. Pairs with useOptimisticAction so the UI updates
 * instantly and rolls back if this rejects.
 */

export interface NotePayload {
  eventId: string
  text: string
  visibleToDriver: boolean
}

const SAVE_LATENCY_MS = 600

/**
 * Dev-only fault injection. Defaults to 0 (off); set a probability (0–1) to make
 * `saveNote` reject so the optimistic rollback + error toast can be exercised.
 */
let mockFailureRate = 0

export function setNoteMockFailureRate(rate: number): void {
  mockFailureRate = Math.min(1, Math.max(0, rate))
}

export async function saveNote(_payload: NotePayload): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, SAVE_LATENCY_MS))
  if (mockFailureRate > 0 && Math.random() < mockFailureRate) {
    throw new Error('Simulated note save failure')
  }
}
