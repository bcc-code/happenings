/**
 * Types for FormBuilder component
 * Supports JSON schema definitions derived from Drizzle ORM schemas
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'decimal'
  | 'email'
  | 'url'
  | 'password'
  | 'date'
  | 'datetime'
  | 'time'
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'image'
  | 'json'
  | 'richText'
  | 'relationship' // Many-to-one (select)
  | 'relationshipMany' // One-to-many (sub-table)

export type ValidationRule = {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom'
  value?: any
  message?: string
  validator?: (value: any) => boolean | string
}

export interface FormField {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  helpText?: string
  defaultValue?: any
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
  validation?: ValidationRule[]
  
  // Field-specific options
  options?: Array<{ label: string; value: any }> // For select, radio, checkbox
  min?: number // For number, decimal
  max?: number // For number, decimal
  step?: number // For number, decimal
  rows?: number // For textarea
  accept?: string // For file, image
  multiple?: boolean // For file, image, select
  
  // Relationship fields
  relationship?: {
    type: 'manyToOne' | 'oneToMany'
    table: string // Target table name
    foreignKey: string // Foreign key field name
    displayField: string // Field to display in select/list (e.g., 'name', 'title')
    valueField?: string // Field to use as value (defaults to 'id')
    filter?: (item: any) => boolean // Optional filter function
    loadOptions?: (search?: string) => Promise<any[]> // Async option loader
  }
  
  // Conditional visibility
  showIf?: {
    field: string
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
    value: any
  }
  
  // Grouping
  group?: string
  groupOrder?: number
}

export interface FormSection {
  title?: string
  description?: string
  fields: string[] // Field names
  collapsible?: boolean
  collapsed?: boolean
}

export interface FormSchema {
  table: string // Table name
  title?: string
  description?: string
  fields: FormField[]
  sections?: FormSection[]
  layout?: 'single' | 'two-column' | 'three-column'
  submitLabel?: string
  cancelLabel?: string
  autoSave?: boolean
  autoSaveInterval?: number // milliseconds
}

export interface RelationshipData {
  table: string
  items: any[]
  loading?: boolean
  error?: string
}

export interface FormBuilderProps {
  schema: FormSchema
  modelValue: Record<string, any>
  relationshipData?: Record<string, RelationshipData> // Keyed by field name
  loading?: boolean
  readonly?: boolean
  showActions?: boolean
  submitLabel?: string
  cancelLabel?: string
}

export interface FormBuilderEmits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'submit', value: Record<string, any>): void
  (e: 'cancel'): void
  (e: 'field-change', field: string, value: any): void
  (e: 'relationship-load', field: string, search?: string): void
  (e: 'relationship-add', field: string, item: any): void
  (e: 'relationship-remove', field: string, itemId: string): void
  (e: 'relationship-edit', field: string, item: any): void
}

export interface FormValidationError {
  field: string
  message: string
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  dirty: boolean
  valid: boolean
}
