<template>
  <div class="tenant-form">
    <div class="form-group">
      <label for="name">Name *</label>
      <InputText
        id="name"
        v-model="form.name"
        placeholder="e.g., First Church"
        class="w-full"
      />
    </div>

    <div class="form-group">
      <label for="slug">Slug *</label>
      <InputText
        id="slug"
        v-model="form.slug"
        @input="slugManuallyEdited = true"
        placeholder="e.g., first-church"
        class="w-full"
      />
      <small>Used in URLs. Must be unique.</small>
    </div>

    <div class="form-group">
      <label for="domain">Domain</label>
      <InputText
        id="domain"
        v-model="form.domain"
        placeholder="e.g., firstchurch.example.com"
        class="w-full"
      />
      <small>Optional custom domain for this tenant</small>
    </div>

    <div class="form-group">
      <label for="logoUrl">Logo URL</label>
      <InputText
        id="logoUrl"
        v-model="form.logoUrl"
        placeholder="https://example.com/logo.png"
        class="w-full"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="primaryColor">Primary Color</label>
        <InputText
          id="primaryColor"
          v-model="form.primaryColor"
          placeholder="#0066CC"
          class="w-full"
        />
      </div>

      <div class="form-group">
        <label for="secondaryColor">Secondary Color</label>
        <InputText
          id="secondaryColor"
          v-model="form.secondaryColor"
          placeholder="#FF6600"
          class="w-full"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="timezone">Timezone</label>
        <InputText
          id="timezone"
          v-model="form.timezone"
          placeholder="UTC"
          class="w-full"
        />
      </div>

      <div class="form-group">
        <label for="locale">Locale</label>
        <InputText
          id="locale"
          v-model="form.locale"
          placeholder="en"
          class="w-full"
        />
      </div>

      <div class="form-group">
        <label for="currency">Currency</label>
        <InputText
          id="currency"
          v-model="form.currency"
          placeholder="USD"
          class="w-full"
          maxlength="3"
        />
      </div>
    </div>

    <div class="form-group">
      <Checkbox
        v-model="form.isActive"
        :input-id="'isActive'"
        :binary="true"
      />
      <label for="isActive" class="ml-2">Active</label>
      <small class="block mt-1">Inactive tenants cannot be accessed</small>
    </div>

    <div class="form-actions">
      <Button
        label="Cancel"
        severity="secondary"
        @click="$emit('cancel')"
      />
      <Button
        :label="isNew ? 'Create Tenant' : 'Update Tenant'"
        :loading="loading"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { useToast } from '~/composables/useToast'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import type { Tenant } from './types'

interface Props {
  tenant?: Partial<Tenant> | null
  isNew?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tenant: null,
  isNew: false,
})

const emit = defineEmits<{
  saved: [tenant: Tenant]
  cancel: []
}>()

const toast = useToast()
const auth = useSuperAdminAuth()
const loading = ref(false)
const slugManuallyEdited = ref(false)
const lastAutoSlug = ref('')

const form = ref({
  name: '',
  slug: '',
  domain: '',
  logoUrl: '',
  primaryColor: '',
  secondaryColor: '',
  timezone: 'UTC',
  locale: 'en',
  currency: 'USD',
  isActive: true,
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

watch(
  () => form.value.name,
  (name) => {
    const auto = slugify(name || '')
    if (!slugManuallyEdited.value && (form.value.slug === '' || form.value.slug === lastAutoSlug.value)) {
      form.value.slug = auto
      lastAutoSlug.value = auto
    }
  }
)

watch(
  () => props.tenant,
  (tenant) => {
    if (tenant) {
      form.value = {
        name: tenant.name || '',
        slug: tenant.slug || '',
        domain: tenant.domain || '',
        logoUrl: tenant.logoUrl || '',
        primaryColor: tenant.primaryColor || '',
        secondaryColor: tenant.secondaryColor || '',
        timezone: tenant.timezone || 'UTC',
        locale: tenant.locale || 'en',
        currency: tenant.currency || 'USD',
        isActive: tenant.isActive ?? true,
      }
      slugManuallyEdited.value = true
      lastAutoSlug.value = tenant.slug || ''
    } else {
      // Reset form for new tenant
      form.value = {
        name: '',
        slug: '',
        domain: '',
        logoUrl: '',
        primaryColor: '',
        secondaryColor: '',
        timezone: 'UTC',
        locale: 'en',
        currency: 'USD',
        isActive: true,
      }
      slugManuallyEdited.value = false
      lastAutoSlug.value = ''
    }
  },
  { immediate: true }
)

const isValid = computed(() => {
  return form.value.name.trim().length > 0 && form.value.slug.trim().length > 0
})

async function handleSubmit() {
  if (!isValid.value) {
    toast.error('Please fill in all required fields')
    return
  }

  loading.value = true
  try {
    const config = useRuntimeConfig()
    const url = props.isNew
      ? `${config.public.apiUrl}/api/admin/tenants`
      : `${config.public.apiUrl}/api/admin/tenants/${props.tenant?.id}`

    const payload = {
      name: form.value.name.trim(),
      slug: form.value.slug.trim(),
      domain: form.value.domain.trim() || undefined,
      logoUrl: form.value.logoUrl.trim() || undefined,
      primaryColor: form.value.primaryColor.trim() || undefined,
      secondaryColor: form.value.secondaryColor.trim() || undefined,
      timezone: form.value.timezone.trim() || 'UTC',
      locale: form.value.locale.trim() || 'en',
      currency: form.value.currency.trim().toUpperCase() || 'USD',
      isActive: form.value.isActive,
    }

    const response = await $fetch<{ data: Tenant }>(url, {
      method: props.isNew ? 'POST' : 'PATCH',
      headers: {
        ...auth.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })

    emit('saved', response.data)
    toast.success(props.isNew ? 'Tenant created successfully' : 'Tenant updated successfully')
  } catch (error: any) {
    toast.error(
      props.isNew ? 'Failed to create tenant' : 'Failed to update tenant',
      error.data?.error || error.message
    )
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.tenant-form {
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

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md, 1rem);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 0.5rem);
  margin-top: var(--spacing-md, 1rem);
}
</style>
