<template>
  <div class="form-field-group" :class="`layout-${layout}`">
    <div
      v-for="field in fields"
      :key="field.name"
      :class="[
        'form-field-wrapper',
        {
          'field-full-width': field.type === 'textarea' || field.type === 'richText' || field.type === 'relationshipMany',
          'field-hidden': field.hidden,
        },
      ]"
    >
      <FormField
        :field="field"
        :model-value="modelValue[field.name]"
        :relationship-data="relationshipData[field.name]"
        :readonly="readonly"
        @update:model-value="updateField(field.name, $event)"
        @relationship-load="onRelationshipLoad"
        @relationship-add="onRelationshipAdd"
        @relationship-remove="onRelationshipRemove"
        @relationship-edit="onRelationshipEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FormField from './FormField.vue'
import type { FormField as FormFieldType, RelationshipData } from './types'

interface Props {
  fields: FormFieldType[]
  modelValue: Record<string, any>
  relationshipData?: Record<string, RelationshipData>
  readonly?: boolean
  layout?: 'single' | 'two-column' | 'three-column'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'single',
  relationshipData: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'field-change': [field: string, value: any]
  'relationship-load': [field: string, search?: string]
  'relationship-add': [field: string, item: any]
  'relationship-remove': [field: string, itemId: string]
  'relationship-edit': [field: string, item: any]
}>()

const updateField = (fieldName: string, value: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [fieldName]: value,
  })
  emit('field-change', fieldName, value)
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
</script>

<style scoped lang="css">
.form-field-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field-group.layout-two-column {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-field-group.layout-three-column {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.form-field-wrapper {
  display: flex;
  flex-direction: column;
}

.form-field-wrapper.field-full-width {
  grid-column: 1 / -1;
}

.form-field-wrapper.field-hidden {
  display: none;
}

@media (max-width: 768px) {
  .form-field-group.layout-two-column,
  .form-field-group.layout-three-column {
    grid-template-columns: 1fr;
  }
}
</style>
