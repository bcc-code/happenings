<template>
  <span class="display-boolean" :class="booleanClass">
    <i :class="iconClass" />
    <span v-if="showLabel">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BooleanProps {
  value: boolean | null | undefined
  showLabel?: boolean
  trueLabel?: string
  falseLabel?: string
  trueIcon?: string
  falseIcon?: string
  variant?: 'badge' | 'icon' | 'text'
}

const props = withDefaults(defineProps<BooleanProps>(), {
  value: undefined,
  showLabel: true,
  trueLabel: 'Yes',
  falseLabel: 'No',
  trueIcon: 'pi pi-check-circle',
  falseIcon: 'pi pi-times-circle',
  variant: 'badge',
})

const booleanClass = computed(() => {
  return {
    'display-boolean': true,
    [`display-boolean--${props.variant}`]: true,
    'display-boolean--true': props.value === true,
    'display-boolean--false': props.value === false,
    'display-boolean--null': props.value === null || props.value === undefined,
  }
})

const iconClass = computed(() => {
  if (props.value === true) return props.trueIcon
  if (props.value === false) return props.falseIcon
  return 'pi pi-question-circle'
})

const label = computed(() => {
  if (props.value === true) return props.trueLabel
  if (props.value === false) return props.falseLabel
  return '—'
})
</script>

<style scoped lang="css">
.display-boolean {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 0.25rem);
  font-size: var(--font-size-sm, 0.875rem);
}

.display-boolean--badge {
  padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
  border-radius: var(--border-radius-sm, 4px);
  font-weight: var(--font-weight-medium, 500);
}

.display-boolean--true {
  color: var(--green-700, #15803d);
  background: var(--green-50, #f0fdf4);
}

.display-boolean--false {
  color: var(--red-700, #b91c1c);
  background: var(--red-50, #fef2f2);
}

.display-boolean--null {
  color: var(--text-color-secondary, #6c757d);
  background: var(--surface-100, #f5f5f5);
}

.display-boolean--icon {
  font-size: var(--font-size-base, 1rem);
}

.display-boolean--icon.display-boolean--true {
  color: var(--green-600, #16a34a);
}

.display-boolean--icon.display-boolean--false {
  color: var(--red-600, #dc2626);
}

.display-boolean--icon.display-boolean--null {
  color: var(--text-color-secondary, #6c757d);
}

.display-boolean--text {
  font-weight: var(--font-weight-medium, 500);
}
</style>