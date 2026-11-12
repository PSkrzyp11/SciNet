import { ref } from 'vue'

export type ToastVariant = 'success' | 'info' | 'error'

export interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

const toasts = ref<ToastItem[]>([])
let nextId = 1

export function useToast() {
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }

  function notify(
    title: string,
    options: { description?: string; variant?: ToastVariant; duration?: number } = {},
  ) {
    const id = nextId++
    const variant = options.variant ?? 'success'
    const duration = options.duration ?? 3600

    toasts.value = [...toasts.value, { id, title, description: options.description, variant }]

    if (duration > 0 && typeof window !== 'undefined') {
      window.setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }

  return {
    toasts,
    notify,
    dismiss,
  }
}
