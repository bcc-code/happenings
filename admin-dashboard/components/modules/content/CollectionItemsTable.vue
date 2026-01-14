<template>
  <div class="collection-items-table">
    <div class="table-header">
      <h2>{{ collection.name }}</h2>
      <Button
        label="New Item"
        icon="pi pi-plus"
        @click="handleCreate"
      />
    </div>

    <DataTable
      :value="items"
      :loading="loading"
      :paginator="true"
      :rows="25"
      :rows-per-page-options="[10, 25, 50, 100]"
      edit-mode="cell"
      @cell-edit-complete="onCellEdit"
      @row-click="handleRowClick"
    >
      <Column
        v-for="field in collection.fields"
        :key="field.id"
        :field="field.slug"
        :header="field.name"
        :sortable="true"
      >
        <template #editor="{ data, field: fieldName }">
          <InputText
            v-if="getFieldType(fieldName) === 'text'"
            v-model="data[fieldName]"
            class="w-full"
          />
          <InputNumber
            v-else-if="getFieldType(fieldName) === 'number'"
            v-model="data[fieldName]"
            class="w-full"
          />
          <Calendar
            v-else-if="getFieldType(fieldName) === 'date'"
            v-model="data[fieldName]"
            date-format="yyyy-mm-dd"
            class="w-full"
          />
          <Checkbox
            v-else-if="getFieldType(fieldName) === 'boolean'"
            v-model="data[fieldName]"
            :binary="true"
          />
          <InputText
            v-else
            v-model="data[fieldName]"
            class="w-full"
          />
        </template>
      </Column>
      
      <Column field="created_at" header="Created" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.created_at) }}
        </template>
      </Column>
      
      <Column field="updated_at" header="Updated" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.updated_at) }}
        </template>
      </Column>

      <Column :exportable="false" style="width: 100px">
        <template #body="{ data }">
          <Button
            icon="pi pi-pencil"
            text
            rounded
            @click.stop="handleEdit(data)"
          />
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            @click.stop="handleDelete(data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'

interface Collection {
  id: string
  name: string
  slug: string
  fields: Array<{
    id: string
    name: string
    slug: string
    type: string
  }>
}

interface Props {
  collection: Collection
}

const props = defineProps<Props>()
const emit = defineEmits<{
  editItem: [item: any]
  createItem: []
}>()

const toast = useToast()
const confirm = useConfirm()
const auth = useSuperAdminAuth()
const items = ref<any[]>([])
const loading = ref(false)

const config = useRuntimeConfig()

function getFieldType(fieldSlug: string): string {
  const field = props.collection.fields.find(f => f.slug === fieldSlug)
  return field?.type || 'text'
}

function formatDate(date: string | Date): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

async function loadItems() {
  loading.value = true
  try {
    const response = await $fetch(
      `${config.public.apiUrl}/api/admin/collections/${props.collection.id}/items`,
      {
        headers: auth.getAuthHeaders(),
      }
    )
    items.value = response.data.items
  } catch (error: any) {
    toast.error('Failed to load items', error.message)
  } finally {
    loading.value = false
  }
}

async function onCellEdit(event: any) {
  const { data, newValue, field } = event
  const updateData: Record<string, any> = {}
  updateData[field] = newValue

  try {
    await $fetch(
      `${config.public.apiUrl}/api/admin/collections/${props.collection.id}/items/${data.id}`,
      {
        method: 'PATCH',
        headers: {
          ...auth.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: updateData,
      }
    )
    toast.success('Item updated successfully')
    await loadItems()
  } catch (error: any) {
    toast.error('Failed to update item', error.message)
    await loadItems() // Reload to revert changes
  }
}

function handleRowClick(event: any) {
  // Double click to edit
  if (event.originalEvent.detail === 2) {
    handleEdit(event.data)
  }
}

function handleEdit(item: any) {
  emit('editItem', item)
}

function handleCreate() {
  emit('createItem')
}

async function handleDelete(item: any) {
  const confirmed = await confirm.confirm({
    message: 'Are you sure you want to delete this item?',
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
  })

  if (!confirmed) return

  try {
    await $fetch(
      `${config.public.apiUrl}/api/admin/collections/${props.collection.id}/items/${item.id}`,
      {
        method: 'DELETE',
        headers: auth.getAuthHeaders(),
      }
    )
    toast.success('Item deleted successfully')
    await loadItems()
  } catch (error: any) {
    toast.error('Failed to delete item', error.message)
  }
}


onMounted(() => {
  loadItems()
})
</script>

<style scoped>
.collection-items-table {
  padding: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h2 {
  margin: 0;
}
</style>
