# DataTable

High-performance table component with sorting, filtering, selection, context menus, and group by functionality.

## Features

- ✅ Multi-column sorting (single/multiple mode)
- ✅ Row selection (single/multiple/checkbox/radiobutton)
- ✅ Context menu support
- ✅ Group by functionality for creating different views
- ✅ Column filtering (text, numeric, date, boolean, select)
- ✅ Resizable columns
- ✅ Reorderable columns
- ✅ Virtual scrolling support
- ✅ Export functionality
- ✅ Pagination
- ✅ Loading states
- ✅ Customizable row styling
- ✅ State persistence (session/local storage)

## Installation

```bash
# Components are part of the admin-dashboard package
# Import from the components directory
```

## Basic Usage

```vue
<template>
  <AdminDataTable
    :data="events"
    :columns="columns"
    :loading="loading"
    :selection-mode="'checkbox'"
    @selection-change="onSelectionChange"
  />
</template>

<script setup lang="ts">
import { AdminDataTable } from '~/components/admin'
import type { TableColumn } from '~/components/admin/types'

interface Event {
  id: number
  name: string
  date: string
  status: string
}

const events = ref<Event[]>([
  { id: 1, name: 'Summer Conference', date: '2024-07-15', status: 'published' },
  { id: 2, name: 'Winter Workshop', date: '2024-12-10', status: 'draft' },
])

const columns: TableColumn<Event>[] = [
  {
    field: 'name',
    header: 'Event Name',
    sortable: true,
    filterable: true,
    filterType: 'text',
  },
  {
    field: 'date',
    header: 'Date',
    sortable: true,
    filterable: true,
    filterType: 'date',
    bodyTemplate: (row: Event) => new Date(row.date).toLocaleDateString(),
  },
  {
    field: 'status',
    header: 'Status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
    ],
  },
]

const loading = ref(false)

function onSelectionChange(selected: Event[]) {
  console.log('Selected:', selected)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Array of data to display |
| `columns` | `TableColumn<T>[]` | `[]` | Column definitions |
| `loading` | `boolean` | `false` | Loading state |
| `selection-mode` | `'single' \| 'multiple' \| 'checkbox' \| 'radiobutton'` | `undefined` | Selection mode |
| `context-menu` | `TableContextMenuAction<T>[]` | `[]` | Context menu actions |
| `group-by` | `string` | `undefined` | Field to group by |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `selection-change` | `T[]` | Emitted when selection changes |
| `row-contextmenu` | `{ row: T, event: MouseEvent }` | Emitted on row right-click |
| `sort` | `{ field: string, order: number }` | Emitted when sorting changes |

## Examples

### With Context Menu

```vue
<AdminDataTable
  :data="events"
  :columns="columns"
  :context-menu="contextMenuActions"
  @row-contextmenu="onRowContextMenu"
/>
```

### With Grouping

```vue
<AdminDataTable
  :data="events"
  :columns="columns"
  :group-by="'status'"
/>
```
