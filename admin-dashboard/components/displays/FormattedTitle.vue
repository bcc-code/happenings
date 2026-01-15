<template>
  <span class="display-formatted-title" :class="titleClass">
    <span v-if="prefix" class="display-formatted-title__prefix">{{ prefix }}</span>
    <span class="display-formatted-title__title">{{ title }}</span>
    <span v-if="suffix" class="display-formatted-title__suffix">{{ suffix }}</span>
    <Badge v-if="badge" :value="badge" :severity="badgeSeverity" class="display-formatted-title__badge" />
  </span>
</template>

<script setup lang="ts">
import Badge from 'primevue/badge'
import { computed } from 'vue'

export interface FormattedTitleProps {
  title: string
  prefix?: string
  suffix?: string
  badge?: string | number
  badgeSeverity?: 'success' | 'info' | 'warning' | 'danger' | null
  size?: 'sm' | 'md' | 'lg'
  truncate?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<FormattedTitleProps>(), {
  prefix: undefined,
  suffix: undefined,
  badge: undefined,
  badgeSeverity: 'info',
  size: 'md',
  truncate: false,
  maxLength: 50,
})

const titleClass = computed(() => {
  return {
    [`display-formatted-title--${props.size}`]: true,
    'display-formatted-title--truncate': props.truncate,
  }
})

const displayTitle = computed(() => {
  if (props.truncate && props.title.length > props.maxLength) {
    return props.title.substring(0, props.maxLength) + '...'
  }
  return props.title
})
</script>

<style scoped lang="css">
.display-formatted-title {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 0.25rem);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-color, #212529);
}

.display-formatted-title--sm {
  font-size: var(--font-size-sm, 0.875rem);
}

.display-formatted-title--md {
  font-size: var(--font-size-base, 1rem);
}

.display-formatted-title--lg {
  font-size: var(--font-size-lg, 1.125rem);
}

.display-formatted-title__prefix {
  color: var(--text-color-secondary, #6c757d);
  font-weight: var(--font-weight-normal, 400);
}

.display-formatted-title__title {
  font-weight: var(--font-weight-semibold, 600);
}

.display-formatted-title__suffix {
  color: var(--text-color-secondary, #6c757d);
  font-weight: var(--font-weight-normal, 400);
}

.display-formatted-title__badge {
  margin-left: var(--spacing-xs, 0.25rem);
}

.display-formatted-title--truncate {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>