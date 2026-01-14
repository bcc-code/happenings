# Admin UI Components

Reusable, highly functional components for the BCC Events Admin Dashboard.

## Components

### DataTable

High-performance table component with sorting, filtering, selection, context menus, and group by functionality.

#### Features

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

#### Usage

```vue
<template>
  <AdminDataTable
    :data="events"
    :columns="columns"
    :loading="loading"
    :selection-mode="'checkbox'"
    :context-menu="contextMenuActions"
    :group-by="'status'"
    @selection-change="onSelectionChange"
    @row-contextmenu="onRowContextMenu"
    @sort="onSort"
  />
</template>

<script setup lang="ts">
import { AdminDataTable } from '~/components/admin'
import type { TableColumn, TableContextMenuAction } from '~/components/admin/types'

interface Event {
  id: number
  name: string
  date: string
  status: string
}

const events = ref<Event[]>([...])

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

const contextMenuActions: TableContextMenuAction<Event>[] = [
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: (row) => editEvent(row),
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: (row) => deleteEvent(row),
    disabled: (row) => row.status === 'published',
  },
]

const onSelectionChange = (event: any) => {
  console.log('Selected:', event.selection)
}

const onRowContextMenu = (event: any) => {
  console.log('Context menu:', event.data)
}

const onSort = (event: any) => {
  console.log('Sort:', event)
}
</script>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | required | Array of data to display |
| `columns` | `TableColumn<T>[]` | required | Column definitions |
| `loading` | `boolean` | `false` | Show loading state |
| `paginator` | `boolean` | `true` | Enable pagination |
| `rows` | `number` | `25` | Rows per page |
| `selectionMode` | `'single' \| 'multiple' \| 'checkbox' \| 'radiobutton' \| null` | `null` | Selection mode |
| `contextMenu` | `TableContextMenuAction<T>[]` | `undefined` | Context menu actions |
| `groupBy` | `string \| TableGroupMeta[]` | `undefined` | Group by field(s) |
| `filters` | `TableFilterMeta` | `undefined` | Initial filters |
| `globalFilter` | `string` | `undefined` | Global search filter |
| `sortField` | `string` | `undefined` | Initial sort field |
| `sortOrder` | `1 \| -1 \| 0` | `undefined` | Initial sort order |
| `dataKey` | `string` | `'id'` | Unique key field |
| `stateStorage` | `'session' \| 'local' \| 'custom'` | `'session'` | State storage type |

#### Events

- `@sort` - Emitted when sorting changes
- `@selection-change` - Emitted when selection changes
- `@row-contextmenu` - Emitted on right-click
- `@row-click` - Emitted on row click
- `@row-dblclick` - Emitted on row double-click
- `@filter` - Emitted when filters change
- `@page` - Emitted when page changes

### SearchFilter

Advanced search and filtering component with field-based filtering.

#### Features

- ✅ Global search with debouncing
- ✅ Field-based filtering
- ✅ Multiple filter types (text, numeric, date, dateRange, boolean, select, multiSelect)
- ✅ Filter operator selection (AND/OR)
- ✅ Active filters display with chips
- ✅ Clear all filters
- ✅ Save view functionality
- ✅ Responsive filter panel

#### Usage

```vue
<template>
  <AdminSearchFilter
    :fields="filterFields"
    global-search-placeholder="Search events..."
    :show-advanced-filters="true"
    :show-active-filters="true"
    @search="onSearch"
    @filter-change="onFilterChange"
    @clear="onClearFilters"
  />
</template>

<script setup lang="ts">
import { AdminSearchFilter } from '~/components/admin'
import type { SearchFilterField } from '~/components/admin/types'

const filterFields: SearchFilterField[] = [
  {
    field: 'name',
    label: 'Event Name',
    type: 'text',
    placeholder: 'Search by name...',
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
    label: 'Event Date',
    type: 'dateRange',
  },
  {
    field: 'registrations',
    label: 'Min Registrations',
    type: 'numeric',
    min: 0,
  },
]

const onSearch = (value: string) => {
  console.log('Search:', value)
}

const onFilterChange = (filters: Record<string, any>) => {
  console.log('Filters:', filters)
}

const onClearFilters = () => {
  console.log('Filters cleared')
}
</script>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `SearchFilterField[]` | required | Filter field definitions |
| `globalSearchPlaceholder` | `string` | `'Search...'` | Placeholder for global search |
| `showAdvancedFilters` | `boolean` | `true` | Show advanced filters panel |
| `showActiveFilters` | `boolean` | `true` | Show active filters chips |
| `saveViewEnabled` | `boolean` | `false` | Enable save view functionality |
| `debounceMs` | `number` | `300` | Debounce delay for search |

#### Events

- `@search` - Emitted when global search value changes (debounced)
- `@filter-change` - Emitted when any filter changes
- `@clear` - Emitted when all filters are cleared
- `@save-view` - Emitted when save view is clicked

### Modal

Reusable modal/dialog component with multiple sizes, loading states, and customizable footer.

#### Features

- ✅ Multiple sizes (small, medium, large, fullscreen)
- ✅ Loading states with spinner
- ✅ Customizable header and footer
- ✅ Keyboard shortcuts (ESC to close)
- ✅ Dismissable mask (click outside to close)
- ✅ Draggable and resizable options
- ✅ Position options
- ✅ Customizable confirm/cancel buttons

#### Usage

```vue
<template>
  <AdminModal
    v-model="showModal"
    title="Edit Event"
    size="large"
    :loading="saving"
    loading-message="Saving changes..."
    @confirm="onSave"
    @cancel="onCancel"
  >
    <p>Modal content goes here</p>
  </AdminModal>
</template>

<script setup lang="ts">
import { AdminModal } from '~/components/admin'

const showModal = ref(false)
const saving = ref(false)

const onSave = () => {
  saving.value = true
  // Save logic
  setTimeout(() => {
    saving.value = false
    showModal.value = false
  }, 1000)
}

const onCancel = () => {
  showModal.value = false
}
</script>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | required | Controls modal visibility |
| `title` | `string` | `undefined` | Modal title |
| `size` | `'small' \| 'medium' \| 'large' \| 'fullscreen'` | `'medium'` | Modal size |
| `closable` | `boolean` | `true` | Show close button |
| `dismissableMask` | `boolean` | `true` | Close on backdrop click |
| `draggable` | `boolean` | `false` | Make modal draggable |
| `resizable` | `boolean` | `false` | Make modal resizable |
| `position` | `string` | `'center'` | Modal position |
| `loading` | `boolean` | `false` | Show loading state |
| `loadingMessage` | `string` | `undefined` | Loading message |
| `showFooter` | `boolean` | `true` | Show footer |
| `showCancel` | `boolean` | `true` | Show cancel button |
| `showConfirm` | `boolean` | `true` | Show confirm button |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button label |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button label |
| `confirmSeverity` | `string` | `'primary'` | Confirm button severity |
| `confirmLoading` | `boolean` | `false` | Confirm button loading state |
| `confirmDisabled` | `boolean` | `false` | Disable confirm button |

#### Events

- `@update:modelValue` - Emitted when visibility changes
- `@hide` - Emitted when modal is hidden
- `@confirm` - Emitted when confirm button is clicked
- `@cancel` - Emitted when cancel button is clicked

#### Slots

- `default` - Modal content
- `header` - Custom header content
- `header-actions` - Actions in header
- `footer` - Custom footer content

### Toast

Toast notification component for displaying success, error, warning, and info messages.

#### Features

- ✅ Multiple types (success, error, warning, info)
- ✅ Auto-dismiss with configurable timeout
- ✅ Manual dismiss
- ✅ Stacking multiple notifications
- ✅ Position options (top-right, top-left, bottom-right, bottom-left, etc.)
- ✅ Customizable messages with summary and detail

#### Usage

First, add the Toast component to your app layout:

```vue
<template>
  <div>
    <!-- Your app content -->
    <AdminToast />
  </div>
</template>

<script setup lang="ts">
import { AdminToast } from '~/components/admin'
</script>
```

Then use the `useToast` composable:

```vue
<template>
  <Button label="Show Toast" @click="showSuccess" />
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const toast = useToast()

const showSuccess = () => {
  toast.success('Operation completed', 'The event was created successfully')
  // Or
  toast.error('Error occurred', 'Failed to save changes')
  // Or
  toast.warn('Warning', 'Please review your changes')
  // Or
  toast.info('Information', 'Your changes have been saved')
}
</script>
```

#### Composable API

```typescript
const toast = useToast()

// Show with options
toast.show('Message', {
  summary: 'Summary',
  detail: 'Detail text',
  severity: 'success',
  life: 5000,
  closable: true,
})

// Convenience methods
toast.success(summary: string, detail?: string, options?: ToastOptions)
toast.error(summary: string, detail?: string, options?: ToastOptions)
toast.warn(summary: string, detail?: string, options?: ToastOptions)
toast.info(summary: string, detail?: string, options?: ToastOptions)

// Clear all toasts
toast.clear()
```

### ConfirmDialog

Confirmation dialog component for confirming actions, especially dangerous operations.

#### Features

- ✅ Customizable message and header
- ✅ Icon support
- ✅ Primary and secondary actions
- ✅ Dangerous action highlighting
- ✅ Keyboard shortcuts (ESC to close)

#### Usage

First, add the ConfirmDialog component to your app layout:

```vue
<template>
  <div>
    <!-- Your app content -->
    <AdminConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { AdminConfirmDialog } from '~/components/admin'
</script>
```

Then use the `useConfirm` composable:

```vue
<template>
  <Button label="Delete" severity="danger" @click="confirmDelete" />
</template>

<script setup lang="ts">
import { useConfirm } from '~/composables/useConfirm'

const confirm = useConfirm()

const confirmDelete = () => {
  confirm.deleteConfirm(
    'Summer Conference 2024',
    () => {
      // Delete action
      console.log('Deleted!')
    }
  )
  
  // Or use danger for custom messages
  confirm.danger(
    'Are you sure you want to perform this action?',
    () => {
      // Action
    }
  )
  
  // Or use require for full control
  confirm.require({
    message: 'Are you sure?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      // Accept action
    },
    reject: () => {
      // Reject action
    },
  })
}
</script>
```

#### Composable API

```typescript
const confirm = useConfirm()

// Delete confirmation (with danger styling)
confirm.deleteConfirm(
  itemName: string,
  onDelete: () => void | Promise<void>,
  options?: ConfirmOptions
)

// Danger action confirmation
confirm.danger(
  message: string,
  onAccept: () => void | Promise<void>,
  options?: ConfirmOptions
)

// Full control
confirm.require({
  message?: string
  header?: string
  icon?: string
  acceptLabel?: string
  rejectLabel?: string
  acceptClass?: string
  rejectClass?: string
  accept?: () => void | Promise<void>
  reject?: () => void | Promise<void>
  // ... other options
})
```

### ModuleContainer

Layout container component for creating consistent module pages with header, main content, and optional sidebar.

#### Features

- ✅ Header slot with reusable ModuleHeader component
- ✅ Main content slot
- ✅ Optional sidebar slot (left or right position)
- ✅ Responsive layout (sidebar collapses on mobile)
- ✅ Collapsible sidebar
- ✅ Sticky header option
- ✅ Breadcrumbs support
- ✅ Back button support
- ✅ Action buttons and menu support

#### Usage

**Basic usage with default header:**

```vue
<template>
  <AdminModuleContainer
    :use-default-header="true"
    header-title="Events Management"
    header-subtitle="Manage all your events"
    :header-show-back="true"
    @header-back="goBack"
  >
    <!-- Main content -->
    <div>
      <p>Your module content goes here</p>
    </div>
  </AdminModuleContainer>
</template>

<script setup lang="ts">
import { AdminModuleContainer } from '~/components/admin'

const goBack = () => {
  navigateTo('/events')
}
</script>
```

**With custom header slot:**

```vue
<template>
  <AdminModuleContainer>
    <template #header>
      <AdminModuleHeader
        title="Custom Header"
        :show-back="true"
        @back="goBack"
      >
        <template #actions>
          <Button label="New Event" icon="pi pi-plus" @click="createEvent" />
          <Button label="Export" icon="pi pi-download" severity="secondary" />
        </template>
      </AdminModuleHeader>
    </template>

    <!-- Main content -->
    <div>
      <p>Your module content</p>
    </div>
  </AdminModuleContainer>
</template>
```

**With sidebar:**

```vue
<template>
  <AdminModuleContainer
    :sidebar-visible="true"
    sidebar-title="Filters"
    sidebar-position="right"
    :sidebar-width="'320px'"
  >
    <template #header>
      <AdminModuleHeader title="Events" />
    </template>

    <!-- Main content -->
    <div>
      <AdminDataTable :data="events" :columns="columns" />
    </div>

    <!-- Sidebar content -->
    <template #sidebar>
      <AdminSearchFilter :fields="filterFields" @filter-change="onFilterChange" />
    </template>
  </AdminModuleContainer>
</template>
```

**With breadcrumbs:**

```vue
<template>
  <AdminModuleContainer
    :use-default-header="true"
    header-title="Edit Event"
    :header-breadcrumbs="breadcrumbs"
  >
    <FormBuilder :schema="eventSchema" :model-value="eventData" />
  </AdminModuleContainer>
</template>

<script setup lang="ts">
import { AdminModuleContainer } from '~/components/admin'
import type { BreadcrumbItem } from '~/components/admin/types'

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Events', to: '/events' },
  { label: 'Edit Event' },
]
</script>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `useDefaultHeader` | `boolean` | `false` | Use default ModuleHeader component |
| `headerTitle` | `string` | `undefined` | Header title (when using default header) |
| `headerSubtitle` | `string` | `undefined` | Header subtitle |
| `headerShowBack` | `boolean` | `false` | Show back button |
| `headerBackLabel` | `string` | `undefined` | Back button label |
| `headerBreadcrumbs` | `BreadcrumbItem[]` | `undefined` | Breadcrumb items |
| `headerMenuItems` | `MenuItem[]` | `undefined` | Menu items for default menu |
| `headerMenuLabel` | `string` | `'More'` | Menu button label |
| `headerMenuIcon` | `string` | `'pi pi-ellipsis-v'` | Menu button icon |
| `headerSticky` | `boolean` | `false` | Make header sticky |
| `sidebarVisible` | `boolean` | `false` | Show sidebar |
| `sidebarWidth` | `string` | `'300px'` | Sidebar width |
| `sidebarCollapsible` | `boolean` | `false` | Make sidebar collapsible |
| `sidebarCollapsed` | `boolean` | `false` | Sidebar collapsed state |
| `sidebarTitle` | `string` | `undefined` | Sidebar title |
| `sidebarPosition` | `'left' \| 'right'` | `'right'` | Sidebar position |
| `maxWidth` | `string` | `undefined` | Max container width |
| `padding` | `boolean` | `true` | Add padding to main content |

#### Slots

- `default` - Main content
- `header` - Custom header (overrides default header)
- `header-title-icon` - Icon next to title (when using default header)
- `header-actions` - Action buttons in header
- `header-menu` - Custom menu in header
- `sidebar` - Sidebar content
- `sidebar-content` - Sidebar content (when using default sidebar)

#### Events

- `@header-back` - Emitted when back button is clicked
- `@header-menu-click` - Emitted when menu button is clicked
- `@sidebar-toggle` - Emitted when sidebar is toggled

### ModuleHeader

Reusable header component for module pages with title, actions, menu, and breadcrumbs.

#### Features

- ✅ Title and subtitle
- ✅ Back button
- ✅ Breadcrumbs
- ✅ Action buttons slot
- ✅ Menu slot or default menu
- ✅ Sticky positioning
- ✅ Responsive design

#### Usage

**Standalone usage:**

```vue
<template>
  <AdminModuleHeader
    title="Events Management"
    subtitle="Manage all your events"
    :show-back="true"
    :breadcrumbs="breadcrumbs"
    @back="goBack"
  >
    <template #actions>
      <Button label="New Event" icon="pi pi-plus" @click="createEvent" />
      <Button label="Export" icon="pi pi-download" severity="secondary" />
    </template>

    <template #menu>
      <Menu :model="menuItems" />
    </template>
  </AdminModuleHeader>
</template>

<script setup lang="ts">
import { AdminModuleHeader } from '~/components/admin'
import type { BreadcrumbItem } from '~/components/admin/types'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Events' },
]

const menuItems = [
  { label: 'Settings', icon: 'pi pi-cog', command: () => {} },
  { label: 'Help', icon: 'pi pi-question-circle', command: () => {} },
]
</script>
```

**With default menu items:**

```vue
<template>
  <AdminModuleHeader
    title="Events"
    :menu-items="menuItems"
    menu-label="More Actions"
    menu-icon="pi pi-ellipsis-v"
  />
</template>

<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem'

const menuItems: MenuItem[] = [
  { label: 'Export', icon: 'pi pi-download', command: () => exportData() },
  { label: 'Settings', icon: 'pi pi-cog', command: () => openSettings() },
]
</script>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | Header title |
| `subtitle` | `string` | `undefined` | Header subtitle |
| `showBack` | `boolean` | `false` | Show back button |
| `backLabel` | `string` | `undefined` | Back button label |
| `breadcrumbs` | `BreadcrumbItem[]` | `undefined` | Breadcrumb items |
| `menuItems` | `MenuItem[]` | `undefined` | Menu items for default menu |
| `menuLabel` | `string` | `'More'` | Menu button label |
| `menuIcon` | `string` | `'pi pi-ellipsis-v'` | Menu button icon |
| `sticky` | `boolean` | `false` | Make header sticky |

#### Slots

- `title-icon` - Icon next to title
- `actions` - Action buttons
- `menu` - Custom menu

#### Events

- `@back` - Emitted when back button is clicked
- `@menu-click` - Emitted when menu button is clicked

## Types

All types are exported from `~/components/admin/types`:

- `TableColumn<T>` - Column definition
- `TableSortMeta` - Sort metadata
- `TableFilterMeta` - Filter metadata
- `TableGroupMeta` - Group by metadata
- `TableContextMenuAction<T>` - Context menu action
- `SearchFilterField` - Filter field definition
- `SearchFilterValue` - Filter value
- `ModalProps` - Modal component props
- `ToastOptions` - Toast notification options
- `ConfirmOptions` - Confirmation dialog options
- `BreadcrumbItem` - Breadcrumb item definition

## Styling

All components use design tokens from `@bcc-code/design-tokens` for consistent styling. Colors, spacing, and typography are all defined through design tokens.

## Examples

See `pages/components-demo.vue` for complete usage examples.

## Best Practices

1. **Performance**: Use virtual scrolling for large datasets (>1000 rows)
2. **State Management**: Use `stateStorage` prop to persist table state
3. **Filtering**: Combine global search with field filters for best UX
4. **Context Menus**: Keep context menu actions relevant and concise
5. **Selection**: Use checkbox mode for bulk operations
6. **Grouping**: Use group by for creating different views of the same data

## Future Enhancements

- [ ] Export to CSV/Excel
- [ ] Column visibility toggle
- [ ] Saved views management
- [ ] Advanced filtering with custom operators
- [ ] Inline editing
- [ ] Drag and drop row reordering
