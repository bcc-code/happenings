<template>
  <span class="display-datetime" :class="datetimeClass">
    {{ formattedValue }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface DateTimeProps {
  value: string | Date | number | null | undefined
  format?: 'date' | 'datetime' | 'time' | 'relative' | 'custom'
  customFormat?: string
  timezone?: string
  locale?: string
}

const props = withDefaults(defineProps<DateTimeProps>(), {
  value: undefined,
  format: 'datetime',
  customFormat: undefined,
  timezone: undefined,
  locale: undefined,
})

const datetimeClass = computed(() => {
  return {
    [`display-datetime--${props.format}`]: true,
  }
})

const formattedValue = computed(() => {
  if (!props.value) return '—'

  const date = typeof props.value === 'number' 
    ? new Date(props.value * 1000) 
    : new Date(props.value)

  if (isNaN(date.getTime())) return 'Invalid date'

  const locale = props.locale || 'en-US'
  const options: Intl.DateTimeFormatOptions = {}

  switch (props.format) {
    case 'date':
      options.year = 'numeric'
      options.month = 'short'
      options.day = 'numeric'
      break
    case 'datetime':
      options.year = 'numeric'
      options.month = 'short'
      options.day = 'numeric'
      options.hour = '2-digit'
      options.minute = '2-digit'
      break
    case 'time':
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
      break
    case 'relative':
      return getRelativeTime(date)
    case 'custom':
      if (props.customFormat) {
        return formatCustom(date, props.customFormat)
      }
      break
  }

  return date.toLocaleString(locale, options)
})

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString()
}

function formatCustom(date: Date, format: string): string {
  // Simple custom format implementation
  return format
    .replace('YYYY', date.getFullYear().toString())
    .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(date.getDate()).padStart(2, '0'))
    .replace('HH', String(date.getHours()).padStart(2, '0'))
    .replace('mm', String(date.getMinutes()).padStart(2, '0'))
    .replace('ss', String(date.getSeconds()).padStart(2, '0'))
}
</script>

<style scoped lang="css">
.display-datetime {
  color: var(--text-color, #212529);
  font-size: var(--font-size-sm, 0.875rem);
}

.display-datetime--relative {
  color: var(--text-color-secondary, #6c757d);
  font-style: italic;
}
</style>