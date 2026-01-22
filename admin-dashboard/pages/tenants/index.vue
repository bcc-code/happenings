<template>
  <ModuleContainer
    :use-default-header="true"
    header-title="Tenants"
    header-subtitle="Manage church tenants and organizations"
  >
    <TenantsTable
      ref="tenantsTableRef"
      :reload-nonce="tenantsReloadNonce"
      @edit-tenant="handleEditTenant"
      @create-tenant="handleCreateTenant"
    />

    <!-- Create/Edit Tenant Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      modal
      :header="editingTenant?.id ? `Edit Tenant` : `Create New Tenant`"
      :style="{ width: '700px' }"
    >
      <TenantForm
        v-if="editingTenant !== null"
        :tenant="editingTenant"
        :is-new="!editingTenant?.id"
        @saved="handleTenantSaved"
        @cancel="showEditDialog = false"
      />
    </Dialog>
  </ModuleContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModuleContainer from '~/components/layouts/ModuleContainer.vue'
import Dialog from 'primevue/dialog'
import TenantsTable from '~/components/modules/tenants/TenantsTable.vue'
import TenantForm from '~/components/modules/tenants/TenantForm.vue'
import { useToast } from '~/composables/useToast'
import type { Tenant } from '~/components/modules/tenants/types'

// Protect this route
definePageMeta({
  middleware: 'super-admin-auth',
  layout: 'super-admin',
})

const toast = useToast()
const showEditDialog = ref(false)
const editingTenant = ref<Partial<Tenant> | null>(null)
const tenantsReloadNonce = ref(0)
const tenantsTableRef = ref<InstanceType<typeof TenantsTable> | null>(null)

function handleEditTenant(tenant: Tenant) {
  editingTenant.value = tenant
  showEditDialog.value = true
}

function handleCreateTenant() {
  editingTenant.value = {}
  showEditDialog.value = true
}

function handleTenantSaved(tenant: Tenant) {
  // Track if this was a new tenant before clearing state
  const isNew = !editingTenant.value?.id
  
  showEditDialog.value = false
  editingTenant.value = null
  tenantsReloadNonce.value++
  
  // Broadcast the change to other tabs
  tenantsTableRef.value?.broadcastTenantChange(
    isNew ? 'TENANT_CREATED' : 'TENANT_UPDATED',
    tenant
  )
}
</script>

<style scoped>
/* Styles handled by ModuleContainer */
</style>
