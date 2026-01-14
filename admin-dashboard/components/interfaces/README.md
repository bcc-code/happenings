# Interfaces

Components that interact with users and emit values back. These are input/editing components.

## Available Interfaces

- **FormBuilder** - Dynamic form builder from JSON schema
- **FormField** - Individual form field component
- **FormFieldGroup** - Group of form fields
- **RelationshipSelect** - Many-to-one relationship selector
- **RelationshipTable** - One-to-many relationship table

## Usage

```vue
<script setup lang="ts">
import { FormBuilder, RelationshipSelect } from '~/components/interfaces'
// Or import from main index
import { FormBuilder } from '~/components'
</script>
```

## Creating New Interfaces

1. Create interface component in `interfaces/` folder
2. Export from `interfaces/index.ts`
3. Ensure component emits `update:modelValue` for v-model support
4. Document props and events
