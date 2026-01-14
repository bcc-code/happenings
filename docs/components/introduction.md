# Introduction

Welcome to the BCC Events Components documentation. This library provides reusable, production-ready Vue 3 components for building admin dashboards and data management interfaces.

## What's Included

### Data Components

- **DataTable**: High-performance table with sorting, filtering, and selection
- **SearchFilter**: Advanced search and filtering component

### Form Components

- **FormBuilder**: Dynamic form builder with validation
- **FormField**: Individual form field component
- **FormFieldGroup**: Grouped form fields

### Relationship Components

- **RelationshipSelect**: Select component for relationships
- **RelationshipTable**: Table for managing relationships

## Design System

All components are built with:

- **PrimeVue**: Base UI component library
- **@bcc-code/design-tokens**: Design tokens for consistent styling
- **Vue 3**: Composition API with TypeScript

## Getting Started

### Installation

Components are part of the `admin-dashboard` package. Import them from:

```typescript
import { AdminDataTable, AdminSearchFilter } from '~/components/admin'
```

### Basic Example

```vue
<template>
  <AdminDataTable
    :data="items"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import { AdminDataTable } from '~/components/admin'
</script>
```

## Next Steps

- [Installation Guide](./installation.md)
- [DataTable Component](./data-table.md)
- [SearchFilter Component](./search-filter.md)
