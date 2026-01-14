<template>
  <div class="flex" :class="flexClass" :style="flexStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface FlexProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  wrap?: boolean
}

const props = withDefaults(defineProps<FlexProps>(), {
  direction: 'row',
  align: 'stretch',
  justify: 'start',
  gap: 'md',
  wrap: false,
})

const flexClass = computed(() => {
  return {
    [`flex--direction-${props.direction}`]: true,
    [`flex--align-${props.align}`]: true,
    [`flex--justify-${props.justify}`]: true,
    [`flex--gap-${props.gap}`]: true,
    'flex--wrap': props.wrap,
  }
})

const flexStyle = computed(() => {
  return {}
})
</script>

<style scoped lang="css">
.flex {
  display: flex;
}

.flex--direction-row {
  flex-direction: row;
}

.flex--direction-column {
  flex-direction: column;
}

.flex--direction-row-reverse {
  flex-direction: row-reverse;
}

.flex--direction-column-reverse {
  flex-direction: column-reverse;
}

.flex--align-start {
  align-items: flex-start;
}

.flex--align-end {
  align-items: flex-end;
}

.flex--align-center {
  align-items: center;
}

.flex--align-stretch {
  align-items: stretch;
}

.flex--align-baseline {
  align-items: baseline;
}

.flex--justify-start {
  justify-content: flex-start;
}

.flex--justify-end {
  justify-content: flex-end;
}

.flex--justify-center {
  justify-content: center;
}

.flex--justify-between {
  justify-content: space-between;
}

.flex--justify-around {
  justify-content: space-around;
}

.flex--justify-evenly {
  justify-content: space-evenly;
}

.flex--gap-xs {
  gap: var(--spacing-xs, 0.25rem);
}

.flex--gap-sm {
  gap: var(--spacing-sm, 0.75rem);
}

.flex--gap-md {
  gap: var(--spacing-md, 1rem);
}

.flex--gap-lg {
  gap: var(--spacing-lg, 1.5rem);
}

.flex--gap-xl {
  gap: var(--spacing-xl, 2rem);
}

.flex--wrap {
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .flex--direction-row.flex--responsive {
    flex-direction: column;
  }
}
</style>
