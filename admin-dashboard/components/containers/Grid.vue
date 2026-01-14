<template>
  <div class="grid" :class="gridClass" :style="gridStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface GridProps {
  columns?: number | string
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  minColumnWidth?: string
}

const props = withDefaults(defineProps<GridProps>(), {
  columns: undefined,
  gap: 'md',
  responsive: false,
  minColumnWidth: '240px',
})

const gridClass = computed(() => {
  return {
    [`grid--gap-${props.gap}`]: true,
    'grid--responsive': props.responsive,
  }
})

const gridStyle = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.columns) {
    if (typeof props.columns === 'number') {
      styles['grid-template-columns'] = `repeat(${props.columns}, 1fr)`
    } else {
      styles['grid-template-columns'] = props.columns
    }
  } else if (props.responsive) {
    styles['grid-template-columns'] = `repeat(auto-fit, minmax(${props.minColumnWidth}, 1fr))`
  }
  
  return styles
})
</script>

<style scoped lang="css">
.grid {
  display: grid;
}

.grid--gap-xs {
  gap: var(--spacing-xs, 0.25rem);
}

.grid--gap-sm {
  gap: var(--spacing-sm, 0.75rem);
}

.grid--gap-md {
  gap: var(--spacing-md, 1rem);
}

.grid--gap-lg {
  gap: var(--spacing-lg, 1.5rem);
}

.grid--gap-xl {
  gap: var(--spacing-xl, 2rem);
}
</style>
