import { describe, it, expect, vi } from 'vitest'
import { useAsyncResource } from '~/composables/useAsyncResource'

/** Resolve all pending microtasks. */
const flush = () => new Promise((r) => setTimeout(r, 0))

describe('useAsyncResource', () => {
  it('starts pending then resolves to success', async () => {
    const { status, data } = useAsyncResource(async () => ['a', 'b'])
    expect(status.value).toBe('pending')
    await flush()
    expect(status.value).toBe('success')
    expect(data.value).toEqual(['a', 'b'])
  })

  it('marks empty results via emptyWhen', async () => {
    const { status, isEmpty } = useAsyncResource(async () => [], {
      emptyWhen: (rows: unknown[]) => rows.length === 0,
    })
    await flush()
    expect(status.value).toBe('empty')
    expect(isEmpty.value).toBe(true)
  })

  it('captures errors and exposes retry', async () => {
    let attempts = 0
    const fetcher = vi.fn(async () => {
      attempts++
      if (attempts === 1) throw new Error('boom')
      return 'ok'
    })
    const { status, error, retry, data } = useAsyncResource(fetcher)
    await flush()
    expect(status.value).toBe('error')
    expect((error.value as Error).message).toBe('boom')

    await retry()
    await flush()
    expect(status.value).toBe('success')
    expect(data.value).toBe('ok')
  })

  it('does not auto-run when immediate is false', async () => {
    const fetcher = vi.fn(async () => 1)
    const { status, refresh } = useAsyncResource(fetcher, { immediate: false })
    expect(status.value).toBe('idle')
    expect(fetcher).not.toHaveBeenCalled()
    await refresh()
    await flush()
    expect(status.value).toBe('success')
  })

  it('clears data on refresh by default', async () => {
    const { data, refresh } = useAsyncResource(async () => 'value')
    await flush()
    expect(data.value).toBe('value')
    // data is cleared synchronously when the refresh begins
    const p = refresh()
    expect(data.value).toBeUndefined()
    await p
  })

  it('keeps previous data on refresh when keepPreviousData is set', async () => {
    const { data, refresh } = useAsyncResource(async () => 'value', { keepPreviousData: true })
    await flush()
    expect(data.value).toBe('value')
    const p = refresh()
    expect(data.value).toBe('value')
    await p
  })
})
