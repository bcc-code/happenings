<template>
  <AdminModuleContainer
    :use-default-header="useDefaultHeader"
    :header-title="headerTitle"
    :header-subtitle="headerSubtitle"
    :header-show-back="headerShowBack"
    :header-breadcrumbs="headerBreadcrumbs"
    :sidebar-visible="sidebarVisible"
    :sidebar-title="sidebarTitle"
    :sidebar-position="sidebarPosition"
    :sidebar-width="sidebarWidth"
  >
    <!-- Custom header actions -->
    <template #header-actions>
      <Button label="New Event" icon="pi pi-plus" @click="showToast('New event clicked')" />
      <Button label="Export" icon="pi pi-download" severity="secondary" @click="showToast('Export clicked')" />
    </template>

    <!-- Main content -->
    <div class="module-content">
      <Card>
        <template #title>Module Content</template>
        <template #content>
          <p>This is the main content area of the module. You can put any content here.</p>
          <p>Try toggling the sidebar and changing the header options using the controls below.</p>

          <div class="demo-controls">
            <h3>Demo Controls</h3>
            <div class="control-group">
              <Checkbox v-model="useDefaultHeader" inputId="useDefaultHeader" />
              <label for="useDefaultHeader">Use Default Header</label>
            </div>
            <div class="control-group">
              <Checkbox v-model="headerShowBack" inputId="headerShowBack" />
              <label for="headerShowBack">Show Back Button</label>
            </div>
            <div class="control-group">
              <Checkbox v-model="sidebarVisible" inputId="sidebarVisible" />
              <label for="sidebarVisible">Show Sidebar</label>
            </div>
            <div class="control-group">
              <label for="sidebarPosition">Sidebar Position:</label>
              <Select
                id="sidebarPosition"
                v-model="sidebarPosition"
                :options="['left', 'right']"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Sidebar content -->
    <template #sidebar>
      <Card>
        <template #title>{{ sidebarTitle }}</template>
        <template #content>
          <p>This is the sidebar content. It can contain filters, actions, or any other content.</p>
          <div class="sidebar-filters">
            <h4>Filters</h4>
            <div class="filter-item">
              <label>Status</label>
              <Select
                v-model="filterStatus"
                :options="['All', 'Active', 'Inactive', 'Draft']"
                placeholder="Select status"
              />
            </div>
            <div class="filter-item">
              <label>Date Range</label>
              <Calendar v-model="filterDate" selectionMode="range" />
            </div>
          </div>
        </template>
      </Card>
    </template>
  </AdminModuleContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AdminModuleContainer } from '~/components/admin'
import type { BreadcrumbItem } from '~/components/admin/types'
import { useToast } from '~/composables/useToast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import Calendar from 'primevue/calendar'

const toast = useToast()

const useDefaultHeader = ref(true)
const headerTitle = ref('Module Demo')
const headerSubtitle = ref('Demonstrating ModuleContainer and ModuleHeader components')
const headerShowBack = ref(true)
const sidebarVisible = ref(true)
const sidebarTitle = ref('Filters & Actions')
const sidebarPosition = ref<'left' | 'right'>('right')
const sidebarWidth = ref('320px')

const filterStatus = ref(null)
const filterDate = ref(null)

const headerBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Modules', to: '/modules' },
  { label: 'Demo' },
]

const showToast = (message: string) => {
  toast.info('Action', message)
}
</script>

<style scoped lang="css">
.module-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 1.5rem);
}

.demo-controls {
  margin-top: var(--spacing-lg, 1.5rem);
  padding: var(--spacing-md, 1rem);
  background: var(--surface-50, #fafafa);
  border-radius: var(--border-radius-md, 6px);
}

.demo-controls h3 {
  margin: 0 0 var(--spacing-md, 1rem) 0;
  font-size: var(--font-size-base, 1rem);
  font-weight: var(--font-weight-semibold, 600);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
  margin-bottom: var(--spacing-sm, 0.5rem);
}

.sidebar-filters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 1rem);
}

.sidebar-filters h4 {
  margin: 0 0 var(--spacing-sm, 0.5rem) 0;
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color-secondary, #6c757d);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 0.25rem);
}

.filter-item label {
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-color, #212529);
}
</style>