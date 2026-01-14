<template>
  <span class="display-number" :class="numberClass">
    {{ formattedValue }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NumberProps {
  value: number | string | null | undefined
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  notation?: 'standard' | 'compact' | 'scientific' | 'engineering'
}

const props = withDefaults(defineProps<NumberProps>(), {
  value: undefined,
  locale: 'en-US',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  notation: 'standard',
})

const numberClass = computed(() => {
  return {
    'display-number': true,
  }
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return '—'
  
  const numValue = typeof props.value === 'string' ? parseFloat(props.value) : props.value
  
  if (isNaN(numValue)) return '—'

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: props.minimumFractionDigits,
    maximumFractionDigits: props.maximumFractionDigits,
    notation: props.notation,
  }

  return new Intl.NumberFormat(props.locale, options).format(numValue)
})
</script>

<style scoped lang="css">
.display-number {
  font-variant-numeric: tabular-nums;
  color: var(--text-color, #212529);
}
</style>