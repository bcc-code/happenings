<template>
  <div class="admin-data-table">
    <DataTable
      :value="data"
      :loading="loading"
      :paginator="paginator"
      :rows="rows"
      :rowsPerPageOptions="rowsPerPageOptions"
      :sortMode="sortMode"
      :selection="selection"
      :selectionMode="selectionMode"
      :filters="filters"
      :globalFilter="globalFilter"
      :exportable="exportable"
      :resizableColumns="resizableColumns"
      :reorderableColumns="reorderableColumns"
      :scrollable="scrollable"
      :scrollHeight="scrollHeight"
      :virtualScrollerOptions="virtualScrollerOptions"
      :rowClass="rowClass"
      :emptyMessage="emptyMessage"
      :groupRowsBy="groupByField"
      :sortField="sortField"
      :sortOrder="sortOrder"
      :multiSortMeta="multiSortMeta"
      :filterDisplay="filterDisplay"
      :showGridlines="showGridlines"
      :stripedRows="stripedRows"
      :dataKey="dataKey"
      :stateStorage="stateStorage"
      :stateKey="stateKey"
      @sort="onSort"
      @selection-change="onSelectionChange"
      @row-contextmenu="onRowContextMenu"
      @row-click="onRowClick"
      @row-dblclick="onRowDblClick"
      @filter="onFilter"
      @page="onPage"
      @column-resize="onColumnResize"
      @column-reorder="onColumnReorder"
      class="p-datatable-sm"
      v-bind="$attrs"
    >
      <!-- Selection column -->
      <Column
        v-if="selectionMode"
        :selectionMode="selectionMode"
        :headerStyle="selectionHeaderStyle"
        :bodyStyle="selectionBodyStyle"
      />

      <!-- Column templates -->
      <Column
        v-for="column in columns"
        :key="String(column.field)"
        :field="String(column.field)"
        :header="column.header"
        :sortable="column.sortable !== false"
        :filterable="column.filterable !== false"
        :filterField="String(column.field)"
        :filterMatchMode="getFilterMatchMode(column)"
        :filterElement="getFilterElement(column)"
        :showFilterMenu="column.filterable !== false"
        :width="column.width"
        :minWidth="column.minWidth"
        :maxWidth="column.maxWidth"
        :align="column.align"
        :frozen="column.frozen"
        :exportable="column.exportable !== false"
      >
        <!-- Custom body template -->
        <template v-if="column.bodyTemplate" #body="{ data }">
          <component :is="() => column.bodyTemplate!(data)" />
        </template>
        <!-- Custom header template -->
        <template v-if="column.headerTemplate" #header>
          <component :is="column.headerTemplate" />
        </template>
      </Column>

      <!-- Empty message -->
      <template #empty>
        <div class="p-datatable-emptymessage">
          {{ emptyMessage || 'No records found' }}
        </div>
      </template>

      <!-- Loading overlay -->
      <template #loading>
        <div class="p-datatable-loading">
          <ProgressSpinner />
        </div>
      </template>
    </DataTable>

    <!-- Context menu (global) -->
    <ContextMenu
      v-if="contextMenu && contextMenu.length > 0"
      ref="contextMenuRef"
      :model="contextMenuItems"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import Column from 'primevue/column'
import ContextMenu from 'primevue/contextmenu'
import DataTable from 'primevue/datatable'
import ProgressSpinner from 'primevue/progressspinner'
import { computed, ref } from 'vue'
import type {
  TableColumn,
  TableFilterMeta,
  TableGroupMeta,
  TableProps,
  TableRowEvent,
  TableSelectionChangeEvent,
  TableSortMeta
} from './types'

interface Props extends Omit<TableProps<T>, 'value' | 'columns'> {
  data: T[]
  columns: TableColumn<T>[]
  // Additional props
  dataKey?: string
  stateStorage?: 'session' | 'local' | 'custom'
  stateKey?: string
  filterDisplay?: 'row' | 'menu' | 'subheader'
  showGridlines?: boolean
  stripedRows?: boolean
  // Group by
  groupBy?: string | TableGroupMeta[]
  // Sort
  sortField?: string
  sortOrder?: 1 | -1 | 0
  multiSortMeta?: TableSortMeta[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  paginator: true,
  rows: 25,
  rowsPerPageOptions: () => [10, 25, 50, 100],
  sortMode: 'multiple',
  selectionMode: null,
  exportable: false,
  resizableColumns: true,
  reorderableColumns: false,
  scrollable: false,
  filterDisplay: 'menu',
  showGridlines: false,
  stripedRows: true,
  dataKey: 'id',
  stateStorage: 'session',
  emptyMessage: 'No records found',
})

const emit = defineEmits<{
  'sort': [event: { sortField: string; sortOrder: 1 | -1 | 0; multiSortMeta: TableSortMeta[] }]
  'selection-change': [event: TableSelectionChangeEvent<T>]
  'row-contextmenu': [event: TableRowEvent<T>]
  'row-click': [event: TableRowEvent<T>]
  'row-dblclick': [event: TableRowEvent<T>]
  'filter': [event: { filters: TableFilterMeta }]
  'page': [event: { page: number; rows: number; pageCount: number }]
  'column-resize': [event: any]
  'column-reorder': [event: any]
}>()

const selection = ref<T[]>([])
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const contextMenuItems = ref<any[]>([])
const contextMenuData = ref<T | null>(null)

// Get filter match mode for column
const getFilterMatchMode = (column: TableColumn<T>): string => {
  if (column.filterType === 'numeric') return 'equals'
  if (column.filterType === 'date') return 'dateIs'
  if (column.filterType === 'boolean') return 'equals'
  if (column.filterType === 'select') return 'equals'
  return 'contains'
}

// Get filter element for column (PrimeVue 3 uses filterElement prop)
const getFilterElement = (column: TableColumn<T>) => {
  // Return undefined to use default filter element
  // Custom filter elements can be implemented via slots if needed
  return undefined
}

// Group by field
const groupByField = computed(() => {
  if (!props.groupBy) return undefined
  if (typeof props.groupBy === 'string') return props.groupBy
  if (Array.isArray(props.groupBy) && props.groupBy.length > 0) {
    return props.groupBy[0].field
  }
  return undefined
})

// Selection styles
const selectionHeaderStyle = computed(() => ({
  width: props.selectionMode === 'checkbox' ? '3rem' : '2rem',
}))

const selectionBodyStyle = computed(() => ({
  width: props.selectionMode === 'checkbox' ? '3rem' : '2rem',
}))

// Event handlers
const onSort = (event: any) => {
  emit('sort', {
    sortField: event.sortField,
    sortOrder: event.sortOrder,
    multiSortMeta: event.multiSortMeta || [],
  })
}

const onSelectionChange = (event: any) => {
  selection.value = event.data
  emit('selection-change', {
    selection: event.data,
    originalEvent: event.originalEvent,
  })
}

const onRowContextMenu = (event: any) => {
  if (props.contextMenu && props.contextMenu.length > 0 && contextMenuRef.value) {
    contextMenuData.value = event.data
    contextMenuItems.value = getContextMenuItems(event.data)
    contextMenuRef.value.show(event.originalEvent)
  }
  emit('row-contextmenu', {
    data: event.data,
    index: event.index,
    originalEvent: event.originalEvent,
  })
}

const onRowClick = (event: any) => {
  emit('row-click', {
    data: event.data,
    index: event.index,
    originalEvent: event.originalEvent,
  })
}

const onRowDblClick = (event: any) => {
  emit('row-dblclick', {
    data: event.data,
    index: event.index,
    originalEvent: event.originalEvent,
  })
}

const onFilter = (event: any) => {
  emit('filter', {
    filters: event.filters,
  })
}

const onPage = (event: any) => {
  emit('page', {
    page: event.page,
    rows: event.rows,
    pageCount: event.pageCount,
  })
}

const onColumnResize = (event: any) => {
  emit('column-resize', event)
}

const onColumnReorder = (event: any) => {
  emit('column-reorder', event)
}

// Context menu items
const getContextMenuItems = (rowData: T): any[] => {
  if (!props.contextMenu) return []
  
  return props.contextMenu
    .filter(action => {
      if (action.visible !== undefined && !action.visible(rowData)) {
        return false
      }
      return true
    })
    .map(action => ({
      label: action.label,
      icon: action.icon,
      command: () => {
        if (action.disabled && action.disabled(rowData)) return
        action.command(rowData)
      },
      disabled: action.disabled ? action.disabled(rowData) : false,
      separator: action.separator,
    }))
}

// Expose selection for parent components
defineExpose({
  selection,
  clearSelection: () => {
    selection.value = []
  },
  getSelection: () => selection.value,
})
</script>

<style scoped lang="css">
.admin-data-table {
  width: 100%;
}

:deep(.p-datatable) {
  font-size: 0.875rem;
}

:deep(.p-datatable-header) {
  padding: 1rem;
  background: var(--surface-50, #fafafa);
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--surface-100, #f5f5f5);
  color: var(--text-color, #212529);
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 2px solid var(--surface-200, #e0e0e0);
}

:deep(.p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--surface-50, #fafafa);
  cursor: pointer;
}

:deep(.p-datatable-tbody > tr.p-highlight) {
  background: var(--primary-50, #e3f2fd);
  color: var(--primary-700, #1976d2);
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem;
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
}

:deep(.p-datatable-emptymessage) {
  padding: 2rem;
  text-align: center;
  color: var(--text-color-secondary, #6c757d);
}

:deep(.p-datatable-loading) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

:deep(.p-datatable-footer) {
  padding: 0.75rem 1rem;
  background: var(--surface-50, #fafafa);
  border-top: 1px solid var(--surface-200, #e0e0e0);
}

/* Group rows styling */
:deep(.p-datatable-tbody > tr.p-rowgroup-header) {
  background: var(--surface-100, #f5f5f5);
  font-weight: 600;
}

:deep(.p-rowgroup-header > td) {
  padding: 0.5rem 0.75rem;
}
</style>
