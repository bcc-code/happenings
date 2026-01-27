<template>
  <div class="users-table">
    <div class="table-header">
      <h2>Users</h2>
      <Button
        label="New User"
        icon="pi pi-plus"
        :disabled="!tenantId"
        @click="handleCreate"
      />
    </div>

    <div v-if="!tenantId" class="empty-state">
      Please select a tenant to view users.
    </div>

    <DataTable
      v-else
      :value="users"
      :loading="loading"
      :paginator="true"
      :rows="25"
      :rows-per-page-options="[10, 25, 50, 100]"
      sort-mode="multiple"
      :global-filter-fields="['email', 'firstName', 'lastName']"
      data-key="id"
    >
      <template #header>
        <div class="table-toolbar">
          <InputGroup class="w-full">
            <InputGroupAddon>
              <i class="pi pi-search" />
            </InputGroupAddon>
            <InputText
              v-model="globalFilter"
              placeholder="Search users..."
              class="w-full"
            />
          </InputGroup>
        </div>
      </template>

      <Column field="email" header="Email" :sortable="true" />
      <Column field="firstName" header="First Name" :sortable="true">
        <template #body="{ data }">
          {{ data.firstName || '-' }}
        </template>
      </Column>
      <Column field="lastName" header="Last Name" :sortable="true">
        <template #body="{ data }">
          {{ data.lastName || '-' }}
        </template>
      </Column>
      <Column field="phone" header="Phone">
        <template #body="{ data }">
          {{ data.phone || '-' }}
        </template>
      </Column>
      <Column field="role" header="Role" :sortable="true">
        <template #body="{ data }">
          <Tag
            :value="data.role"
            :severity="getRoleSeverity(data.role)"
          />
        </template>
      </Column>
      <Column field="status" header="Status" :sortable="true">
        <template #body="{ data }">
          <Tag
            :value="data.status"
            :severity="data.status === 'active' ? 'success' : 'secondary'"
          />
        </template>
      </Column>
      <Column field="isPrimary" header="Primary" :sortable="true">
        <template #body="{ data }">
          <i
            v-if="data.isPrimary"
            class="pi pi-check-circle text-green-500"
          />
          <span v-else class="muted">—</span>
        </template>
      </Column>
      <Column field="joinedAt" header="Joined" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.joinedAt) }}
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
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { onMounted, ref, watch } from 'vue'
import { useConfirm } from '~/composables/useConfirm'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import { useToast } from '~/composables/useToast'

export interface User {
  id: string
  email: string
  emailVerified: boolean
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  avatarUrl?: string | null
  timezone: string
  locale: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string | null
  affiliationId: string
  role: string
  isPrimary: boolean
  status: string
  joinedAt: string
  lastActiveAt?: string | null
}

interface Props {
  tenantId?: string | null
  reloadNonce?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  editUser: [user: User]
  createUser: []
}>()

const toast = useToast()
const confirm = useConfirm()
const auth = useSuperAdminAuth()
const users = ref<User[]>([])
const loading = ref(false)
const globalFilter = ref('')

const config = useRuntimeConfig()

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

function getRoleSeverity(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'danger'
    case 'admin':
      return 'warning'
    case 'event_manager':
      return 'info'
    default:
      return 'secondary'
  }
}

async function loadUsers() {
  if (!props.tenantId) {
    users.value = []
    return
  }

  loading.value = true
  try {
    const response = await $fetch<{ data: User[] }>(
      `${config.public.apiUrl}/api/admin/users`,
      {
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
        } as Record<string, string>,
      }
    )
    users.value = response.data
  } catch (error: any) {
    toast.error('Failed to load users', error.message)
  } finally {
    loading.value = false
  }
}

function handleEdit(user: User) {
  emit('editUser', user)
}

function handleCreate() {
  emit('createUser')
}

async function handleDelete(user: User) {
  confirm.deleteConfirm(
    user.email,
    async () => {
      try {
        await $fetch(
          `${config.public.apiUrl}/api/admin/users/${user.id}`,
          {
            method: 'DELETE',
            headers: {
              ...auth.getAuthHeaders(),
              'X-Tenant-ID': props.tenantId!,
            } as Record<string, string>,
          }
        )
        toast.success('User removed from tenant successfully')
        await loadUsers()
      } catch (error: any) {
        toast.error('Failed to remove user', error.message)
      }
    },
    {
      header: 'Confirm Remove',
      icon: 'pi pi-exclamation-triangle',
      message: 'This will remove the user from this tenant. The user account will not be deleted.',
    }
  )
}

watch(
  () => props.tenantId,
  () => {
    loadUsers()
  },
  { immediate: true }
)

watch(
  () => props.reloadNonce,
  () => {
    loadUsers()
  }
)
</script>

<style scoped>
.users-table {
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

.empty-state {
  padding: var(--spacing-xl, 2rem);
  text-align: center;
  color: var(--p-text-color-secondary);
}

.muted {
  color: var(--p-text-color-secondary);
}
</style>
