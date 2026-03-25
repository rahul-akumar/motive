import type { MToastVariant } from '@motive/ui'

interface ToastOptions {
  message: string
  subtext?: string
  variant?: MToastVariant
  duration?: number
  actionLabel?: string
  onAction?: () => void
}

interface ToastItem extends ToastOptions {
  id: string
}

// Module-level singleton — shared state across all composable calls
const toasts = ref<ToastItem[]>([])

export function useToast() {
  function showToast(opts: ToastOptions) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const duration = opts.duration ?? 4000

    toasts.value.push({ ...opts, id })

    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration)
    }
  }

  function dismissToast(id: string) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  return { toasts, showToast, dismissToast }
}
