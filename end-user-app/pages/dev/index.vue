<template>
  <div class="page">
    <Card>
      <template #title>Dev settings</template>
      <template #subtitle>Configure API headers until Auth0 is integrated</template>
      <template #content>
        <div class="form">
          <div class="field">
            <label class="field__label">Tenant ID (X-Tenant-ID) *</label>
            <InputText v-model="tenantId" placeholder="UUID" class="w-full" />
          </div>

          <div class="field">
            <label class="field__label">Bearer token (Authorization) *</label>
            <Textarea v-model="token" rows="5" placeholder="Paste JWT here" class="w-full" />
          </div>

          <div class="actions">
            <Button label="Clear" severity="secondary" outlined @click="clear()" />
            <Button label="Save" :disabled="!tenantId || !token" @click="save()" />
          </div>

          <Message v-if="auth.isConfigured.value" severity="success" class="mt-3">
            Configured. You can now browse events and manage registrations.
          </Message>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Textarea from 'primevue/textarea'
import { computed, ref } from 'vue'
import { useDevAuth } from '~/composables/useDevAuth'
import { useToast } from '~/composables/useToast'

const auth = useDevAuth()
const toast = useToast()

const tenantId = ref(auth.tenantId.value || '')
const token = ref(auth.token.value || '')

const canSave = computed(() => !!tenantId.value.trim() && !!token.value.trim())

function save() {
  if (!canSave.value) return
  auth.setTenantId(tenantId.value)
  auth.setToken(token.value)
  toast.success('Saved')
}

function clear() {
  tenantId.value = ''
  token.value = ''
  auth.clear()
  toast.info('Cleared')
}
</script>

<style scoped>
.page {
  padding: var(--spacing-xl, 2rem);
  max-width: 960px;
  margin: 0 auto;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 1.5rem);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
}

.field__label {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 0.75rem);
}

.mt-3 {
  margin-top: var(--spacing-md, 1rem);
}
</style>

