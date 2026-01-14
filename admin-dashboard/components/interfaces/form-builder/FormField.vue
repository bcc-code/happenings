<template>
  <div class="form-field" :class="[`field-type-${field.type}`, { 'field-error': error }]">
    <label :for="fieldId" class="field-label">
      {{ field.label }}
      <span v-if="field.required" class="field-required">*</span>
    </label>
    
    <div v-if="field.helpText" class="field-help-text">
      {{ field.helpText }}
    </div>

    <!-- Text Input -->
    <InputText
      v-if="field.type === 'text' || field.type === 'email' || field.type === 'url' || field.type === 'password'"
      :id="fieldId"
      :model-value="modelValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled || readonly"
      :readonly="field.readonly"
      :type="getInputType(field.type)"
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- Textarea -->
    <Textarea
      v-else-if="field.type === 'textarea'"
      :id="fieldId"
      :model-value="modelValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled || readonly"
      :readonly="field.readonly"
      :rows="field.rows || 4"
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- Number Input -->
    <InputNumber
      v-else-if="field.type === 'number' || field.type === 'decimal'"
      :id="fieldId"
      :model-value="modelValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled || readonly"
      :readonly="field.readonly"
      :min="field.min"
      :max="field.max"
      :step="field.step || (field.type === 'decimal' ? 0.01 : 1)"
      :mode="field.type === 'decimal' ? 'decimal' : 'decimal'"
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- Date Input -->
    <Calendar
      v-else-if="field.type === 'date'"
      :id="fieldId"
      :model-value="modelValue"
      :placeholder="field.placeholder || 'Select date'"
      :disabled="field.disabled || readonly"
      :readonly="field.readonly"
      dateFormat="yy-mm-dd"
      showIcon
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- DateTime Input -->
    <Calendar
      v-else-if="field.type === 'datetime'"
      :id="fieldId"
      :model-value="modelValue"
      :placeholder="field.placeholder || 'Select date and time'"
      :disabled="field.disabled || readonly"
      :readonly="field.readonly"
      dateFormat="yy-mm-dd"
      showIcon
      showTime
      hourFormat="24"
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- Time Input -->
    <Calendar
      v-else-if="field.type === 'time'"
      :id="fieldId"
      :model-value="modelValue"
      :placeholder="field.placeholder || 'Select time'"
      :disabled="field.disabled || readonly"
      :readonly="field.readonly"
      timeOnly
      hourFormat="24"
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- Boolean (Checkbox) -->
    <div v-else-if="field.type === 'boolean'" class="field-checkbox">
      <Checkbox
        :id="fieldId"
        :model-value="modelValue"
        :disabled="field.disabled || readonly"
        :binary="true"
        :class="{ 'p-invalid': error }"
        @update:model-value="updateValue"
      />
      <label :for="fieldId" class="checkbox-label">
        {{ field.placeholder || 'Yes' }}
      </label>
    </div>

    <!-- Select Dropdown -->
    <Dropdown
      v-else-if="field.type === 'select'"
      :id="fieldId"
      :model-value="modelValue"
      :options="field.options || []"
      optionLabel="label"
      optionValue="value"
      :placeholder="field.placeholder || 'Select...'"
      :disabled="field.disabled || readonly"
      showClear
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- MultiSelect -->
    <MultiSelect
      v-else-if="field.type === 'multiSelect'"
      :id="fieldId"
      :model-value="modelValue"
      :options="field.options || []"
      optionLabel="label"
      optionValue="value"
      :placeholder="field.placeholder || 'Select...'"
      :disabled="field.disabled || readonly"
      display="chip"
      showClear
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- Radio Buttons -->
    <div v-else-if="field.type === 'radio'" class="field-radio-group">
      <div
        v-for="option in field.options"
        :key="option.value"
        class="radio-option"
      >
        <RadioButton
          :id="`${fieldId}-${option.value}`"
          :model-value="modelValue"
          :value="option.value"
          :disabled="field.disabled || readonly"
          @update:model-value="updateValue"
        />
        <label :for="`${fieldId}-${option.value}`" class="radio-label">
          {{ option.label }}
        </label>
      </div>
    </div>

    <!-- File Upload -->
    <FileUpload
      v-else-if="field.type === 'file' || field.type === 'image'"
      :id="fieldId"
      :model-value="modelValue"
      :accept="field.accept"
      :multiple="field.multiple"
      :disabled="field.disabled || readonly"
      mode="basic"
      :class="{ 'p-invalid': error }"
      @select="onFileSelect"
    />

    <!-- JSON Editor -->
    <Textarea
      v-else-if="field.type === 'json'"
      :id="fieldId"
      :model-value="jsonValue"
      :placeholder="field.placeholder || 'Enter JSON...'"
      :disabled="field.disabled || readonly"
      :readonly="field.readonly"
      :rows="field.rows || 6"
      :class="{ 'p-invalid': error }"
      @update:model-value="onJsonChange"
    />

    <!-- Rich Text Editor (simplified - can be enhanced with actual rich text editor) -->
    <Textarea
      v-else-if="field.type === 'richText'"
      :id="fieldId"
      :model-value="modelValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled || readonly"
      :readonly="field.readonly"
      :rows="field.rows || 8"
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
    />

    <!-- Many-to-One Relationship (Select) -->
    <RelationshipSelect
      v-else-if="field.type === 'relationship' && field.relationship?.type === 'manyToOne'"
      :field="field"
      :model-value="modelValue"
      :relationship-data="relationshipData"
      :readonly="readonly"
      :class="{ 'p-invalid': error }"
      @update:model-value="updateValue"
      @load="onRelationshipLoad"
    />

    <!-- One-to-Many Relationship (Sub-table) -->
    <RelationshipTable
      v-else-if="field.type === 'relationshipMany' || (field.type === 'relationship' && field.relationship?.type === 'oneToMany')"
      :field="field"
      :model-value="modelValue"
      :relationship-data="relationshipData"
      :readonly="readonly"
      @add="onRelationshipAdd"
      @remove="onRelationshipRemove"
      @edit="onRelationshipEdit"
    />

    <!-- Error Message -->
    <small v-if="error" class="p-error">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import FileUpload from 'primevue/fileupload'
import RelationshipSelect from './RelationshipSelect.vue'
import RelationshipTable from './RelationshipTable.vue'
import type { FormField as FormFieldType, RelationshipData } from './types'

interface Props {
  field: FormFieldType
  modelValue: any
  relationshipData?: RelationshipData
  readonly?: boolean
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'relationship-load': [search?: string]
  'relationship-add': [item: any]
  'relationship-remove': [itemId: string]
  'relationship-edit': [item: any]
}>()

const fieldId = computed(() => `field-${props.field.name}`)

const getInputType = (type: string): string => {
  const typeMap: Record<string, string> = {
    email: 'email',
    url: 'url',
    password: 'password',
  }
  return typeMap[type] || 'text'
}

const jsonValue = computed({
  get: () => {
    if (!props.modelValue) return ''
    try {
      return typeof props.modelValue === 'string'
        ? props.modelValue
        : JSON.stringify(props.modelValue, null, 2)
    } catch {
      return String(props.modelValue)
    }
  },
  set: (value: string) => {
    try {
      const parsed = JSON.parse(value)
      emit('update:modelValue', parsed)
    } catch {
      emit('update:modelValue', value)
    }
  },
})

const updateValue = (value: any) => {
  emit('update:modelValue', value)
}

const onJsonChange = (value: string) => {
  jsonValue.value = value
}

const onFileSelect = (event: any) => {
  const files = event.files
  if (props.field.multiple) {
    emit('update:modelValue', files)
  } else {
    emit('update:modelValue', files[0])
  }
}

const onRelationshipLoad = (search?: string) => {
  emit('relationship-load', search)
}
</script>

<style scoped lang="css">
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color, #212529);
  margin-bottom: 0.25rem;
}

.field-required {
  color: var(--red-500, #dc3545);
  margin-left: 0.25rem;
}

.field-help-text {
  font-size: 0.75rem;
  color: var(--text-color-secondary, #6c757d);
  margin-top: -0.25rem;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--text-color, #212529);
  cursor: pointer;
}

.field-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-label {
  font-size: 0.875rem;
  color: var(--text-color, #212529);
  cursor: pointer;
}

.field-error :deep(.p-inputtext),
.field-error :deep(.p-inputnumber),
.field-error :deep(.p-calendar),
.field-error :deep(.p-dropdown),
.field-error :deep(.p-multiselect),
.field-error :deep(.p-textarea) {
  border-color: var(--red-500, #dc3545);
}

:deep(.p-error) {
  color: var(--red-500, #dc3545);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
