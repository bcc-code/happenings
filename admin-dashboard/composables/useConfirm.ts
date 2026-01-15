import { useConfirm as usePrimeConfirm } from 'primevue/useconfirm'

export interface ConfirmOptions {
  message?: string
  header?: string
  icon?: string
  acceptLabel?: string
  rejectLabel?: string
  acceptClass?: string
  rejectClass?: string
  acceptIcon?: string
  rejectIcon?: string
  group?: string
  blockScroll?: boolean
  dismissableMask?: boolean
}

/**
 * Composable for showing confirmation dialogs
 * 
 * @example
 * ```ts
 * const confirm = useConfirm()
 * 
 * confirm.require({
 *   message: 'Are you sure you want to delete this item?',
 *   header: 'Delete Confirmation',
 *   icon: 'pi pi-exclamation-triangle',
 *   accept: () => {
 *     // Delete action
 *   },
 *   reject: () => {
 *     // Cancel action
 *   },
 * })
 * ```
 */
export function useConfirm() {
  const confirm = usePrimeConfirm()

  const require = (options: ConfirmOptions & {
    accept?: () => void | Promise<void>
    reject?: () => void | Promise<void>
  }) => {
    confirm.require({
      message: options.message || 'Are you sure?',
      header: options.header || 'Confirmation',
      icon: options.icon || 'pi pi-exclamation-triangle',
      acceptLabel: options.acceptLabel || 'Yes',
      rejectLabel: options.rejectLabel || 'No',
      acceptClass: options.acceptClass,
      rejectClass: options.rejectClass,
      acceptIcon: options.acceptIcon,
      rejectIcon: options.rejectIcon,
      group: options.group || 'admin',
      blockScroll: options.blockScroll ?? true,
      dismissableMask: options.dismissableMask ?? false,
      accept: options.accept,
      reject: options.reject,
    })
  }

  const danger = (
    message: string,
    onAccept: () => void | Promise<void>,
    options?: Omit<ConfirmOptions, 'message' | 'acceptClass'>
  ) => {
    require({
      ...options,
      message,
      accept: onAccept,
      acceptClass: 'p-button-danger',
      header: options?.header || 'Confirm Action',
      icon: options?.icon || 'pi pi-exclamation-triangle',
    })
  }

  const deleteConfirm = (
    itemName: string,
    onDelete: () => void | Promise<void>,
    options?: Omit<ConfirmOptions, 'message' | 'acceptClass'>
  ) => {
    danger(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      onDelete,
      {
        ...options,
        header: options?.header || 'Delete Confirmation',
        icon: options?.icon || 'pi pi-trash',
        acceptLabel: options?.acceptLabel || 'Delete',
      }
    )
  }

  return {
    require,
    danger,
    deleteConfirm,
  }
}