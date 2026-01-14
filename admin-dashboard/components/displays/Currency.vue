<template>
  <span class="display-currency" :class="currencyClass">
    {{ formattedValue }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CurrencyProps {
  value: number | string | null | undefined
  currency?: string
  locale?: string
  showSymbol?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

const props = withDefaults(defineProps<CurrencyProps>(), {
  value: undefined,
  currency: 'USD',
  locale: 'en-US',
  showSymbol: true,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const currencyClass = computed(() => {
  return {
    'display-currency--positive': typeof props.value === 'number' && props.value >= 0,
    'display-currency--negative': typeof props.value === 'number' && props.value < 0,
  }
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return '—'
  
  const numValue = typeof props.value === 'string' ? parseFloat(props.value) : props.value
  
  if (isNaN(numValue)) return '—'

  const options: Intl.NumberFormatOptions = {
    style: props.showSymbol ? 'currency' : 'decimal',
    currency: props.currency,
    minimumFractionDigits: props.minimumFractionDigits,
    maximumFractionDigits: props.maximumFractionDigits,
  }

  return new Intl.NumberFormat(props.locale, options).format(numValue)
})
</script>

<style scoped lang="css">
.display-currency {
  font-weight: var(--font-weight-medium, 500);
  font-variant-numeric: tabular-nums;
}

.display-currency--positive {
  color: var(--green-700, #15803d);
}

.display-currency--negative {
  color: var(--red-700, #b91c1c);
}
</style>