import type { Ref, ComputedRef } from 'vue'
import type { AsyncStatus } from '@motive/ui'

export interface UseAsyncResourceOptions<T> {
  /** Run the fetcher immediately on creation. @default true */
  immediate?: boolean
  /** Predicate marking a successful-but-empty result so consumers can show an empty state. */
  emptyWhen?: (data: T) => boolean
  /**
   * Keep the previously resolved data visible during a refresh instead of clearing it.
   * Opt-in — leave off where a deliberate loading window should show (e.g. region switch).
   * @default false
   */
  keepPreviousData?: boolean
}

export interface AsyncResource<T> {
  data: Ref<T | undefined>
  status: Ref<AsyncStatus>
  error: Ref<unknown>
  isPending: ComputedRef<boolean>
  isEmpty: ComputedRef<boolean>
  /** Re-run the fetcher. */
  refresh: () => Promise<void>
  /** Alias for refresh, semantically clearer from an error state. */
  retry: () => Promise<void>
}

/**
 * Standard async-resource contract for the app: one source of truth for the
 * pending / success / empty / error lifecycle, with retry. Pair with the
 * <AsyncBoundary> component to render each state consistently.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncResourceOptions<T> = {},
): AsyncResource<T> {
  const { immediate = true, emptyWhen, keepPreviousData = false } = options

  const data = ref<T>() as Ref<T | undefined>
  const status = ref<AsyncStatus>('idle')
  const error = ref<unknown>(null)

  // Guards against a slow earlier request resolving after a newer one.
  let requestId = 0

  async function refresh(): Promise<void> {
    const id = ++requestId
    error.value = null
    if (!keepPreviousData) data.value = undefined
    status.value = 'pending'
    try {
      const result = await fetcher()
      if (id !== requestId) return // superseded by a newer call
      data.value = result
      status.value = emptyWhen?.(result) ? 'empty' : 'success'
    } catch (err) {
      if (id !== requestId) return
      error.value = err
      status.value = 'error'
    }
  }

  const isPending = computed(() => status.value === 'pending' || status.value === 'idle')
  const isEmpty = computed(() => status.value === 'empty')

  if (immediate) void refresh()

  return { data, status, error, isPending, isEmpty, refresh, retry: refresh }
}
