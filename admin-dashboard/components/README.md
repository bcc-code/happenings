# Components

Organized component structure for the admin dashboard.

## Structure

```
components/
├── interfaces/      # Components that interact and emit values (form inputs, selectors)
├── displays/        # Components that display values (datetime, boolean, json, etc.)
├── widgets/         # Reusable components across modules (DataTable, Modal, etc.)
├── layouts/         # Layout components (ModuleContainer, ModuleHeader)
├── modules/         # Bigger modules, each in its own folder
└── menus/          # Menu components (if shared)
```

## Categories

### Interfaces (`interfaces/`)

Components that interact with users and emit values back. Examples:
- Form inputs (FormBuilder, FormField)
- Relationship selectors (RelationshipSelect, RelationshipTable)
- File uploads
- Any component that uses `v-model`

**Usage:**
```vue
<script setup lang="ts">
import { FormBuilder, RelationshipSelect } from '~/components/interfaces'
</script>
```

### Displays (`displays/`)

Read-only components used to display values in tables, cards, or other contexts. Examples:
- DisplayDateTime - Format dates/times
- DisplayBoolean - Display boolean values
- DisplayCurrency - Format currency
- DisplayJson - Display JSON with syntax highlighting
- DisplayText - Display text with truncation

**Usage:**
```vue
<template>
  <DisplayDateTime :value="event.startDate" format="datetime" />
  <DisplayBoolean :value="event.published" />
</template>

<script setup lang="ts">
import { DisplayDateTime, DisplayBoolean } from '~/components/displays'
</script>
```

### Widgets (`widgets/`)

Reusable components that can be used across modules. Each widget is a miniature module. Examples:
- DataTable - High-performance table
- SearchFilter - Advanced search and filtering
- Modal - Reusable modal/dialog
- Toast - Toast notifications
- ConfirmDialog - Confirmation dialogs

**Usage:**
```vue
<script setup lang="ts">
import { DataTable, SearchFilter, Modal } from '~/components/widgets'
</script>
```

### Layouts (`layouts/`)

Components for page layouts, router-views, public and protected views. Examples:
- ModuleContainer - Container for module pages
- ModuleHeader - Reusable header component

**Usage:**
```vue
<template>
  <ModuleContainer :use-default-header="true" header-title="My Module">
    <!-- Content -->
  </ModuleContainer>
</template>

<script setup lang="ts">
import { ModuleContainer } from '~/components/layouts'
</script>
```

### Modules (`modules/`)

Bigger modules, each in its own folder. Each module is a self-contained feature. Examples:
- `users/` - User management module
- `events/` - Event management module
- `settings/` - Settings module

**Structure:**
```
modules/
  users/
    index.ts
    README.md
    UserList.vue
    UserForm.vue
```

**Usage:**
```vue
<script setup lang="ts">
import { UserList, UserForm } from '~/components/modules/users'
</script>
```

### Menus (`menus/`)

Menu components that can be shared across modules (if needed).

## Import Patterns

### Import from specific category (recommended for tree-shaking)
```typescript
import { DataTable } from '~/components/widgets'
import { FormBuilder } from '~/components/interfaces'
import { DisplayDateTime } from '~/components/displays'
```

### Import from main index (convenient but less tree-shakeable)
```typescript
import { DataTable, FormBuilder, DisplayDateTime } from '~/components'
```

## Migration from Old Structure

If you're migrating from the old `components/admin/` structure:

**Old:**
```typescript
import { AdminDataTable } from '~/components/admin'
```

**New:**
```typescript
import { DataTable } from '~/components/widgets'
```

**Old:**
```typescript
import { AdminModuleContainer } from '~/components/admin'
```

**New:**
```typescript
import { ModuleContainer } from '~/components/layouts'
```

**Old:**
```typescript
import { FormBuilder } from '~/components/admin/form-builder'
```

**New:**
```typescript
import { FormBuilder } from '~/components/interfaces'
```

## Creating New Components

### Creating a Display Component

1. Create component in `displays/` folder
2. Export from `displays/index.ts`
3. Component should be read-only
4. Use design tokens for styling

### Creating a Widget

1. Create component in `widgets/` folder
2. Export from `widgets/index.ts`
3. Document usage

### Creating a Module

1. Create folder in `modules/` with module name
2. Create `index.ts` for exports
3. Create `README.md` for documentation
4. Add component files

## Best Practices

1. **Use specific imports** for better tree-shaking
2. **Follow naming conventions** - Display* for displays, no prefix for others
3. **Document components** with README files
4. **Use design tokens** for all styling
5. **Type everything** with TypeScript
6. **Keep components focused** - one responsibility per component
