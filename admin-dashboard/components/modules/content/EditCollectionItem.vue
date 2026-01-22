<template>
  <div class="edit-collection-item">
    <form @submit.prevent="handleSubmit">
      <div
        v-for="field in collection.fields"
        :key="field.id"
        class="form-group"
      >
        <label :for="field.slug">
          {{ field.name }}
          <span v-if="field.isRequired" class="required">*</span>
        </label>
        
        <InputText
          v-if="field.type === 'text'"
          :id="field.slug"
          v-model="formData[field.slug]"
          class="w-full"
        />
        
        <InputNumber
          v-else-if="field.type === 'number'"
          :id="field.slug"
          v-model="formData[field.slug]"
          class="w-full"
        />
        
        <Calendar
          v-else-if="field.type === 'date'"
          :id="field.slug"
          v-model="formData[field.slug]"
          date-format="yyyy-mm-dd"
          class="w-full"
        />
        
        <Checkbox
          v-else-if="field.type === 'boolean'"
          :id="field.slug"
          v-model="formData[field.slug]"
          :binary="true"
        />
        
        <Textarea
          v-else-if="field.type === 'json'"
          :id="field.slug"
          v-model="formData[field.slug]"
          rows="5"
          class="w-full"
        />
        
        <InputText
          v-else
          :id="field.slug"
          v-model="formData[field.slug]"
          class="w-full"
        />
      </div>

      <div class="form-actions">
        <Button
          label="Cancel"
          severity="secondary"
          @click="$emit('cancel')"
        />
        <Button
          label="Save"
          type="submit"
          :loading="loading"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useToast } from '~/composables/useToast'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import type { Collection, CollectionFieldType, CollectionItem } from './types'

interface Props {
  collection: Collection
  item: Partial<CollectionItem>
  isNew?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const toast = useToast()
const auth = useSuperAdminAuth()
const loading = ref(false)
const formData = ref<Record<string, any>>({})

function toFormValue(type: CollectionFieldType, value: unknown) {
  if (value === undefined || value === null) {
    if (type === 'boolean') return false
    if (type === 'number') return null
    if (type === 'date') return null
    if (type === 'json') return ''
    return ''
  }

  if (type === 'date') {
    if (value instanceof Date) return value
    const parsed = new Date(String(value))
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (type === 'number') {
    if (typeof value === 'number') return value
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }

  if (type === 'boolean') {
    if (typeof value === 'boolean') return value
    if (value === 'true') return true
    if (value === 'false') return false
    return Boolean(value)
  }

  if (type === 'json') {
    if (typeof value === 'string') return value
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  return String(value)
}

function buildInitialFormData() {
  const next: Record<string, any> = {}
  for (const field of props.collection.fields) {
    next[field.slug] = toFormValue(field.type as CollectionFieldType, (props.item as any)?.[field.slug])
  }
  formData.value = next
}

watch(
  () => [props.collection.id, props.item?.id],
  () => {
    buildInitialFormData()
  },
  { immediate: true }
)

function isEmptyValue(value: unknown) {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim().length === 0
  return false
}

function toApiPayload() {
  const payload: Record<string, any> = {}

  for (const field of props.collection.fields) {
    const value = formData.value[field.slug]

    // Required validation
    if (field.isRequired && isEmptyValue(value)) {
      throw new Error(`Field "${field.name}" is required`)
    }

    if (field.type === 'json') {
      const raw = typeof value === 'string' ? value.trim() : value
      if (raw === '' || raw === null || raw === undefined) {
        payload[field.slug] = null
        continue
      }
      if (typeof raw === 'string') {
        try {
          payload[field.slug] = JSON.parse(raw)
        } catch {
          throw new Error(`Invalid JSON in "${field.name}"`)
        }
      } else {
        payload[field.slug] = raw
      }
      continue
    }

    payload[field.slug] = value
  }

  return payload
}

async function handleSubmit() {
  loading.value = true
  try {
    const config = useRuntimeConfig()
    const url = props.isNew
      ? `${config.public.apiUrl}/api/admin/collections/${props.collection.id}/items`
      : `${config.public.apiUrl}/api/admin/collections/${props.collection.id}/items/${props.item.id}`
    
    const payload = toApiPayload()

    await $fetch(url, {
      method: props.isNew ? 'POST' : 'PATCH',
      headers: {
        ...auth.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: payload,
    })
    toast.success(props.isNew ? 'Item created successfully' : 'Item updated successfully')
    emit('saved')
  } catch (error: any) {
    toast.error(props.isNew ? 'Failed to create item' : 'Failed to update item', error.message)
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.edit-collection-item {
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

.required {
  color: var(--p-danger-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 0.5rem);
  margin-top: var(--spacing-md, 1rem);
}
</style>
