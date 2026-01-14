<template>
  <div class="admin-search-filter">
    <div class="search-filter-header">
      <div class="search-input-wrapper">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText
            v-model="globalSearchValue"
            :placeholder="globalSearchPlaceholder"
            class="global-search-input"
            @input="onGlobalSearch"
          />
        </span>
      </div>
      
      <div class="filter-actions">
        <Button
          v-if="showAdvancedFilters"
          :label="showFilters ? 'Hide Filters' : 'Show Filters'"
          icon="pi pi-filter"
          :outlined="!showFilters"
          @click="toggleFilters"
        />
        <Button
          v-if="hasActiveFilters"
          label="Clear Filters"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="clearAllFilters"
        />
        <Button
          v-if="saveViewEnabled"
          label="Save View"
          icon="pi pi-save"
          outlined
          @click="saveCurrentView"
        />
      </div>
    </div>

    <!-- Advanced Filters Panel -->
    <div v-if="showFilters && fields.length > 0" class="filters-panel">
      <div class="filters-grid">
        <div
          v-for="field in fields"
          :key="field.field"
          class="filter-field"
        >
          <label :for="`filter-${field.field}`" class="filter-label">
            {{ field.label }}
          </label>
          
          <!-- Text Input -->
          <InputText
            v-if="field.type === 'text'"
            :id="`filter-${field.field}`"
            v-model="filterValues[field.field]"
            :placeholder="field.placeholder || `Filter by ${field.label}`"
            @input="onFilterChange(field.field, $event.target.value)"
          />
          
          <!-- Numeric Input -->
          <InputNumber
            v-else-if="field.type === 'numeric'"
            :id="`filter-${field.field}`"
            v-model="filterValues[field.field]"
            :placeholder="field.placeholder"
            :min="field.min"
            :max="field.max"
            @input="onFilterChange(field.field, $event)"
          />
          
          <!-- Date Input -->
          <Calendar
            v-else-if="field.type === 'date'"
            :id="`filter-${field.field}`"
            v-model="filterValues[field.field]"
            :placeholder="field.placeholder || `Select ${field.label}`"
            dateFormat="yy-mm-dd"
            showIcon
            @date-select="onFilterChange(field.field, $event)"
          />
          
          <!-- Date Range -->
          <div v-else-if="field.type === 'dateRange'" class="date-range-wrapper">
            <Calendar
              v-model="filterValues[`${field.field}_from`]"
              :placeholder="`From ${field.label}`"
              dateFormat="yy-mm-dd"
              showIcon
              @date-select="onDateRangeChange(field.field, 'from', $event)"
            />
            <span class="date-range-separator">to</span>
            <Calendar
              v-model="filterValues[`${field.field}_to`]"
              :placeholder="`To ${field.label}`"
              dateFormat="yy-mm-dd"
              showIcon
              @date-select="onDateRangeChange(field.field, 'to', $event)"
            />
          </div>
          
          <!-- Boolean Toggle -->
          <SelectButton
            v-else-if="field.type === 'boolean'"
            :id="`filter-${field.field}`"
            v-model="filterValues[field.field]"
            :options="booleanOptions"
            optionLabel="label"
            optionValue="value"
            @change="onFilterChange(field.field, $event.value)"
          />
          
          <!-- Single Select -->
          <Dropdown
            v-else-if="field.type === 'select'"
            :id="`filter-${field.field}`"
            v-model="filterValues[field.field]"
            :options="field.options || []"
            optionLabel="label"
            optionValue="value"
            :placeholder="field.placeholder || `Select ${field.label}`"
            showClear
            @change="onFilterChange(field.field, $event.value)"
          />
          
          <!-- Multi Select -->
          <MultiSelect
            v-else-if="field.type === 'multiSelect'"
            :id="`filter-${field.field}`"
            v-model="filterValues[field.field]"
            :options="field.options || []"
            optionLabel="label"
            optionValue="value"
            :placeholder="field.placeholder || `Select ${field.label}`"
            display="chip"
            showClear
            @change="onFilterChange(field.field, $event.value)"
          />
        </div>
      </div>
      
      <!-- Filter Operator -->
      <div v-if="fields.length > 1" class="filter-operator">
        <label>Filter Logic:</label>
        <SelectButton
          v-model="filterOperator"
          :options="operatorOptions"
          optionLabel="label"
          optionValue="value"
          @change="onOperatorChange"
        />
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters && showActiveFilters" class="active-filters">
      <div class="active-filters-label">Active Filters:</div>
      <div class="active-filters-chips">
        <Chip
          v-for="(filter, key) in activeFiltersDisplay"
          :key="key"
          :label="filter.label"
          removable
          @remove="removeFilter(key)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import SelectButton from 'primevue/selectbutton'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import type { SearchFilterField, SearchFilterValue } from './types'

interface Props {
  fields: SearchFilterField[]
  globalSearchPlaceholder?: string
  showAdvancedFilters?: boolean
  showActiveFilters?: boolean
  saveViewEnabled?: boolean
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  globalSearchPlaceholder: 'Search...',
  showAdvancedFilters: true,
  showActiveFilters: true,
  saveViewEnabled: false,
  debounceMs: 300,
})

const emit = defineEmits<{
  'search': [value: string]
  'filter-change': [filters: Record<string, SearchFilterValue>]
  'clear': []
  'save-view': [view: { name: string; filters: Record<string, any> }]
}>()

const globalSearchValue = ref('')
const filterValues = ref<Record<string, any>>({})
const showFilters = ref(false)
const filterOperator = ref<'and' | 'or'>('and')

const booleanOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]

const operatorOptions = [
  { label: 'AND', value: 'and' },
  { label: 'OR', value: 'or' },
]

// Initialize filter values
watch(
  () => props.fields,
  (newFields) => {
    newFields.forEach((field) => {
      if (field.type === 'dateRange') {
        if (!filterValues.value[`${field.field}_from`]) {
          filterValues.value[`${field.field}_from`] = null
        }
        if (!filterValues.value[`${field.field}_to`]) {
          filterValues.value[`${field.field}_to`] = null
        }
      } else if (!(field.field in filterValues.value)) {
        filterValues.value[field.field] = null
      }
    })
  },
  { immediate: true }
)

// Check if there are active filters
const hasActiveFilters = computed(() => {
  if (globalSearchValue.value) return true
  
  return Object.values(filterValues.value).some((value) => {
    if (Array.isArray(value)) return value.length > 0
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    return true
  })
})

// Active filters display
const activeFiltersDisplay = computed(() => {
  const active: Record<string, { label: string; value: any }> = {}
  
  if (globalSearchValue.value) {
    active['global'] = {
      label: `Search: "${globalSearchValue.value}"`,
      value: globalSearchValue.value,
    }
  }
  
  props.fields.forEach((field) => {
    const value = filterValues.value[field.field]
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        active[field.field] = {
          label: `${field.label}: ${value.length} selected`,
          value,
        }
      } else if (typeof value === 'string' && value.trim().length > 0) {
        active[field.field] = {
          label: `${field.label}: ${value}`,
          value,
        }
      } else if (typeof value !== 'string') {
        active[field.field] = {
          label: `${field.label}: ${formatFilterValue(field, value)}`,
          value,
        }
      }
    }
    
    // Handle date range
    if (field.type === 'dateRange') {
      const from = filterValues.value[`${field.field}_from`]
      const to = filterValues.value[`${field.field}_to`]
      if (from || to) {
        active[`${field.field}_range`] = {
          label: `${field.label}: ${from ? formatDate(from) : '...'} - ${to ? formatDate(to) : '...'}`,
          value: { from, to },
        }
      }
    }
  })
  
  return active
})

// Debounce timer
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// Global search handler
const onGlobalSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  searchDebounceTimer = setTimeout(() => {
    emit('search', globalSearchValue.value)
  }, props.debounceMs)
}

// Filter change handler
const onFilterChange = (field: string, value: any) => {
  filterValues.value[field] = value
  emitFilterChange()
}

// Date range change handler
const onDateRangeChange = (field: string, type: 'from' | 'to', value: any) => {
  filterValues.value[`${field}_${type}`] = value
  emitFilterChange()
}

// Emit filter change
const emitFilterChange = () => {
  const filters: Record<string, SearchFilterValue> = {}
  
  props.fields.forEach((field) => {
    const value = filterValues.value[field.field]
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        filters[field.field] = {
          field: field.field,
          value,
          operator: filterOperator.value,
          matchMode: 'in',
        }
      } else if (typeof value === 'string' && value.trim().length > 0) {
        filters[field.field] = {
          field: field.field,
          value: value.trim(),
          operator: filterOperator.value,
          matchMode: 'contains',
        }
      } else if (typeof value !== 'string') {
        filters[field.field] = {
          field: field.field,
          value,
          operator: filterOperator.value,
          matchMode: 'equals',
        }
      }
    }
    
    // Handle date range
    if (field.type === 'dateRange') {
      const from = filterValues.value[`${field.field}_from`]
      const to = filterValues.value[`${field.field}_to`]
      if (from || to) {
        filters[field.field] = {
          field: field.field,
          value: { from, to },
          operator: filterOperator.value,
          matchMode: 'between',
        }
      }
    }
  })
  
  emit('filter-change', filters)
}

// Operator change handler
const onOperatorChange = () => {
  emitFilterChange()
}

// Toggle filters panel
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// Clear all filters
const clearAllFilters = () => {
  globalSearchValue.value = ''
  filterValues.value = {}
  props.fields.forEach((field) => {
    if (field.type === 'dateRange') {
      filterValues.value[`${field.field}_from`] = null
      filterValues.value[`${field.field}_to`] = null
    } else {
      filterValues.value[field.field] = null
    }
  })
  emit('clear')
  emitFilterChange()
}

// Remove specific filter
const removeFilter = (key: string) => {
  if (key === 'global') {
    globalSearchValue.value = ''
    emit('search', '')
  } else if (key.endsWith('_range')) {
    const field = key.replace('_range', '')
    filterValues.value[`${field}_from`] = null
    filterValues.value[`${field}_to`] = null
  } else {
    filterValues.value[key] = null
  }
  emitFilterChange()
}

// Save current view
const saveCurrentView = () => {
  // This would typically open a dialog to name the view
  // For now, emit with a default name
  emit('save-view', {
    name: 'Custom View',
    filters: {
      globalSearch: globalSearchValue.value,
      filters: { ...filterValues.value },
      operator: filterOperator.value,
    },
  })
}

// Format filter value for display
const formatFilterValue = (field: SearchFilterField, value: any): string => {
  if (field.type === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (field.type === 'date' && value instanceof Date) {
    return formatDate(value)
  }
  if (field.options) {
    const option = field.options.find((opt) => opt.value === value)
    return option ? option.label : String(value)
  }
  return String(value)
}

// Format date
const formatDate = (date: Date | string): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})
</script>

<style scoped lang="css">
.admin-search-filter {
  width: 100%;
  margin-bottom: 1rem;
}

.search-filter-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.search-input-wrapper {
  flex: 1;
  max-width: 400px;
}

.global-search-input {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filters-panel {
  padding: 1rem;
  background: var(--surface-50, #fafafa);
  border: 1px solid var(--surface-200, #e0e0e0);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color, #212529);
}

.date-range-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.date-range-separator {
  color: var(--text-color-secondary, #6c757d);
  font-size: 0.875rem;
}

.filter-operator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-200, #e0e0e0);
}

.filter-operator label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color, #212529);
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-50, #fafafa);
  border: 1px solid var(--surface-200, #e0e0e0);
  border-radius: 4px;
  flex-wrap: wrap;
}

.active-filters-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-color, #212529);
}

.active-filters-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

:deep(.p-inputtext),
:deep(.p-inputnumber),
:deep(.p-calendar),
:deep(.p-dropdown),
:deep(.p-multiselect) {
  width: 100%;
}
</style>
