<template>
  <span class="display-text" :class="textClass" :title="truncated ? value : undefined">
    {{ displayValue }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TextProps {
  value: string | null | undefined
  maxLength?: number
  truncate?: boolean
  ellipsis?: string
  variant?: 'default' | 'muted' | 'bold' | 'italic'
}

const props = withDefaults(defineProps<TextProps>(), {
  value: undefined,
  maxLength: 100,
  truncate: false,
  ellipsis: '...',
  variant: 'default',
})

const textClass = computed(() => {
  return {
    [`display-text--${props.variant}`]: true,
    'display-text--truncate': props.truncate,
  }
})

const displayValue = computed(() => {
  if (!props.value) return '—'
  
  if (props.truncate && props.value.length > props.maxLength) {
    return props.value.substring(0, props.maxLength) + props.ellipsis
  }
  
  return props.value
})

const truncated = computed(() => {
  return props.truncate && props.value && props.value.length > props.maxLength
})
</script>

<style scoped lang="css">
.display-text {
  color: var(--text-color, #212529);
  font-size: var(--font-size-sm, 0.875rem);
}

.display-text--muted {
  color: var(--text-color-secondary, #6c757d);
}

.display-text--bold {
  font-weight: var(--font-weight-semibold, 600);
}

.display-text--italic {
  font-style: italic;
}

.display-text--truncate {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>