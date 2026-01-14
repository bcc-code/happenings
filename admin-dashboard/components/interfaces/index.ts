/**
 * Interface Components
 * 
 * Components that interact with users and emit values back.
 * Examples: form inputs, relationship selectors, file uploads, etc.
 */

// Form Builder components
export { default as FormBuilder } from './form-builder/FormBuilder.vue'
export { default as FormField } from './form-builder/FormField.vue'
export { default as FormFieldGroup } from './form-builder/FormFieldGroup.vue'
export { default as RelationshipSelect } from './form-builder/RelationshipSelect.vue'
export { default as RelationshipTable } from './form-builder/RelationshipTable.vue'

export * from './form-builder/schema-converter'
export * from './form-builder/types'
export * from './form-builder/validation'

// Types are exported from widgets/types.ts to avoid duplication
// Import types from '~/components/widgets/types' or '~/components/widgets'
