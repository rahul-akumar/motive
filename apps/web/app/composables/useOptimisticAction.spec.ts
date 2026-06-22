import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOptimisticAction } from '~/composables/useOptimisticAction'
import { useToast } from '~/composables/useToast'

const flush = () => new Promise((r) => setTimeout(r, 0))

describe('useOptimisticAction', () => {
  beforeEach(() => {
    // Clear the shared toast singleton between tests.
    useToast().toasts.value.splice(0)
  })

  it('applies optimistically and keeps it on success', async () => {
    const apply = vi.fn()
    const rollback = vi.fn()
    const { run } = useOptimisticAction()

    const result = await run({
      apply,
      rollback,
      action: async () => 'ok',
      successMessage: 'Saved',
    })

    expect(apply).toHaveBeenCalledOnce()
    expect(rollback).not.toHaveBeenCalled()
    expect(result).toBe('ok')

    const { toasts } = useToast()
    expect(toasts.value.at(-1)).toMatchObject({ message: 'Saved', variant: 'success' })
  })

  it('rolls back and shows an error toast on failure', async () => {
    const apply = vi.fn()
    const rollback = vi.fn()
    const { run } = useOptimisticAction()

    const result = await run({
      apply,
      rollback,
      action: async () => {
        throw new Error('network')
      },
      errorMessage: 'Could not save note',
    })

    expect(apply).toHaveBeenCalledOnce()
    expect(rollback).toHaveBeenCalledOnce()
    expect(result).toBeUndefined()

    const { toasts } = useToast()
    expect(toasts.value.at(-1)).toMatchObject({
      message: 'Could not save note',
      variant: 'critical',
    })
  })

  it('tracks pending state across the action', async () => {
    const { run, isPending } = useOptimisticAction()
    let resolve: (v: string) => void = () => {}
    const p = run({
      apply: () => {},
      rollback: () => {},
      action: () => new Promise<string>((r) => (resolve = r)),
    })
    expect(isPending.value).toBe(true)
    resolve('done')
    await p
    await flush()
    expect(isPending.value).toBe(false)
  })
})
