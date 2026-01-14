# Layout Components

Components for page layouts, router-views, public and protected views.

## Available Layouts

- **ModuleContainer** - Container for module pages with header, content, and sidebar
- **ModuleHeader** - Reusable header component for modules

## Usage

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

## Creating New Layouts

1. Create layout component in `layouts/` folder
2. Export from `layouts/index.ts`
3. Use slots for flexible content
4. Ensure responsive design
5. Document slots and props
