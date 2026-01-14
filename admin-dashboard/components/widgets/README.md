# Widgets

Reusable components that can be used across modules. Each widget is a miniature module in its own right.

## Available Widgets

- **DataTable** - High-performance table with sorting, filtering, selection
- **SearchFilter** - Advanced search and filtering component
- **Modal** - Reusable modal/dialog component
- **Toast** - Toast notification component
- **ConfirmDialog** - Confirmation dialog component

## Usage

```vue
<script setup lang="ts">
import { DataTable, SearchFilter, Modal } from '~/components/widgets'
// Or import from main index
import { DataTable } from '~/components'
</script>
```

## Creating New Widgets

1. Create widget component in `widgets/` folder
2. Export from `widgets/index.ts`
3. Document usage in widget file or README
