<template>
  <div class="groups-table">
    <div class="table-header">
      <h2>Family Groups</h2>
      <Button
        label="New Group"
        icon="pi pi-plus"
        :disabled="!tenantId"
        @click="handleCreate"
      />
    </div>

    <div v-if="!tenantId" class="empty-state">
      Please select a tenant to view family groups.
    </div>

    <DataTable
      v-else
      :value="groups"
      :loading="loading"
      :paginator="true"
      :rows="25"
      :rows-per-page-options="[10, 25, 50, 100]"
      sort-mode="multiple"
      :global-filter-fields="['name', 'primaryContact.email', 'primaryContact.firstName', 'primaryContact.lastName']"
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
              placeholder="Search groups..."
              class="w-full"
            />
          </InputGroup>
        </div>
      </template>

      <Column field="name" header="Name" :sortable="true">
        <template #body="{ data }">
          {{ data.name || '-' }}
        </template>
      </Column>
      <Column header="Primary Contact" :sortable="true">
        <template #body="{ data }">
          <div>
            <div>{{ getContactName(data.primaryContact) }}</div>
            <div class="muted text-sm">{{ data.primaryContact.email }}</div>
          </div>
        </template>
      </Column>
      <Column header="Members">
        <template #body="{ data }">
          <Tag :value="`${data.members?.length || 0} members`" />
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
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { onMounted, ref, watch } from 'vue'
import { useConfirm } from '~/composables/useConfirm'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import { useToast } from '~/composables/useToast'

export interface GroupMember {
  id: string
  userId: string
  relationshipType: string
  isPrimaryContact: boolean
  addedAt: string
  addedBy?: string | null
  user: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
  }
}

export interface Group {
  id: string
  tenantId: string
  name?: string | null
  primaryContactId: string
  createdAt: string
  updatedAt: string
  primaryContact: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
  }
  members?: GroupMember[]
}

interface Props {
  tenantId?: string | null
  reloadNonce?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  editGroup: [group: Group]
  createGroup: []
}>()

const toast = useToast()
const confirm = useConfirm()
const auth = useSuperAdminAuth()
const groups = ref<Group[]>([])
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

function getContactName(contact: { firstName?: string | null; lastName?: string | null; email: string }): string {
  if (contact.firstName || contact.lastName) {
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
  }
  return contact.email
}

async function loadGroups() {
  if (!props.tenantId) {
    groups.value = []
    return
  }

  loading.value = true
  try {
    const response = await $fetch<{ data: Group[] }>(
      `${config.public.apiUrl}/api/admin/groups`,
      {
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
        } as Record<string, string>,
      }
    )
    groups.value = response.data
  } catch (error: any) {
    toast.error('Failed to load groups', error.message)
  } finally {
    loading.value = false
  }
}

function handleEdit(group: Group) {
  emit('editGroup', group)
}

function handleCreate() {
  emit('createGroup')
}

async function handleDelete(group: Group) {
  confirm.deleteConfirm(
    group.name || 'Family Group',
    async () => {
      try {
        await $fetch(
          `${config.public.apiUrl}/api/admin/groups/${group.id}`,
          {
            method: 'DELETE',
            headers: {
              ...auth.getAuthHeaders(),
              'X-Tenant-ID': props.tenantId!,
            } as Record<string, string>,
          }
        )
        toast.success('Group deleted successfully')
        await loadGroups()
      } catch (error: any) {
        toast.error('Failed to delete group', error.message)
      }
    },
    {
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
    }
  )
}

watch(
  () => props.tenantId,
  () => {
    loadGroups()
  },
  { immediate: true }
)

watch(
  () => props.reloadNonce,
  () => {
    loadGroups()
  }
)
</script>

<style scoped>
.groups-table {
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

.text-sm {
  font-size: var(--font-size-sm, 0.875rem);
}
</style>
