# Component Structure Migration Guide

This document helps you migrate from the old `components/admin/` structure to the new organized structure.

## New Structure

```
components/
├── interfaces/      # Form inputs, relationship selectors
├── displays/        # Display-only components (datetime, boolean, etc.)
├── widgets/         # Reusable components (DataTable, Modal, etc.)
├── layouts/         # Layout components (ModuleContainer, etc.)
├── modules/         # Bigger modules (users, events, etc.)
└── menus/          # Menu components
```

## Component Mapping

### Widgets (moved from `admin/`)

| Old Import | New Import |
|------------|------------|
| `AdminDataTable` | `DataTable` from `~/components/widgets` |
| `AdminSearchFilter` | `SearchFilter` from `~/components/widgets` |
| `AdminModal` | `Modal` from `~/components/widgets` |
| `AdminToast` | `Toast` from `~/components/widgets` |
| `AdminConfirmDialog` | `ConfirmDialog` from `~/components/widgets` |

### Layouts (moved from `admin/`)

| Old Import | New Import |
|------------|------------|
| `AdminModuleContainer` | `ModuleContainer` from `~/components/layouts` |
| `AdminModuleHeader` | `ModuleHeader` from `~/components/layouts` |

### Interfaces (moved from `admin/form-builder/`)

| Old Import | New Import |
|------------|------------|
| `FormBuilder` | `FormBuilder` from `~/components/interfaces` |
| `FormField` | `FormField` from `~/components/interfaces` |
| `RelationshipSelect` | `RelationshipSelect` from `~/components/interfaces` |
| `RelationshipTable` | `RelationshipTable` from `~/components/interfaces` |

### Types

| Old Import | New Import |
|------------|------------|
| `types` from `~/components/admin/types` | `types` from `~/components/widgets/types` |

## Migration Steps

### 1. Update Imports

**Before:**
```typescript
import { AdminDataTable, AdminSearchFilter } from '~/components/admin'
import type { TableColumn } from '~/components/admin/types'
```

**After:**
```typescript
import { DataTable, SearchFilter } from '~/components/widgets'
import type { TableColumn } from '~/components/widgets/types'
```

### 2. Update Component Usage

**Before:**
```vue
<AdminDataTable :data="events" :columns="columns" />
```

**After:**
```vue
<DataTable :data="events" :columns="columns" />
```

### 3. Update Layout Components

**Before:**
```vue
<AdminModuleContainer :use-default-header="true" header-title="Events">
```

**After:**
```vue
<ModuleContainer :use-default-header="true" header-title="Events">
```

### 4. Update Form Builder

**Before:**
```typescript
import { FormBuilder } from '~/components/admin/form-builder'
import type { FormSchema } from '~/components/admin/form-builder/types'
```

**After:**
```typescript
import { FormBuilder } from '~/components/interfaces'
import type { FormSchema } from '~/components/interfaces/form-builder/types'
```

## Quick Find & Replace

You can use these patterns for find & replace:

1. `from '~/components/admin'` → `from '~/components/widgets'` (for widgets)
2. `AdminDataTable` → `DataTable`
3. `AdminSearchFilter` → `SearchFilter`
4. `AdminModal` → `Modal`
5. `AdminToast` → `Toast`
6. `AdminConfirmDialog` → `ConfirmDialog`
7. `AdminModuleContainer` → `ModuleContainer`
8. `AdminModuleHeader` → `ModuleHeader`
9. `from '~/components/admin/form-builder'` → `from '~/components/interfaces'`

## Files Already Migrated

- ✅ `app.vue`
- ✅ `pages/components-demo.vue`
- ✅ `pages/module-demo.vue`
- ✅ `pages/form-builder-demo.vue`

## Need Help?

If you encounter issues during migration:
1. Check the component's README in its new location
2. Verify the import path matches the new structure
3. Ensure types are imported from the correct location
