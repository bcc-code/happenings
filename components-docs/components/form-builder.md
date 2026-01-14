# FormBuilder

Dynamic form builder component for creating and editing entities with validation, conditional fields, and auto-save.

## Features

- ✅ Multiple field types (text, textarea, number, date, select, etc.)
- ✅ Validation rules and error messages
- ✅ Conditional field visibility
- ✅ Field grouping and sections
- ✅ Auto-save functionality
- ✅ Form state management

## Basic Usage

```vue
<template>
  <AdminFormBuilder
    :schema="formSchema"
    :model-value="formData"
    @update:model-value="onFormUpdate"
  />
</template>

<script setup lang="ts">
import { AdminFormBuilder } from '~/components/admin'
import type { FormSchema } from '~/components/admin/types'

const formSchema: FormSchema = {
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      validation: {
        minLength: 3,
        maxLength: 100,
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 5,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
}

const formData = ref({})

function onFormUpdate(newData: Record<string, unknown>) {
  formData.value = newData
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `FormSchema` | `{}` | Form schema definition |
| `model-value` | `Record<string, unknown>` | `{}` | Form data |
| `auto-save` | `boolean` | `false` | Enable auto-save |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:model-value` | `Record<string, unknown>` | Emitted when form data changes |
| `submit` | `Record<string, unknown>` | Emitted on form submit |
