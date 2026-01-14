<template>
  <div class="relationship-select">
    <AutoComplete
      v-if="field.relationship?.loadOptions"
      :model-value="selectedItem"
      :suggestions="suggestions"
      :placeholder="field.placeholder || `Select ${field.label}...`"
      :disabled="field.disabled || readonly"
      :loading="loading"
      optionLabel="display"
      :completeMethod="loadOptions"
      @item-select="onSelect"
      @clear="onClear"
      class="relationship-autocomplete"
    />
    <Dropdown
      v-else
      :model-value="modelValue"
      :options="options"
      optionLabel="display"
      optionValue="value"
      :placeholder="field.placeholder || `Select ${field.label}...`"
      :disabled="field.disabled || readonly || loading"
      :loading="loading"
      showClear
      filter
      :filterFields="[displayField]"
      @update:model-value="updateValue"
      class="relationship-dropdown"
    >
      <template #value="slotProps">
        <div v-if="slotProps.value" class="relationship-value">
          {{ getDisplayValue(slotProps.value) }}
        </div>
        <span v-else class="relationship-placeholder">
          {{ field.placeholder || `Select ${field.label}...` }}
        </span>
      </template>
      <template #option="slotProps">
        <div class="relationship-option">
          {{ slotProps.option.display }}
        </div>
      </template>
    </Dropdown>
    
    <small v-if="relationshipData?.error" class="p-error">
      {{ relationshipData.error }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import Dropdown from 'primevue/dropdown'
import type { FormField, RelationshipData } from './types'

interface Props {
  field: FormField
  modelValue: any
  relationshipData?: RelationshipData
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'load': [search?: string]
}>()

const loading = ref(false)
const suggestions = ref<any[]>([])
const selectedItem = ref<any>(null)

const relationship = computed(() => props.field.relationship!)
const displayField = computed(() => relationship.value.displayField || 'name')
const valueField = computed(() => relationship.value.valueField || 'id')

const options = computed(() => {
  if (!props.relationshipData?.items) return []
  
  return props.relationshipData.items.map((item) => ({
    value: item[valueField.value],
    display: item[displayField.value],
    data: item,
  }))
})

const getDisplayValue = (value: any): string => {
  if (!value) return ''
  const option = options.value.find((opt) => opt.value === value)
  return option ? option.display : String(value)
}

const updateValue = (value: any) => {
  emit('update:modelValue', value)
}

const loadOptions = async (event: any) => {
  const search = event.query
  loading.value = true
  
  try {
    if (relationship.value.loadOptions) {
      const items = await relationship.value.loadOptions(search)
      suggestions.value = items.map((item) => ({
        ...item,
        display: item[displayField.value],
      }))
    } else {
      emit('load', search)
    }
  } catch (error) {
    console.error('Error loading relationship options:', error)
  } finally {
    loading.value = false
  }
}

const onSelect = (event: any) => {
  selectedItem.value = event.value
  emit('update:modelValue', event.value[valueField.value])
}

const onClear = () => {
  selectedItem.value = null
  emit('update:modelValue', null)
}

// Load initial data if not async
onMounted(() => {
  if (!relationship.value.loadOptions && props.relationshipData?.items) {
    // Data already loaded
  } else if (!props.relationshipData?.items && !relationship.value.loadOptions) {
    // Trigger load
    emit('load')
  }
})

// Watch for relationship data changes
watch(
  () => props.relationshipData?.items,
  (items) => {
    if (items && modelValue.value) {
      const selected = items.find((item) => item[valueField.value] === props.modelValue)
      if (selected) {
        selectedItem.value = {
          ...selected,
          display: selected[displayField.value],
        }
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="css">
.relationship-select {
  width: 100%;
}

.relationship-autocomplete,
.relationship-dropdown {
  width: 100%;
}

.relationship-value {
  display: flex;
  align-items: center;
}

.relationship-placeholder {
  color: var(--text-color-secondary, #6c757d);
}

.relationship-option {
  padding: 0.5rem;
}
</style>
