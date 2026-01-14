<template>
  <div class="components-demo">
    <div class="demo-header">
      <h1>Admin Components Demo</h1>
      <p>Examples of reusable admin UI components</p>
    </div>

    <!-- Search Filter Demo -->
    <div class="demo-section">
      <h2>Search & Filter Component</h2>
      <SearchFilter
        :fields="searchFields"
        global-search-placeholder="Search events..."
        :show-advanced-filters="true"
        :show-active-filters="true"
        @search="onSearch"
        @filter-change="onFilterChange"
        @clear="onClearFilters"
      />
    </div>

    <!-- DataTable Demo -->
    <div class="demo-section">
      <h2>DataTable Component</h2>
      <DataTable
        :data="tableData"
        :columns="tableColumns"
        :loading="tableLoading"
        :selection-mode="'checkbox'"
        :context-menu="contextMenuActions"
        :group-by="groupByField"
        :paginator="true"
        :rows="10"
        @selection-change="onSelectionChange"
        @row-contextmenu="onRowContextMenu"
        @sort="onTableSort"
      />
    </div>

    <!-- Selection Info -->
    <div v-if="selectedItems.length > 0" class="selection-info">
      <p>Selected {{ selectedItems.length }} item(s)</p>
      <Button label="Clear Selection" @click="clearSelection" />
    </div>

    <!-- Modal Demo -->
    <div class="demo-section">
      <h2>Modal Component</h2>
      <div class="demo-buttons">
        <Button label="Open Small Modal" @click="openModal('small')" />
        <Button label="Open Medium Modal" @click="openModal('medium')" />
        <Button label="Open Large Modal" @click="openModal('large')" />
        <Button label="Open Fullscreen Modal" @click="openModal('fullscreen')" />
        <Button label="Open Loading Modal" @click="openLoadingModal" />
      </div>
    </div>

    <!-- Toast Demo -->
    <div class="demo-section">
      <h2>Toast Notifications</h2>
      <div class="demo-buttons">
        <Button label="Success Toast" severity="success" @click="showSuccessToast" />
        <Button label="Error Toast" severity="danger" @click="showErrorToast" />
        <Button label="Warning Toast" severity="warning" @click="showWarningToast" />
        <Button label="Info Toast" severity="info" @click="showInfoToast" />
      </div>
    </div>

    <!-- Confirm Dialog Demo -->
    <div class="demo-section">
      <h2>Confirm Dialog</h2>
      <div class="demo-buttons">
        <Button label="Delete Confirmation" severity="danger" @click="showDeleteConfirm" />
        <Button label="Danger Action" severity="warning" @click="showDangerConfirm" />
        <Button label="Custom Confirmation" @click="showCustomConfirm" />
      </div>
    </div>

    <!-- Modal Component -->
    <Modal
      v-model="modalVisible"
      :title="modalTitle"
      :size="modalSize"
      :loading="modalLoading"
      loading-message="Saving changes..."
      @confirm="onModalConfirm"
      @cancel="onModalCancel"
    >
      <p>This is a {{ modalSize }} modal. You can put any content here.</p>
      <p v-if="modalSize === 'fullscreen'">Fullscreen modals are great for complex forms or detailed views.</p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DataTable, SearchFilter, Modal } from '~/components/widgets'
import type { TableColumn, TableContextMenuAction, SearchFilterField } from '~/components/widgets/types'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import Button from 'primevue/button'

// Sample data type
interface Event {
  id: number
  name: string
  date: string
  location: string
  status: 'draft' | 'published' | 'cancelled'
  registrations: number
  capacity: number
}

// Search filter fields
const searchFields: SearchFilterField[] = [
  {
    field: 'name',
    label: 'Event Name',
    type: 'text',
    placeholder: 'Search by event name...',
  },
  {
    field: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
      { label: 'Cancelled', value: 'cancelled' },
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

// Table columns
const tableColumns: TableColumn<Event>[] = [
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
    field: 'location',
    header: 'Location',
    sortable: true,
    filterable: true,
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
      { label: 'Cancelled', value: 'cancelled' },
    ],
    bodyTemplate: (row: Event) => {
      const statusColors: Record<string, string> = {
        draft: 'warning',
        published: 'success',
        cancelled: 'danger',
      }
      return `<span class="status-badge status-${statusColors[row.status]}">${row.status}</span>`
    },
  },
  {
    field: 'registrations',
    header: 'Registrations',
    sortable: true,
    filterable: true,
    filterType: 'numeric',
    align: 'right',
    bodyTemplate: (row: Event) => `${row.registrations} / ${row.capacity}`,
  },
]

// Sample table data
const tableData = ref<Event[]>([
  {
    id: 1,
    name: 'Summer Conference 2024',
    date: '2024-06-15',
    location: 'Main Hall',
    status: 'published',
    registrations: 150,
    capacity: 200,
  },
  {
    id: 2,
    name: 'Winter Workshop',
    date: '2024-12-10',
    location: 'Room A',
    status: 'draft',
    registrations: 25,
    capacity: 50,
  },
  {
    id: 3,
    name: 'Spring Retreat',
    date: '2024-03-20',
    location: 'Outdoor Venue',
    status: 'published',
    registrations: 80,
    capacity: 100,
  },
  {
    id: 4,
    name: 'Tech Summit',
    date: '2024-09-05',
    location: 'Convention Center',
    status: 'cancelled',
    registrations: 0,
    capacity: 500,
  },
])

const tableLoading = ref(false)
const selectedItems = ref<Event[]>([])
const groupByField = ref<string | null>(null)

// Context menu actions
const contextMenuActions: TableContextMenuAction<Event>[] = [
  {
    label: 'Edit Event',
    icon: 'pi pi-pencil',
    command: (row: Event) => {
      console.log('Edit event:', row)
      // Navigate to edit page or open modal
    },
  },
  {
    label: 'View Registrations',
    icon: 'pi pi-users',
    command: (row: Event) => {
      console.log('View registrations for:', row.name)
    },
  },
  {
    separator: true,
    label: '',
    command: () => {},
  },
  {
    label: 'Duplicate Event',
    icon: 'pi pi-copy',
    command: (row: Event) => {
      console.log('Duplicate event:', row)
    },
  },
  {
    label: 'Delete Event',
    icon: 'pi pi-trash',
    command: (row: Event) => {
      if (confirm(`Are you sure you want to delete "${row.name}"?`)) {
        console.log('Delete event:', row)
        // Remove from tableData
        const index = tableData.value.findIndex(e => e.id === row.id)
        if (index > -1) {
          tableData.value.splice(index, 1)
        }
      }
    },
    disabled: (row: Event) => row.status === 'published',
  },
]

// Event handlers
const onSearch = (value: string) => {
  console.log('Global search:', value)
  // Implement search logic
}

const onFilterChange = (filters: Record<string, any>) => {
  console.log('Filter change:', filters)
  // Implement filter logic
}

const onClearFilters = () => {
  console.log('Filters cleared')
  // Reset filters
}

const onSelectionChange = (event: any) => {
  selectedItems.value = event.selection
  console.log('Selection changed:', event.selection)
}

const onRowContextMenu = (event: any) => {
  console.log('Row context menu:', event.data)
}

const onTableSort = (event: any) => {
  console.log('Table sort:', event)
  // Implement sorting logic
}

const clearSelection = () => {
  selectedItems.value = []
}

// Modal demo
const modalVisible = ref(false)
const modalSize = ref<'small' | 'medium' | 'large' | 'fullscreen'>('medium')
const modalTitle = ref('Modal Title')
const modalLoading = ref(false)

const openModal = (size: 'small' | 'medium' | 'large' | 'fullscreen') => {
  modalSize.value = size
  modalTitle.value = `${size.charAt(0).toUpperCase() + size.slice(1)} Modal`
  modalVisible.value = true
}

const openLoadingModal = () => {
  modalSize.value = 'medium'
  modalTitle.value = 'Loading Modal'
  modalVisible.value = true
  modalLoading.value = true
  setTimeout(() => {
    modalLoading.value = false
  }, 2000)
}

const onModalConfirm = () => {
  console.log('Modal confirmed')
  modalVisible.value = false
}

const onModalCancel = () => {
  console.log('Modal cancelled')
  modalVisible.value = false
}

// Toast demo
const toast = useToast()

const showSuccessToast = () => {
  toast.success('Operation completed', 'The event was created successfully')
}

const showErrorToast = () => {
  toast.error('Error occurred', 'Failed to save changes. Please try again.')
}

const showWarningToast = () => {
  toast.warn('Warning', 'Please review your changes before submitting.')
}

const showInfoToast = () => {
  toast.info('Information', 'Your changes have been saved automatically.')
}

// Confirm dialog demo
const confirm = useConfirm()

const showDeleteConfirm = () => {
  confirm.deleteConfirm(
    'Summer Conference 2024',
    () => {
      toast.success('Deleted', 'Event has been deleted successfully')
    }
  )
}

const showDangerConfirm = () => {
  confirm.danger(
    'Are you sure you want to perform this dangerous action? This cannot be undone.',
    () => {
      toast.warn('Action performed', 'The dangerous action has been executed')
    }
  )
}

const showCustomConfirm = () => {
  confirm.require({
    message: 'Do you want to proceed with this action?',
    header: 'Custom Confirmation',
    icon: 'pi pi-question-circle',
    acceptLabel: 'Yes, proceed',
    rejectLabel: 'No, cancel',
    accept: () => {
      toast.info('Confirmed', 'You chose to proceed')
    },
    reject: () => {
      toast.info('Cancelled', 'You chose to cancel')
    },
  })
}
</script>

<style scoped lang="css">
.components-demo {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  margin-bottom: 2rem;
}

.demo-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color, #212529);
}

.demo-header p {
  color: var(--text-color-secondary, #6c757d);
  font-size: 1rem;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: var(--surface-0, #ffffff);
  border: 1px solid var(--surface-200, #e0e0e0);
  border-radius: 4px;
}

.demo-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-color, #212529);
}

.demo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md, 1rem);
}

.selection-info {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: var(--primary-color, #007bff);
  color: white;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selection-info p {
  margin: 0;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-warning {
  background: var(--yellow-100, #fff3cd);
  color: var(--yellow-800, #856404);
}

.status-success {
  background: var(--green-100, #d4edda);
  color: var(--green-800, #155724);
}

.status-danger {
  background: var(--red-100, #f8d7da);
  color: var(--red-800, #721c24);
}
</style>
