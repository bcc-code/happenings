/**
 * Types for admin UI components
 */

export interface TableColumn<T = any> {
  field: keyof T | string
  header: string
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'numeric' | 'date' | 'boolean' | 'select'
  filterOptions?: Array<{ label: string; value: any }>
  width?: string
  minWidth?: string
  maxWidth?: string
  align?: 'left' | 'center' | 'right'
  bodyTemplate?: (rowData: T) => string | any
  headerTemplate?: () => string | any
  frozen?: boolean
  exportable?: boolean
}

export interface TableSortMeta {
  field: string
  order: 1 | -1 | 0
}

export interface TableFilterMeta {
  [key: string]: {
    value: any
    matchMode?: 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'lt' | 'lte' | 'gt' | 'gte' | 'between' | 'in' | 'custom'
    operator?: 'and' | 'or'
  }
}

export interface TableGroupMeta {
  field: string
  order: 1 | -1
}

export interface TableContextMenuAction<T = any> {
  label: string
  icon?: string
  command: (rowData: T) => void | Promise<void>
  disabled?: (rowData: T) => boolean
  visible?: (rowData: T) => boolean
  separator?: boolean
}

export interface TableSelectionChangeEvent<T = any> {
  selection: T[]
  originalEvent: Event
}

export interface TableRowEvent<T = any> {
  data: T
  index: number
  originalEvent: Event
}

export interface SearchFilterField {
  field: string
  label: string
  type: 'text' | 'numeric' | 'date' | 'dateRange' | 'boolean' | 'select' | 'multiSelect'
  options?: Array<{ label: string; value: any }>
  placeholder?: string
  min?: number
  max?: number
}

export interface SearchFilterValue {
  field: string
  value: any
  operator?: 'and' | 'or'
  matchMode?: 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'lt' | 'lte' | 'gt' | 'gte' | 'between' | 'in'
}

export interface TableProps<T = any> {
  value: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  paginator?: boolean
  rows?: number
  rowsPerPageOptions?: number[]
  sortMode?: 'single' | 'multiple'
  selectionMode?: 'single' | 'multiple' | 'checkbox' | 'radiobutton' | null
  contextMenu?: TableContextMenuAction<T>[]
  groupBy?: TableGroupMeta[]
  filters?: TableFilterMeta
  globalFilter?: string
  exportable?: boolean
  resizableColumns?: boolean
  reorderableColumns?: boolean
  scrollable?: boolean
  scrollHeight?: string
  virtualScrollerOptions?: {
    itemSize?: number
    showLoader?: boolean
    loading?: boolean
  }
  rowClass?: (data: T) => string | string[] | Record<string, boolean>
  emptyMessage?: string
}

export interface ModalProps {
  modelValue: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  closable?: boolean
  dismissableMask?: boolean
  draggable?: boolean
  resizable?: boolean
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'
  loading?: boolean
  loadingMessage?: string
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelLabel?: string
  confirmLabel?: string
  confirmSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'
  confirmLoading?: boolean
  confirmDisabled?: boolean
}

export interface ToastOptions {
  summary?: string
  detail?: string
  severity?: 'success' | 'info' | 'warn' | 'error'
  life?: number
  closable?: boolean
  group?: string
  sticky?: boolean
}

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
  accept?: () => void | Promise<void>
  reject?: () => void | Promise<void>
}

export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
  command?: () => void
}
