import { useToast as usePrimeToast } from 'primevue/usetoast'

export interface ToastOptions {
  summary?: string
  detail?: string
  severity?: 'success' | 'info' | 'warn' | 'error'
  life?: number
  closable?: boolean
  group?: string
  sticky?: boolean
}

export function useToast() {
  const toast = usePrimeToast()

  const show = (message: string, options: ToastOptions = {}) => {
    toast.add({
      summary: options.summary || message,
      detail: options.detail,
      severity: options.severity || 'info',
      life: options.life ?? 3000,
      closable: options.closable ?? true,
      group: options.group || 'app',
      sticky: options.sticky ?? false,
    })
  }

  const success = (
    summary: string,
    detail?: string,
    options?: Omit<ToastOptions, 'summary' | 'detail' | 'severity'>
  ) => {
    show(summary, { ...options, summary, detail, severity: 'success' })
  }

  const error = (
    summary: string,
    detail?: string,
    options?: Omit<ToastOptions, 'summary' | 'detail' | 'severity'>
  ) => {
    show(summary, { ...options, summary, detail, severity: 'error' })
  }

  const warn = (
    summary: string,
    detail?: string,
    options?: Omit<ToastOptions, 'summary' | 'detail' | 'severity'>
  ) => {
    show(summary, { ...options, summary, detail, severity: 'warn' })
  }

  const info = (
    summary: string,
    detail?: string,
    options?: Omit<ToastOptions, 'summary' | 'detail' | 'severity'>
  ) => {
    show(summary, { ...options, summary, detail, severity: 'info' })
  }

  const clear = () => {
    toast.removeAllGroups()
  }

  return {
    show,
    success,
    error,
    warn,
    info,
    clear,
  }
}

