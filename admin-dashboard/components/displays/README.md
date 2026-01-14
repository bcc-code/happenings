# Display Components

Components used to display values in tables, cards, or other contexts. These are read-only display components.

## Available Displays

- **DisplayDateTime** - Format and display dates/times
- **DisplayBoolean** - Display boolean values with icons/badges
- **DisplayFormattedTitle** - Formatted title with prefix/suffix/badge
- **DisplayJson** - Display JSON with syntax highlighting
- **DisplayCurrency** - Format and display currency values
- **DisplayNumber** - Format and display numbers
- **DisplayText** - Display text with truncation options

## Usage

```vue
<template>
  <DisplayDateTime :value="event.startDate" format="datetime" />
  <DisplayBoolean :value="event.published" />
  <DisplayCurrency :value="event.price" currency="USD" />
</template>

<script setup lang="ts">
import { DisplayDateTime, DisplayBoolean, DisplayCurrency } from '~/components/displays'
</script>
```

## Creating New Displays

1. Create display component in `displays/` folder
2. Export from `displays/index.ts`
3. Component should be read-only (no user interaction)
4. Use design tokens for styling
5. Document props and formatting options
