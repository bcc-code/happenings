<template>
  <div class="form-builder-demo">
    <div class="demo-header">
      <h1>FormBuilder Component Demo</h1>
      <p>Dynamic form builder with JSON schema support and relationships</p>
    </div>

    <div class="demo-content">
      <!-- Schema Selector -->
      <div class="schema-selector">
        <label>Select Schema:</label>
        <SelectButton
          v-model="selectedSchema"
          :options="schemaOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <!-- Form Builder -->
      <div class="form-container">
        <FormBuilder
          :schema="currentSchema"
          :model-value="formData"
          :relationship-data="relationshipData"
          :loading="loading"
          @update:model-value="onFormUpdate"
          @submit="onFormSubmit"
          @cancel="onFormCancel"
          @relationship-load="onRelationshipLoad"
          @relationship-add="onRelationshipAdd"
          @relationship-remove="onRelationshipRemove"
        />
      </div>

      <!-- Form Data Display -->
      <div class="form-data-display">
        <h3>Form Data (JSON)</h3>
        <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FormBuilder, createEventFormSchema } from '~/components/admin/form-builder'
import type { FormSchema, RelationshipData } from '~/components/admin/form-builder/types'
import SelectButton from 'primevue/selectbutton'

// Schema options
const schemaOptions = [
  { label: 'Event Form', value: 'event' },
  { label: 'User Form', value: 'user' },
  { label: 'Registration Form', value: 'registration' },
]

const selectedSchema = ref('event')
const loading = ref(false)
const formData = ref<Record<string, any>>({})
const relationshipData = ref<Record<string, RelationshipData>>({})

// Event schema
const eventSchema: FormSchema = createEventFormSchema()

// User schema
const userSchema: FormSchema = {
  table: 'User',
  title: 'User Information',
  description: 'Create or edit user details',
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'user@example.com',
      validation: [
        { type: 'email', message: 'Please enter a valid email address' },
      ],
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Enter first name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Enter last name',
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number',
    },
    {
      name: 'timezone',
      label: 'Timezone',
      type: 'select',
      options: [
        { label: 'UTC', value: 'UTC' },
        { label: 'America/New_York', value: 'America/New_York' },
        { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
        { label: 'Europe/London', value: 'Europe/London' },
      ],
      defaultValue: 'UTC',
    },
  ],
}

// Registration schema with relationships
const registrationSchema: FormSchema = {
  table: 'Registration',
  title: 'Event Registration',
  description: 'Register a user for an event',
  fields: [
    {
      name: 'userId',
      label: 'User',
      type: 'relationship',
      relationship: {
        type: 'manyToOne',
        table: 'User',
        foreignKey: 'userId',
        displayField: 'email',
        valueField: 'id',
      },
      required: true,
    },
    {
      name: 'eventId',
      label: 'Event',
      type: 'relationship',
      relationship: {
        type: 'manyToOne',
        table: 'Event',
        foreignKey: 'eventId',
        displayField: 'title',
        valueField: 'id',
      },
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'basePrice',
      label: 'Base Price',
      type: 'decimal',
      min: 0,
      placeholder: '0.00',
    },
    {
      name: 'sessions',
      label: 'Sessions',
      type: 'relationshipMany',
      relationship: {
        type: 'oneToMany',
        table: 'Session',
        foreignKey: 'registrationId',
        displayField: 'title',
      },
    },
  ],
  sections: [
    {
      title: 'Registration Details',
      fields: ['userId', 'eventId', 'status'],
    },
    {
      title: 'Pricing',
      fields: ['basePrice'],
    },
    {
      title: 'Sessions',
      fields: ['sessions'],
    },
  ],
}

const currentSchema = computed(() => {
  switch (selectedSchema.value) {
    case 'event':
      return eventSchema
    case 'user':
      return userSchema
    case 'registration':
      return registrationSchema
    default:
      return eventSchema
  }
})

// Initialize relationship data
const initializeRelationshipData = () => {
  // Mock data for relationships
  relationshipData.value = {
    tenantId: {
      table: 'Tenant',
      items: [
        { id: '1', name: 'First Church' },
        { id: '2', name: 'Second Church' },
        { id: '3', name: 'Third Church' },
      ],
    },
    userId: {
      table: 'User',
      items: [
        { id: '1', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
        { id: '2', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith' },
        { id: '3', email: 'bob@example.com', firstName: 'Bob', lastName: 'Johnson' },
      ],
    },
    eventId: {
      table: 'Event',
      items: [
        { id: '1', title: 'Summer Conference 2024' },
        { id: '2', title: 'Winter Workshop' },
        { id: '3', title: 'Spring Retreat' },
      ],
    },
  }
}

// Event handlers
const onFormUpdate = (value: Record<string, any>) => {
  formData.value = { ...value }
  console.log('Form updated:', value)
}

const onFormSubmit = (value: Record<string, any>) => {
  console.log('Form submitted:', value)
  // In a real app, this would call an API
  alert('Form submitted! Check console for data.')
}

const onFormCancel = () => {
  console.log('Form cancelled')
  formData.value = {}
}

const onRelationshipLoad = async (field: string, search?: string) => {
  console.log('Loading relationship data for:', field, search)
  loading.value = true
  
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  // In a real app, this would fetch from API
  if (!relationshipData.value[field]) {
    relationshipData.value[field] = {
      table: field,
      items: [],
      loading: false,
    }
  }
  
  relationshipData.value[field].loading = false
  loading.value = false
}

const onRelationshipAdd = (field: string, item: any) => {
  console.log('Adding relationship item:', field, item)
  if (!relationshipData.value[field]) {
    relationshipData.value[field] = {
      table: field,
      items: [],
    }
  }
  
  if (!relationshipData.value[field].items) {
    relationshipData.value[field].items = []
  }
  
  relationshipData.value[field].items.push(item)
  
  // Update form data
  if (!formData.value[field]) {
    formData.value[field] = []
  }
  formData.value[field].push(item)
}

const onRelationshipRemove = (field: string, itemId: string) => {
  console.log('Removing relationship item:', field, itemId)
  if (relationshipData.value[field]?.items) {
    relationshipData.value[field].items = relationshipData.value[field].items.filter(
      (item: any) => (item.id || item[field.replace('Id', '') + 'Id']) !== itemId
    )
  }
  
  // Update form data
  if (formData.value[field]) {
    formData.value[field] = formData.value[field].filter(
      (item: any) => (item.id || item[field.replace('Id', '') + 'Id']) !== itemId
    )
  }
}

// Initialize
initializeRelationshipData()
</script>

<style scoped lang="css">
.form-builder-demo {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.demo-header {
  margin-bottom: 2rem;
}

.demo-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color, #212529);
}

.demo-header p {
  color: var(--text-color-secondary, #6c757d);
  font-size: 1rem;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.schema-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50, #fafafa);
  border-radius: 4px;
}

.schema-selector label {
  font-weight: 600;
  color: var(--text-color, #212529);
}

.form-container {
  background: var(--surface-0, #ffffff);
  border: 1px solid var(--surface-200, #e0e0e0);
  border-radius: 4px;
  padding: 2rem;
}

.form-data-display {
  background: var(--surface-50, #fafafa);
  border: 1px solid var(--surface-200, #e0e0e0);
  border-radius: 4px;
  padding: 1.5rem;
}

.form-data-display h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color, #212529);
}

.form-data-display pre {
  background: var(--surface-0, #ffffff);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-color, #212529);
  border: 1px solid var(--surface-200, #e0e0e0);
}
</style>
