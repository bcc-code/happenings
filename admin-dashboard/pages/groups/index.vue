<template>
  <PageContainer>
    <PageHeader
      title="Family Groups"
      subtitle="Manage family groups and their members."
      eyebrow="Super Admin"
    />

    <Card class="mt-4">
      <template #content>
        <div class="toolbar">
          <div class="toolbar__left">
            <div class="field">
              <label class="field__label">Tenant</label>
              <Dropdown
                v-model="selectedTenantId"
                :options="tenants"
                option-label="name"
                option-value="id"
                placeholder="Select a tenant"
                class="w-full"
                :loading="tenantsLoading"
              />
            </div>
          </div>
        </div>

        <GroupsTable
          :tenant-id="selectedTenantId"
          :reload-nonce="reloadNonce"
          @edit-group="handleEditGroup"
          @create-group="handleCreateGroup"
        />
      </template>
    </Card>

    <Dialog
      v-model:visible="showGroupDialog"
      modal
      :header="groupDialogTitle"
      :style="{ width: '800px' }"
    >
      <GroupForm
        :group="selectedGroup"
        :tenant-id="selectedTenantId"
        @saved="handleGroupSaved"
        @cancel="closeGroupDialog"
      />
    </Dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import { ref } from 'vue'
import { PageContainer, PageHeader } from '~/components/containers'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import { useToast } from '~/composables/useToast'
import { GroupsTable, GroupForm } from '~/components/modules/groups'
import type { Group } from '~/components/modules/groups'

interface Tenant {
  id: string
  name: string
  slug: string
}

const toast = useToast()
const auth = useSuperAdminAuth()
const config = useRuntimeConfig()

const tenants = ref<Tenant[]>([])
const tenantsLoading = ref(false)
const selectedTenantId = ref<string | null>(null)
const showGroupDialog = ref(false)
const selectedGroup = ref<Group | null>(null)
const reloadNonce = ref(0)

const groupDialogTitle = computed(() => {
  return selectedGroup.value ? 'Edit Family Group' : 'New Family Group'
})

async function loadTenants() {
  tenantsLoading.value = true
  try {
    const response = await $fetch<{ data: Tenant[] }>(
      `${config.public.apiUrl}/api/admin/tenants`,
      {
        headers: auth.getAuthHeaders(),
      }
    )
    tenants.value = response.data

    if (!selectedTenantId.value && tenants.value.length > 0) {
      selectedTenantId.value = tenants.value[0].id
    }
  } catch (err: any) {
    toast.error('Failed to load tenants', err.message)
  } finally {
    tenantsLoading.value = false
  }
}

function handleEditGroup(group: Group) {
  selectedGroup.value = group
  showGroupDialog.value = true
}

function handleCreateGroup() {
  selectedGroup.value = null
  showGroupDialog.value = true
}

function handleGroupSaved(group: Group) {
  showGroupDialog.value = false
  selectedGroup.value = null
  reloadNonce.value++
}

function closeGroupDialog() {
  showGroupDialog.value = false
  selectedGroup.value = null
}

onMounted(() => {
  loadTenants()
})
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-lg, 1.5rem);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-lg, 1.5rem);
}

.toolbar__left {
  display: flex;
  gap: var(--spacing-md, 1rem);
  align-items: end;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
  min-width: 200px;
}

.field__label {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
  font-weight: 600;
}
</style>
