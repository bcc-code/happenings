<template>
  <div class="tenants-table">
    <div class="table-header">
      <h2>Tenants</h2>
      <Button
        label="New Tenant"
        icon="pi pi-plus"
        @click="handleCreate"
      />
    </div>

    <DataTable
      :value="tenants"
      :loading="loading"
      :paginator="true"
      :rows="25"
      :rows-per-page-options="[10, 25, 50, 100]"
      sort-mode="multiple"
      :global-filter-fields="['name', 'slug', 'domain']"
    >
      <template #header>
        <div class="table-toolbar">
          <InputGroup class="w-full">
            <InputGroupAddon>
              <i class="pi pi-search" />
            </InputGroupAddon>
            <InputText
              v-model="globalFilter"
              placeholder="Search tenants..."
              class="w-full"
            />
          </InputGroup>
        </div>
      </template>

      <Column field="name" header="Name" :sortable="true" />
      <Column field="slug" header="Slug" :sortable="true" />
      <Column field="domain" header="Domain" :sortable="true">
        <template #body="{ data }">
          {{ data.domain || '-' }}
        </template>
      </Column>
      <Column field="timezone" header="Timezone" :sortable="true" />
      <Column field="locale" header="Locale" :sortable="true" />
      <Column field="currency" header="Currency" :sortable="true" />
      <Column field="isActive" header="Status" :sortable="true">
        <template #body="{ data }">
          <Tag
            :value="data.isActive ? 'Active' : 'Inactive'"
            :severity="data.isActive ? 'success' : 'secondary'"
          />
        </template>
      </Column>
      <Column field="createdAt" header="Created" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </Column>

      <Column :exportable="false" style="width: 120px">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            text
            rounded
            @click="handleEdit(data)"
          />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            @click="handleDelete(data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Tag from 'primevue/tag'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useConfirm } from '~/composables/useConfirm'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import { useToast } from '~/composables/useToast'
import type { Tenant } from './types'

interface Props {
  reloadNonce?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  editTenant: [tenant: Tenant]
  createTenant: []
}>()

const toast = useToast()
const confirm = useConfirm()
const auth = useSuperAdminAuth()
const tenants = ref<Tenant[]>([])
const loading = ref(false)
const globalFilter = ref('')

const config = useRuntimeConfig()

// BroadcastChannel for cross-tab communication
const broadcastChannel = typeof window !== 'undefined' 
  ? new BroadcastChannel('tenants-sync') 
  : null

// Broadcast message type
type TenantSyncMessage = 
  | { type: 'RELOAD' }
  | { type: 'TENANT_CREATED' | 'TENANT_UPDATED' | 'TENANT_DELETED'; tenant: Tenant }

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

async function loadTenants() {
  loading.value = true
  try {
    const response = await $fetch<{ data: Tenant[] }>(
      `${config.public.apiUrl}/api/admin/tenants`,
      {
        headers: {
          ...auth.getAuthHeaders(),
        } as Record<string, string>,
      }
    )
    tenants.value = response.data
  } catch (error: any) {
    toast.error('Failed to load tenants', error.message)
  } finally {
    loading.value = false
  }
}

function handleEdit(tenant: Tenant) {
  emit('editTenant', tenant)
}

function handleCreate() {
  emit('createTenant')
}

async function handleDelete(tenant: Tenant) {
  confirm.deleteConfirm(
    tenant.name,
    async () => {
      try {
        await $fetch(
          `${config.public.apiUrl}/api/admin/tenants/${tenant.id}`,
          {
            method: 'DELETE',
            headers: {
              ...auth.getAuthHeaders(),
            } as Record<string, string>,
          }
        )
        toast.success('Tenant deleted successfully')
        await loadTenants()
        // Broadcast deletion to other tabs
        broadcastChannel?.postMessage({ type: 'TENANT_DELETED', tenant } as TenantSyncMessage)
      } catch (error: any) {
        toast.error('Failed to delete tenant', error.message)
      }
    },
    {
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
    }
  )
}

// Handle window focus - refresh data when tab becomes active
function handleWindowFocus() {
  // Only reload if we haven't reloaded recently (within last 2 seconds)
  const now = Date.now()
  if (!handleWindowFocus.lastFocusTime || now - handleWindowFocus.lastFocusTime > 2000) {
    loadTenants()
    handleWindowFocus.lastFocusTime = now
  }
}
handleWindowFocus.lastFocusTime = 0

// Listen for broadcast messages from other tabs
function handleBroadcastMessage(event: MessageEvent<TenantSyncMessage>) {
  if (event.data.type === 'RELOAD') {
    loadTenants()
  } else if (
    event.data.type === 'TENANT_CREATED' ||
    event.data.type === 'TENANT_UPDATED' ||
    event.data.type === 'TENANT_DELETED'
  ) {
    // Reload to get the latest data
    loadTenants()
  }
}

watch(
  () => globalFilter.value,
  (value) => {
    // DataTable handles global filter internally
  }
)

watch(
  () => props.reloadNonce,
  () => {
    loadTenants()
    // Broadcast reload to other tabs
    broadcastChannel?.postMessage({ type: 'RELOAD' } as TenantSyncMessage)
  }
)

onMounted(() => {
  loadTenants()
  
  // Set up broadcast channel listener
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage)
  }
  
  // Set up window focus listener
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleWindowFocus)
  }
})

onUnmounted(() => {
  // Clean up broadcast channel listener
  if (broadcastChannel) {
    broadcastChannel.removeEventListener('message', handleBroadcastMessage)
    broadcastChannel.close()
  }
  
  // Clean up window focus listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('focus', handleWindowFocus)
  }
})

// Expose function to broadcast tenant changes (called from parent)
defineExpose({
  broadcastTenantChange: (type: 'TENANT_CREATED' | 'TENANT_UPDATED', tenant: Tenant) => {
    broadcastChannel?.postMessage({ type, tenant } as TenantSyncMessage)
  },
})
</script>

<style scoped>
.tenants-table {
  padding: var(--spacing-md, 1rem);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md, 1rem);
}

.table-header h2 {
  margin: 0;
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 0.5rem);
  margin-bottom: var(--spacing-sm, 0.5rem);
}
</style>
