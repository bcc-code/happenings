<template>
  <div class="form-builder">
    <form @submit.prevent="handleSubmit" class="form-builder-form">
      <!-- Form Header -->
      <div v-if="schema.title || schema.description" class="form-header">
        <h2 v-if="schema.title" class="form-title">{{ schema.title }}</h2>
        <p v-if="schema.description" class="form-description">{{ schema.description }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="form-loading">
        <ProgressSpinner />
        <p>Loading form...</p>
      </div>

      <!-- Form Content -->
      <div v-else class="form-content">
        <!-- Render by Sections -->
        <template v-if="schema.sections && schema.sections.length > 0">
          <div
            v-for="(section, sectionIndex) in orderedSections"
            :key="sectionIndex"
            class="form-section"
          >
            <Panel
              v-if="section.collapsible"
              :header="section.title"
              :collapsed="section.collapsed"
              toggleable
            >
              <p v-if="section.description" class="section-description">
                {{ section.description }}
              </p>
              <FormFieldGroup
                :fields="getSectionFields(section)"
                :model-value="localValue"
                :relationship-data="relationshipData"
                :readonly="readonly"
                :layout="schema.layout || 'single'"
                @update:model-value="updateValue"
                @field-change="onFieldChange"
                @relationship-load="onRelationshipLoad"
                @relationship-add="onRelationshipAdd"
                @relationship-remove="onRelationshipRemove"
                @relationship-edit="onRelationshipEdit"
              />
            </Panel>
            <div v-else>
              <h3 v-if="section.title" class="section-title">{{ section.title }}</h3>
              <p v-if="section.description" class="section-description">
                {{ section.description }}
              </p>
              <FormFieldGroup
                :fields="getSectionFields(section)"
                :model-value="localValue"
                :relationship-data="relationshipData"
                :readonly="readonly"
                :layout="schema.layout || 'single'"
                @update:model-value="updateValue"
                @field-change="onFieldChange"
                @relationship-load="onRelationshipLoad"
                @relationship-add="onRelationshipAdd"
                @relationship-remove="onRelationshipRemove"
                @relationship-edit="onRelationshipEdit"
              />
            </div>
          </div>
        </template>

        <!-- Render without Sections -->
        <template v-else>
          <FormFieldGroup
            :fields="visibleFields"
            :model-value="localValue"
            :relationship-data="relationshipData"
            :readonly="readonly"
            :layout="schema.layout || 'single'"
            @update:model-value="updateValue"
            @field-change="onFieldChange"
            @relationship-load="onRelationshipLoad"
            @relationship-add="onRelationshipAdd"
            @relationship-remove="onRelationshipRemove"
            @relationship-edit="onRelationshipEdit"
          />
        </template>

        <!-- Validation Errors Summary -->
        <Message
          v-if="Object.keys(validationErrors).length > 0"
          severity="error"
          :closable="false"
          class="form-errors-summary"
        >
          <template #messageicon>
            <i class="pi pi-exclamation-triangle" />
          </template>
          <div class="errors-list">
            <div v-for="(error, field) in validationErrors" :key="field" class="error-item">
              <strong>{{ getFieldLabel(field) }}:</strong> {{ error }}
            </div>
          </div>
        </Message>
      </div>

      <!-- Form Actions -->
      <div v-if="showActions" class="form-actions">
        <Button
          type="button"
          :label="cancelLabel"
          severity="secondary"
          outlined
          @click="handleCancel"
        />
        <Button
          type="submit"
          :label="submitLabel"
          :loading="submitting"
          :disabled="!isValid"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, watch } from 'vue'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import FormFieldGroup from './FormFieldGroup.vue'
import type {
  FormSchema,
  FormField,
  FormSection,
  RelationshipData,
  FormBuilderProps,
  FormBuilderEmits,
  FormValidationError,
} from './types'
import { validateField, validateForm } from './validation'

const props = withDefaults(defineProps<FormBuilderProps>(), {
  loading: false,
  readonly: false,
  showActions: true,
  submitLabel: 'Save',
  cancelLabel: 'Cancel',
  relationshipData: () => ({}),
})

const emit = defineEmits<FormBuilderEmits>()

const localValue = ref<Record<string, any>>({ ...props.modelValue })
const validationErrors = ref<Record<string, string>>({})
const submitting = ref(false)

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = { ...newValue }
  },
  { deep: true }
)

// Computed properties
const orderedSections = computed(() => {
  if (!props.schema.sections) return []
  return [...props.schema.sections].sort((a, b) => {
    const aOrder = a.fields[0] ? getFieldOrder(a.fields[0]) : 0
    const bOrder = b.fields[0] ? getFieldOrder(b.fields[0]) : 0
    return aOrder - bOrder
  })
})

const visibleFields = computed(() => {
  return props.schema.fields.filter((field) => {
    if (field.hidden) return false
    if (field.showIf) {
      return evaluateCondition(field.showIf)
    }
    return true
  })
})

const isValid = computed(() => {
  return Object.keys(validationErrors.value).length === 0
})

const submitLabel = computed(() => {
  return props.submitLabel || props.schema.submitLabel || 'Save'
})

const cancelLabel = computed(() => {
  return props.cancelLabel || props.schema.cancelLabel || 'Cancel'
})

// Methods
const getSectionFields = (section: FormSection): FormField[] => {
  return props.schema.fields.filter((field) => section.fields.includes(field.name))
}

const getFieldOrder = (fieldName: string): number => {
  const field = props.schema.fields.find((f) => f.name === fieldName)
  return field?.groupOrder || 0
}

const getFieldLabel = (fieldName: string): string => {
  const field = props.schema.fields.find((f) => f.name === fieldName)
  return field?.label || fieldName
}

const evaluateCondition = (condition: FormField['showIf']): boolean => {
  if (!condition) return true
  
  const fieldValue = localValue.value[condition.field]
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value
    case 'notEquals':
      return fieldValue !== condition.value
    case 'contains':
      return String(fieldValue).includes(String(condition.value))
    case 'greaterThan':
      return Number(fieldValue) > Number(condition.value)
    case 'lessThan':
      return Number(fieldValue) < Number(condition.value)
    default:
      return true
  }
}

const updateValue = (value: Record<string, any>) => {
  localValue.value = { ...localValue.value, ...value }
  emit('update:modelValue', localValue.value)
  
  // Validate on change
  validateFormFields()
}

const onFieldChange = (field: string, value: any) => {
  localValue.value[field] = value
  emit('update:modelValue', localValue.value)
  emit('field-change', field, value)
  
  // Validate single field
  const fieldDef = props.schema.fields.find((f) => f.name === field)
  if (fieldDef) {
    const error = validateField(fieldDef, value, localValue.value)
    if (error) {
      validationErrors.value[field] = error
    } else {
      delete validationErrors.value[field]
    }
  }
}

const validateFormFields = () => {
  const errors = validateForm(props.schema, localValue.value)
  validationErrors.value = errors
}

const handleSubmit = async () => {
  validateFormFields()
  
  if (!isValid.value) {
    return
  }
  
  submitting.value = true
  try {
    emit('submit', localValue.value)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const onRelationshipLoad = (field: string, search?: string) => {
  emit('relationship-load', field, search)
}

const onRelationshipAdd = (field: string, item: any) => {
  emit('relationship-add', field, item)
}

const onRelationshipRemove = (field: string, itemId: string) => {
  emit('relationship-remove', field, itemId)
}

const onRelationshipEdit = (field: string, item: any) => {
  emit('relationship-edit', field, item)
}

// Initial validation
watch(
  () => localValue.value,
  () => {
    validateFormFields()
  },
  { deep: true, immediate: true }
)
</script>

<style scoped lang="css">
.form-builder {
  width: 100%;
}

.form-builder-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-header {
  margin-bottom: 1rem;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color, #212529);
}

.form-description {
  color: var(--text-color-secondary, #6c757d);
  font-size: 0.875rem;
}

.form-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color, #212529);
}

.section-description {
  color: var(--text-color-secondary, #6c757d);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-errors-summary {
  margin-top: 1rem;
}

.errors-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-item {
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-200, #e0e0e0);
}

:deep(.p-panel-header) {
  background: var(--surface-50, #fafafa);
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
}

:deep(.p-panel-content) {
  padding: 1.5rem;
}
</style>
