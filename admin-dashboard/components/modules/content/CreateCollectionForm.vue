<template>
  <div class="create-collection-form">
    <div class="form-group">
      <label for="name">Name *</label>
      <InputText
        id="name"
        v-model="form.name"
        placeholder="e.g., Blog Posts"
        class="w-full"
      />
    </div>

    <div class="form-group">
      <label for="slug">Slug *</label>
      <InputText
        id="slug"
        v-model="form.slug"
        placeholder="e.g., blog-posts"
        class="w-full"
      />
      <small>Used in URLs and table names. Must be unique.</small>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <Textarea
        id="description"
        v-model="form.description"
        rows="3"
        class="w-full"
      />
    </div>

    <div class="form-group">
      <div class="fields-header">
        <label>Fields *</label>
        <Button
          label="Add Field"
          icon="pi pi-plus"
          size="small"
          @click="addField"
        />
      </div>

      <div v-for="(field, index) in form.fields" :key="index" class="field-item">
        <div class="field-row">
          <InputText
            v-model="field.name"
            placeholder="Field Name"
            class="flex-1"
          />
          <InputText
            v-model="field.slug"
            placeholder="field-slug"
            class="flex-1"
          />
          <Dropdown
            v-model="field.type"
            :options="fieldTypes"
            option-label="label"
            option-value="value"
            placeholder="Type"
            class="flex-1"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            @click="removeField(index)"
          />
        </div>
        <div class="field-options">
          <Checkbox
            v-model="field.isRequired"
            input-id="required"
            :binary="true"
          />
          <label for="required" class="ml-2">Required</label>
          <Checkbox
            v-model="field.isUnique"
            input-id="unique"
            :binary="true"
            class="ml-4"
          />
          <label for="unique" class="ml-2">Unique</label>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <Button
        label="Cancel"
        severity="secondary"
        @click="$emit('cancel')"
      />
      <Button
        label="Create Collection"
        :loading="loading"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import { useToast } from '~/composables/useToast'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'

const emit = defineEmits<{
  created: [collection: any]
  cancel: []
}>()

const toast = useToast()
const auth = useSuperAdminAuth()
const loading = ref(false)

const fieldTypes = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Date', value: 'date' },
  { label: 'JSON', value: 'json' },
  { label: 'UUID', value: 'uuid' },
]

const form = ref({
  name: '',
  slug: '',
  description: '',
  fields: [
    {
      name: '',
      slug: '',
      type: 'text',
      isRequired: false,
      isUnique: false,
    },
  ],
})

function addField() {
  form.value.fields.push({
    name: '',
    slug: '',
    type: 'text',
    isRequired: false,
    isUnique: false,
  })
}

function removeField(index: number) {
  form.value.fields.splice(index, 1)
}

const isValid = computed(() => {
  return (
    form.value.name &&
    form.value.slug &&
    form.value.fields.length > 0 &&
    form.value.fields.every(
      (f) => f.name && f.slug && f.type
    )
  )
})

async function handleSubmit() {
  if (!isValid.value) {
    toast.error('Please fill in all required fields')
    return
  }

  loading.value = true
  try {
    const config = useRuntimeConfig()
    const response = await $fetch(
      `${config.public.apiUrl}/api/admin/collections`,
      {
        method: 'POST',
        headers: {
          ...auth.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: form.value,
      }
    )
    emit('created', response.data)
  } catch (error: any) {
    toast.error('Failed to create collection', error.message)
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.create-collection-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
}

.fields-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-item {
  padding: 1rem;
  border: 1px solid var(--p-border-color);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.field-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.field-options {
  display: flex;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
