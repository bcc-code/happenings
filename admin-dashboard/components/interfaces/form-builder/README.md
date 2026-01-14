# FormBuilder Component

A powerful, dynamic form builder component that can generate forms from JSON schema definitions, with full support for database relationships.

## Features

- ✅ **JSON Schema Support**: Generate forms from JSON schema definitions
- ✅ **Multiple Field Types**: Text, number, date, boolean, select, file upload, JSON, and more
- ✅ **Many-to-One Relationships**: Foreign key fields render as searchable select dropdowns
- ✅ **One-to-Many Relationships**: Related tables render as editable sub-tables
- ✅ **Validation**: Built-in validation with custom rules
- ✅ **Conditional Fields**: Show/hide fields based on other field values
- ✅ **Field Grouping**: Organize fields into sections
- ✅ **Auto-save**: Optional auto-save functionality
- ✅ **TypeScript**: Fully typed with TypeScript

## Basic Usage

```vue
<template>
  <FormBuilder
    :schema="formSchema"
    :model-value="formData"
    :relationship-data="relationshipData"
    @update:model-value="onUpdate"
    @submit="onSubmit"
  />
</template>

<script setup lang="ts">
import { FormBuilder } from '~/components/interfaces'
import type { FormSchema, RelationshipData } from '~/components/interfaces/form-builder/types'

const formSchema: FormSchema = {
  table: 'Event',
  title: 'Event Details',
  fields: [
    {
      name: 'title',
      label: 'Event Title',
      type: 'text',
      required: true,
    },
    {
      name: 'startDate',
      label: 'Start Date',
      type: 'datetime',
      required: true,
    },
  ],
}

const formData = ref({})
const relationshipData = ref<Record<string, RelationshipData>>({})

const onUpdate = (value: Record<string, any>) => {
  formData.value = value
}

const onSubmit = (value: Record<string, any>) => {
  // Submit to API
  console.log('Submitting:', value)
}
</script>
```

## Schema Definition

### Basic Schema

```typescript
const schema: FormSchema = {
  table: 'Event',
  title: 'Event Form',
  description: 'Create or edit an event',
  fields: [
    {
      name: 'title',
      label: 'Event Title',
      type: 'text',
      required: true,
      placeholder: 'Enter event title',
    },
  ],
  layout: 'two-column', // 'single' | 'two-column' | 'three-column'
}
```

### Field Types

Supported field types:

- `text` - Text input
- `textarea` - Multi-line text
- `number` - Number input
- `decimal` - Decimal number
- `email` - Email input with validation
- `url` - URL input with validation
- `password` - Password input
- `date` - Date picker
- `datetime` - Date and time picker
- `time` - Time picker
- `boolean` - Checkbox
- `select` - Dropdown select
- `multiSelect` - Multi-select dropdown
- `radio` - Radio buttons
- `checkbox` - Checkbox group
- `file` - File upload
- `image` - Image upload
- `json` - JSON editor
- `richText` - Rich text editor
- `relationship` - Many-to-one relationship (select)
- `relationshipMany` - One-to-many relationship (sub-table)

### Many-to-One Relationship

Foreign key fields automatically render as searchable select dropdowns:

```typescript
{
  name: 'userId',
  label: 'User',
  type: 'relationship',
  relationship: {
    type: 'manyToOne',
    table: 'User',
    foreignKey: 'userId',
    displayField: 'email', // Field to display in dropdown
    valueField: 'id', // Field to use as value (defaults to 'id')
    loadOptions: async (search?: string) => {
      // Async option loader
      const response = await fetch(`/api/users?search=${search}`)
      return response.json()
    },
  },
  required: true,
}
```

### One-to-Many Relationship

Related tables render as editable sub-tables:

```typescript
{
  name: 'sessions',
  label: 'Sessions',
  type: 'relationshipMany',
  relationship: {
    type: 'oneToMany',
    table: 'Session',
    foreignKey: 'eventId',
    displayField: 'title',
  },
}
```

### Conditional Fields

Show/hide fields based on other field values:

```typescript
{
  name: 'discountCode',
  label: 'Discount Code',
  type: 'text',
  showIf: {
    field: 'hasDiscount',
    operator: 'equals',
    value: true,
  },
}
```

### Field Validation

```typescript
{
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true,
  validation: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email' },
    { type: 'maxLength', value: 255, message: 'Email is too long' },
  ],
}
```

### Sections

Organize fields into collapsible sections:

```typescript
{
  table: 'Event',
  fields: [...],
  sections: [
    {
      title: 'Basic Information',
      description: 'Enter basic event details',
      fields: ['title', 'description'],
      collapsible: true,
      collapsed: false,
    },
    {
      title: 'Date & Location',
      fields: ['startDate', 'endDate', 'venue'],
    },
  ],
}
```

## Converting Drizzle Schema

Use the schema converter utilities to generate forms from Drizzle ORM schemas:

```typescript
import { drizzleToFormSchema, createEventFormSchema } from '~/components/interfaces'

// Convert a Drizzle table to form schema
const schema = drizzleToFormSchema('Event', drizzleColumns, drizzleRelations)

// Or use a pre-built schema
const eventSchema = createEventFormSchema()
```

## Relationship Data

Provide relationship data for foreign key fields:

```typescript
const relationshipData = ref<Record<string, RelationshipData>>({
  userId: {
    table: 'User',
    items: [
      { id: '1', email: 'john@example.com' },
      { id: '2', email: 'jane@example.com' },
    ],
    loading: false,
  },
})
```

## Events

- `@update:modelValue` - Emitted when form data changes
- `@submit` - Emitted when form is submitted
- `@cancel` - Emitted when cancel button is clicked
- `@field-change` - Emitted when a specific field changes
- `@relationship-load` - Emitted when relationship data needs to be loaded
- `@relationship-add` - Emitted when adding a relationship item
- `@relationship-remove` - Emitted when removing a relationship item
- `@relationship-edit` - Emitted when editing a relationship item

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `FormSchema` | required | Form schema definition |
| `modelValue` | `Record<string, any>` | required | Form data |
| `relationshipData` | `Record<string, RelationshipData>` | `{}` | Relationship data for foreign keys |
| `loading` | `boolean` | `false` | Show loading state |
| `readonly` | `boolean` | `false` | Make form readonly |
| `showActions` | `boolean` | `true` | Show submit/cancel buttons |
| `submitLabel` | `string` | `'Save'` | Submit button label |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button label |

## Examples

See `pages/form-builder-demo.vue` for complete examples including:
- Event form with relationships
- User form
- Registration form with one-to-many relationships

## Advanced Usage

### Custom Field Templates

You can extend the FormField component to add custom field types or templates.

### Async Relationship Loading

```typescript
{
  name: 'userId',
  type: 'relationship',
  relationship: {
    type: 'manyToOne',
    table: 'User',
    foreignKey: 'userId',
    displayField: 'email',
    loadOptions: async (search?: string) => {
      const response = await fetch(`/api/users?search=${search || ''}`)
      const data = await response.json()
      return data.items
    },
  },
}
```

### Auto-save

Enable auto-save to automatically save form data:

```typescript
{
  table: 'Event',
  fields: [...],
  autoSave: true,
  autoSaveInterval: 5000, // Save every 5 seconds
}
```

## Best Practices

1. **Schema Organization**: Use sections to organize related fields
2. **Validation**: Always validate required fields and format
3. **Relationship Loading**: Use async loading for large datasets
4. **Error Handling**: Handle relationship loading errors gracefully
5. **Performance**: Use conditional fields to reduce form complexity
6. **Accessibility**: Always provide labels and help text

## TypeScript Support

All components and utilities are fully typed. Import types from:

```typescript
import type {
  FormSchema,
  FormField,
  RelationshipData,
  FormBuilderProps,
} from '~/components/interfaces/form-builder/types'
```
