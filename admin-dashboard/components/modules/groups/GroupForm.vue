<template>
  <div class="group-form">
    <div class="form-group">
      <label for="name">Group Name <span class="optional">(optional)</span></label>
      <InputText
        id="name"
        v-model="form.name"
        placeholder="Family name or identifier"
      />
    </div>

    <div class="form-group">
      <label for="primaryContactId">Primary Contact <span class="required">*</span></label>
      <Select
        id="primaryContactId"
        v-model="form.primaryContactId"
        :options="users"
        option-label="displayName"
        option-value="id"
        placeholder="Select primary contact"
        :loading="usersLoading"
        filter
        @filter="filterUsers"
      >
        <template #option="slotProps">
          <div>
            <div>{{ slotProps.option.displayName }}</div>
            <div class="text-sm muted">{{ slotProps.option.email }}</div>
          </div>
        </template>
      </Select>
      <small>The primary contact must be a user affiliated with this tenant</small>
    </div>

    <div v-if="group && group.members && group.members.length > 0" class="form-group">
      <label>Members</label>
      <DataTable :value="group.members" size="small">
        <Column header="Name">
          <template #body="{ data }">
            {{ getUserName(data.user) }}
          </template>
        </Column>
        <Column field="relationshipType" header="Relationship" />
        <Column header="Primary Contact">
          <template #body="{ data }">
            <i
              v-if="data.isPrimaryContact"
              class="pi pi-check-circle text-green-500"
            />
            <span v-else class="muted">—</span>
          </template>
        </Column>
        <Column :exportable="false" style="width: 80px">
          <template #body="{ data }">
            <Button
              v-if="!data.isPrimaryContact"
              icon="pi pi-times"
              text
              rounded
              severity="danger"
              size="small"
              @click="handleRemoveMember(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="group" class="form-group">
      <label>Add Member</label>
      <div class="add-member-row">
        <Select
          v-model="newMember.userId"
          :options="availableUsers"
          option-label="displayName"
          option-value="id"
          placeholder="Select user"
          filter
          class="flex-1"
          @filter="filterUsers"
        />
        <Select
          v-model="newMember.relationshipType"
          :options="relationshipOptions"
          option-label="label"
          option-value="value"
          placeholder="Relationship"
          class="flex-1"
        />
        <Button
          label="Add"
          icon="pi pi-plus"
          :disabled="!newMember.userId || !newMember.relationshipType"
          @click="handleAddMember"
        />
      </div>
    </div>

    <div class="form-actions">
      <Button
        label="Cancel"
        severity="secondary"
        outlined
        @click="handleCancel"
      />
      <Button
        label="Save"
        :loading="loading"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { computed, ref } from 'vue'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import { useToast } from '~/composables/useToast'
import type { Group, GroupMember } from './GroupsTable.vue'

interface User {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  displayName: string
}

interface Props {
  group?: Group | null
  tenantId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  saved: [group: Group]
  cancel: []
}>()

const toast = useToast()
const auth = useSuperAdminAuth()
const loading = ref(false)
const usersLoading = ref(false)
const users = ref<User[]>([])
const allUsers = ref<User[]>([])

const relationshipOptions = [
  { label: 'Parent', value: 'parent' },
  { label: 'Child', value: 'child' },
  { label: 'Spouse', value: 'spouse' },
  { label: 'Guardian', value: 'guardian' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Other', value: 'other' },
]

const form = ref({
  name: props.group?.name || '',
  primaryContactId: props.group?.primaryContactId || '',
})

const newMember = ref({
  userId: '',
  relationshipType: '',
})

const availableUsers = computed(() => {
  if (!props.group) return []
  const memberUserIds = new Set(props.group.members?.map(m => m.user.id) || [])
  return users.value.filter(u => !memberUserIds.has(u.id))
})

function getUserName(user: { firstName?: string | null; lastName?: string | null; email: string }): string {
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim()
  }
  return user.email
}

async function loadUsers() {
  if (!props.tenantId) return

  usersLoading.value = true
  try {
    const config = useRuntimeConfig()
    const response = await $fetch<{ data: any[] }>(
      `${config.public.apiUrl}/api/admin/users`,
      {
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
        } as Record<string, string>,
      }
    )
    allUsers.value = response.data.map((u: any) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      displayName: getUserName(u),
    }))
    users.value = allUsers.value
  } catch (error: any) {
    toast.error('Failed to load users', error.message)
  } finally {
    usersLoading.value = false
  }
}

function filterUsers(event: any) {
  const query = event.value?.toLowerCase() || ''
  if (!query) {
    users.value = allUsers.value
    return
  }
  users.value = allUsers.value.filter(u =>
    u.displayName.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  )
}

async function handleAddMember() {
  if (!props.group || !props.tenantId || !newMember.value.userId || !newMember.value.relationshipType) {
    return
  }

  loading.value = true
  try {
    const config = useRuntimeConfig()
    await $fetch(
      `${config.public.apiUrl}/api/admin/groups/${props.group.id}/members`,
      {
        method: 'POST',
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        body: {
          userId: newMember.value.userId,
          relationshipType: newMember.value.relationshipType,
        },
      }
    )

    toast.success('Member added successfully')
    newMember.value = { userId: '', relationshipType: '' }
    
    // Reload group data
    const groupResponse = await $fetch<{ data: Group }>(
      `${config.public.apiUrl}/api/admin/groups/${props.group.id}`,
      {
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
        } as Record<string, string>,
      }
    )
    emit('saved', groupResponse.data)
  } catch (error: any) {
    toast.error('Failed to add member', error.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

async function handleRemoveMember(memberId: string) {
  if (!props.group || !props.tenantId) return

  loading.value = true
  try {
    const config = useRuntimeConfig()
    await $fetch(
      `${config.public.apiUrl}/api/admin/groups/${props.group.id}/members/${memberId}`,
      {
        method: 'DELETE',
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
        } as Record<string, string>,
      }
    )

    toast.success('Member removed successfully')
    
    // Reload group data
    const groupResponse = await $fetch<{ data: Group }>(
      `${config.public.apiUrl}/api/admin/groups/${props.group.id}`,
      {
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
        } as Record<string, string>,
      }
    )
    emit('saved', groupResponse.data)
  } catch (error: any) {
    toast.error('Failed to remove member', error.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!props.tenantId) {
    toast.error('Please select a tenant')
    return
  }

  if (!form.value.primaryContactId) {
    toast.error('Primary contact is required')
    return
  }

  loading.value = true
  try {
    const config = useRuntimeConfig()
    const url = props.group
      ? `${config.public.apiUrl}/api/admin/groups/${props.group.id}`
      : `${config.public.apiUrl}/api/admin/groups`

    const response = await $fetch<{ data: Group }>(
      url,
      {
        method: props.group ? 'PUT' : 'POST',
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        body: {
          name: form.value.name || null,
          primaryContactId: form.value.primaryContactId,
        },
      }
    )

    emit('saved', response.data)
    toast.success(props.group ? 'Group updated successfully' : 'Group created successfully')
  } catch (error: any) {
    toast.error(
      props.group ? 'Failed to update group' : 'Failed to create group',
      error.data?.error || error.message
    )
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}

// Load users when component mounts or tenant changes
watch(() => props.tenantId, () => {
  if (props.tenantId) {
    loadUsers()
  }
}, { immediate: true })
</script>

<style scoped>
.group-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 1.5rem);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
}

.form-group label {
  font-weight: 600;
}

.form-group label .required {
  color: var(--p-danger-color);
}

.form-group label .optional {
  color: var(--p-text-color-secondary);
  font-weight: normal;
}

.form-group small {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
}

.add-member-row {
  display: flex;
  gap: var(--spacing-md, 1rem);
  align-items: flex-end;
}

.flex-1 {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md, 1rem);
  margin-top: var(--spacing-md, 1rem);
}

.muted {
  color: var(--p-text-color-secondary);
}

.text-sm {
  font-size: var(--font-size-sm, 0.875rem);
}
</style>
