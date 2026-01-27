<template>
  <div class="user-form">
    <div class="form-group">
      <label for="firstName">First Name</label>
      <InputText
        id="firstName"
        v-model="form.firstName"
        placeholder="First name"
      />
    </div>

    <div class="form-group">
      <label for="lastName">Last Name</label>
      <InputText
        id="lastName"
        v-model="form.lastName"
        placeholder="Last name"
      />
    </div>

    <div class="form-group">
      <label for="phone">Phone</label>
      <InputText
        id="phone"
        v-model="form.phone"
        placeholder="Phone number"
      />
    </div>

    <div class="form-group">
      <label for="role">Role</label>
      <Select
        id="role"
        v-model="form.role"
        :options="roleOptions"
        option-label="label"
        option-value="value"
        placeholder="Select role"
      />
    </div>

    <div class="form-group">
      <label for="status">Status</label>
      <Select
        id="status"
        v-model="form.status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="Select status"
      />
    </div>

    <div class="form-group">
      <label>
        <Checkbox
          v-model="form.isPrimary"
          :binary="true"
        />
        Primary Affiliation
      </label>
      <small>Mark this as the user's primary tenant affiliation</small>
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
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { ref } from 'vue'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import { useToast } from '~/composables/useToast'
import type { User } from './UsersTable.vue'

interface Props {
  user?: User | null
  tenantId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  saved: [user: User]
  cancel: []
}>()

const toast = useToast()
const auth = useSuperAdminAuth()
const loading = ref(false)

const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Event Manager', value: 'event_manager' },
  { label: 'Admin', value: 'admin' },
  { label: 'Super Admin', value: 'super_admin' },
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const form = ref({
  firstName: props.user?.firstName || '',
  lastName: props.user?.lastName || '',
  phone: props.user?.phone || '',
  role: props.user?.role || 'user',
  status: props.user?.status || 'active',
  isPrimary: props.user?.isPrimary || false,
})

async function handleSubmit() {
  if (!props.tenantId) {
    toast.error('Please select a tenant')
    return
  }

  if (!props.user) {
    toast.error('User is required')
    return
  }

  loading.value = true
  try {
    const config = useRuntimeConfig()
    const response = await $fetch<{ data: User }>(
      `${config.public.apiUrl}/api/admin/users/${props.user.id}`,
      {
        method: 'PUT',
        headers: {
          ...auth.getAuthHeaders(),
          'X-Tenant-ID': props.tenantId,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        body: {
          firstName: form.value.firstName || null,
          lastName: form.value.lastName || null,
          phone: form.value.phone || null,
          role: form.value.role,
          status: form.value.status,
          isPrimary: form.value.isPrimary,
        },
      }
    )

    emit('saved', response.data)
    toast.success('User updated successfully')
  } catch (error: any) {
    toast.error('Failed to update user', error.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.user-form {
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

.form-group small {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md, 1rem);
  margin-top: var(--spacing-md, 1rem);
}
</style>
