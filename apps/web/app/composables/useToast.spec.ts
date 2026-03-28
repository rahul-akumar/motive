import { describe, it, expect, beforeEach } from 'vitest'
import { useToast } from '~/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    // Clear any existing toasts between tests
    const { toasts } = useToast()
    toasts.value.splice(0)
  })

  it('showToast adds a toast to the list', () => {
    const { toasts, showToast } = useToast()
    expect(toasts.value).toHaveLength(0)

    showToast({ message: 'Hello world', variant: 'info' })
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]!.message).toBe('Hello world')
  })

  it('showToast assigns a unique id', () => {
    const { toasts, showToast } = useToast()
    showToast({ message: 'First' })
    showToast({ message: 'Second' })
    const ids = toasts.value.map((t) => t.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('showToast defaults duration to 4000', () => {
    const { toasts, showToast } = useToast()
    showToast({ message: 'Test' })
    expect(toasts.value[0]!.duration).toBe(4000)
  })

  it('showToast respects custom duration', () => {
    const { toasts, showToast } = useToast()
    showToast({ message: 'Test', duration: 8000 })
    expect(toasts.value[0]!.duration).toBe(8000)
  })

  it('dismissToast removes the matching toast', () => {
    const { toasts, showToast, dismissToast } = useToast()
    showToast({ message: 'To dismiss' })
    const id = toasts.value[0]!.id
    dismissToast(id)
    expect(toasts.value.find((t) => t.id === id)).toBeUndefined()
  })

  it('dismissToast is a no-op for unknown id', () => {
    const { toasts, showToast, dismissToast } = useToast()
    showToast({ message: 'Keep me' })
    dismissToast('nonexistent-id')
    expect(toasts.value).toHaveLength(1)
  })
})
