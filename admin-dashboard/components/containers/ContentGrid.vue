<template>
  <div class="content-grid" :class="gridClass">
    <div class="content-grid__primary">
      <slot name="primary" />
    </div>
    <div class="content-grid__secondary">
      <slot name="secondary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface ContentGridProps {
  ratio?: '2:1' | '3:1' | '1:1'
  gap?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<ContentGridProps>(), {
  ratio: '2:1',
  gap: 'lg',
})

const gridClass = computed(() => {
  return {
    [`content-grid--ratio-${props.ratio.replace(':', '-')}`]: true,
    [`content-grid--gap-${props.gap}`]: true,
  }
})
</script>

<style scoped lang="css">
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
}

.content-grid--ratio-2-1 {
  grid-template-columns: 2fr 1fr;
}

.content-grid--ratio-3-1 {
  grid-template-columns: 3fr 1fr;
}

.content-grid--ratio-1-1 {
  grid-template-columns: 1fr 1fr;
}

.content-grid--gap-sm {
  gap: var(--spacing-sm, 0.75rem);
}

.content-grid--gap-md {
  gap: var(--spacing-md, 1rem);
}

.content-grid--gap-lg {
  gap: var(--spacing-lg, 1.5rem);
}

.content-grid__primary,
.content-grid__secondary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 1.5rem);
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
