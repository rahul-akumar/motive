export interface OptimisticRun<TResult> {
  /** The real mutation (network/repository call). */
  action: () => Promise<TResult>
  /** Apply the optimistic update to local state immediately. */
  apply: () => void
  /** Undo the optimistic update if the action fails. */
  rollback: () => void
  /** Toast message shown on success. Omit to stay silent on success. */
  successMessage?: string
  /** Toast message shown on failure. @default 'Something went wrong. Please try again.' */
  errorMessage?: string
}

/**
 * Runs a mutation optimistically: applies the local update right away, then
 * confirms with the real action — rolling back and surfacing an error toast on
 * failure, and an optional success toast on success. Keeps mutation UX
 * consistent across the app instead of each call site reinventing it.
 */
export function useOptimisticAction() {
  const { showToast } = useToast()
  const isPending = ref(false)

  async function run<TResult>(opts: OptimisticRun<TResult>): Promise<TResult | undefined> {
    const { action, apply, rollback, successMessage, errorMessage } = opts
    isPending.value = true
    apply()
    try {
      const result = await action()
      if (successMessage) showToast({ message: successMessage, variant: 'success' })
      return result
    } catch {
      rollback()
      showToast({
        message: errorMessage ?? 'Something went wrong. Please try again.',
        variant: 'critical',
      })
      return undefined
    } finally {
      isPending.value = false
    }
  }

  return { run, isPending }
}
