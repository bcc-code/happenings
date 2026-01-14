<template>
  <div class="relationship-table">
    <div class="relationship-table-header">
      <h4 class="relationship-table-title">
        {{ field.label }}
        <span v-if="field.required" class="field-required">*</span>
      </h4>
      <Button
        v-if="!readonly"
        label="Add"
        icon="pi pi-plus"
        size="small"
        @click="handleAdd"
      />
    </div>

    <div v-if="items.length === 0" class="relationship-table-empty">
      <p>No {{ field.label.toLowerCase() }} added yet.</p>
      <Button
        v-if="!readonly"
        label="Add First Item"
        icon="pi pi-plus"
        outlined
        size="small"
        @click="handleAdd"
      />
    </div>

    <DataTable
      v-else
      :value="items"
      :loading="relationshipData?.loading"
      :paginator="false"
      :stripedRows="true"
      class="relationship-datatable"
    >
      <Column
        v-for="column in tableColumns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :sortable="column.sortable"
      >
        <template #body="{ data }">
          <span v-if="column.type === 'date'">
            {{ formatDate(data[column.field]) }}
          </span>
          <span v-else-if="column.type === 'boolean'">
            {{ data[column.field] ? 'Yes' : 'No' }}
          </span>
          <span v-else>{{ data[column.field] }}</span>
        </template>
      </Column>

      <Column header="Actions" :exportable="false" style="width: 120px">
        <template #body="{ data }">
          <div class="relationship-actions">
            <Button
              v-if="!readonly"
              icon="pi pi-pencil"
              severity="secondary"
              text
              rounded
              size="small"
              @click="handleEdit(data)"
              v-tooltip.top="'Edit'"
            />
            <Button
              v-if="!readonly"
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              size="small"
              @click="handleRemove(data)"
              v-tooltip.top="'Remove'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Add/Edit Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="dialogTitle"
      :modal="true"
      :style="{ width: '600px' }"
      @hide="resetDialog"
    >
      <FormBuilder
        v-if="dialogSchema"
        :schema="dialogSchema"
        :model-value="dialogValue"
        :relationship-data="dialogRelationshipData"
        :show-actions="false"
        @update:model-value="dialogValue = $event"
      />
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          @click="showDialog = false"
        />
        <Button
          label="Save"
          @click="handleSave"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import { computed, ref } from 'vue'
import FormBuilder from './FormBuilder.vue'
import type { FormField, FormSchema, RelationshipData } from './types'

interface Props {
  field: FormField
  modelValue: any[]
  relationshipData?: RelationshipData
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add': [item: any]
  'remove': [itemId: string]
  'edit': [item: any]
}>()

const showDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const dialogValue = ref<Record<string, any>>({})
const dialogItem = ref<any>(null)

const relationship = computed(() => props.field.relationship!)
const tableName = computed(() => relationship.value.table)

const items = computed(() => {
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

// Generate table columns from relationship schema or use defaults
const tableColumns = computed(() => {
  // This would ideally come from the relationship schema
  // For now, use a simple display
  if (items.value.length > 0) {
    const firstItem = items.value[0]
    return Object.keys(firstItem)
      .filter((key) => key !== 'id' && !key.endsWith('Id'))
      .slice(0, 5)
      .map((key) => ({
        field: key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sortable: true,
        type: inferFieldType(firstItem[key]),
      }))
  }
  return []
})

const dialogTitle = computed(() => {
  return dialogMode.value === 'add' ? `Add ${props.field.label}` : `Edit ${props.field.label}`
})

const dialogSchema = computed<FormSchema | null>(() => {
  if (!tableName.value) return null
  
  // Generate a basic schema from the first item or use defaults
  // In a real implementation, this would come from the schema definition
  const fields = tableColumns.value.map((col) => ({
    name: col.field,
    label: col.header,
    type: col.type === 'date' ? 'date' : col.type === 'boolean' ? 'boolean' : 'text',
    required: false,
  }))
  
  return {
    table: tableName.value,
    fields,
  }
})

const dialogRelationshipData = computed(() => {
  return {}
})

const inferFieldType = (value: any): 'text' | 'date' | 'boolean' | 'number' => {
  if (value instanceof Date) return 'date'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  return 'text'
}

const formatDate = (value: any): string => {
  if (!value) return ''
  if (value instanceof Date) {
    return value.toLocaleDateString()
  }
  if (typeof value === 'string') {
    return new Date(value).toLocaleDateString()
  }
  return String(value)
}

const handleAdd = () => {
  dialogMode.value = 'add'
  dialogValue.value = {}
  dialogItem.value = null
  showDialog.value = true
}

const handleEdit = (item: any) => {
  dialogMode.value = 'edit'
  dialogValue.value = { ...item }
  dialogItem.value = item
  showDialog.value = true
}

const handleRemove = (item: any) => {
  if (confirm(`Are you sure you want to remove this item?`)) {
    emit('remove', item.id || item[relationship.value.valueField || 'id'])
  }
}

const handleSave = () => {
  if (dialogMode.value === 'add') {
    emit('add', { ...dialogValue.value, id: crypto.randomUUID() })
  } else {
    emit('edit', { ...dialogItem.value, ...dialogValue.value })
  }
  showDialog.value = false
}

const resetDialog = () => {
  dialogValue.value = {}
  dialogItem.value = null
}
</script>

<style scoped lang="css">
.relationship-table {
  width: 100%;
  border: 1px solid var(--surface-200, #e0e0e0);
  border-radius: 4px;
  padding: 1rem;
  background: var(--surface-0, #ffffff);
}

.relationship-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
}

.relationship-table-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color, #212529);
}

.relationship-table-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-color-secondary, #6c757d);
}

.relationship-table-empty p {
  margin-bottom: 1rem;
}

.relationship-datatable {
  margin-top: 1rem;
}

.relationship-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.field-required {
  color: var(--red-500, #dc3545);
  margin-left: 0.25rem;
}
</style>
