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
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useToast } from '~/composables/useToast'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'

interface Collection {
  id: string
  name: string
  fields: Array<{
    id: string
    name: string
    slug: string
    type: string
    isRequired: boolean
  }>
}

interface Props {
  collection: Collection
  item: any
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

onMounted(() => {
  // Initialize form data from item or empty for new items
  for (const field of props.collection.fields) {
    formData.value[field.slug] = props.item?.[field.slug] ?? ''
  }
})

async function handleSubmit() {
  loading.value = true
  try {
    const config = useRuntimeConfig()
    const url = props.isNew
      ? `${config.public.apiUrl}/api/admin/collections/${props.collection.id}/items`
      : `${config.public.apiUrl}/api/admin/collections/${props.collection.id}/items/${props.item.id}`
    
    await $fetch(url, {
      method: props.isNew ? 'POST' : 'PATCH',
      headers: {
        ...auth.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: formData.value,
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

.required {
  color: var(--p-danger-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
