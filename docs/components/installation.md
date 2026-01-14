# Installation

## Prerequisites

- Vue 3.3+
- PrimeVue (configured)
- @bcc-code/design-tokens

## Setup

Components are part of the `admin-dashboard` package. No additional installation is required.

### Import Components

```typescript
// Individual components
import { AdminDataTable } from '~/components/admin'
import { AdminSearchFilter } from '~/components/admin'

// Or import all
import * as AdminComponents from '~/components/admin'
```

### PrimeVue Configuration

Ensure PrimeVue is configured with design tokens:

```typescript
// plugins/primevue.client.ts
import PrimeVue from 'primevue/config'
import { designTokens } from '@bcc-code/design-tokens'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    theme: {
      preset: designTokens,
    },
  })
})
```

## Usage

```vue
<template>
  <AdminDataTable
    :data="data"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import { AdminDataTable } from '~/components/admin'
</script>
```
