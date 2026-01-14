# SearchFilter

Advanced search and filtering component with global search, field-based filtering, and multiple filter types.

## Features

- ✅ Global search with debouncing
- ✅ Field-based filtering
- ✅ Multiple filter types (text, numeric, date, dateRange, boolean, select, multiSelect)
- ✅ Filter operator selection (AND/OR)
- ✅ Active filters display with chips
- ✅ Clear all filters
- ✅ Save view functionality
- ✅ Responsive filter panel

## Basic Usage

```vue
<template>
  <AdminSearchFilter
    :fields="filterFields"
    :filters="filters"
    @update:filters="onFiltersUpdate"
  />
</template>

<script setup lang="ts">
import { AdminSearchFilter } from '~/components/admin'
import type { FilterField } from '~/components/admin/types'

const filterFields: FilterField[] = [
  {
    field: 'name',
    label: 'Name',
    type: 'text',
  },
  {
    field: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
    ],
  },
  {
    field: 'date',
    label: 'Date',
    type: 'dateRange',
  },
]

const filters = ref({})

function onFiltersUpdate(newFilters: Record<string, unknown>) {
  filters.value = newFilters
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `FilterField[]` | `[]` | Filter field definitions |
| `filters` | `Record<string, unknown>` | `{}` | Current filter values |
| `operator` | `'and' \| 'or'` | `'and'` | Filter operator |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:filters` | `Record<string, unknown>` | Emitted when filters change |
