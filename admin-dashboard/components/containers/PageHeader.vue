<template>
  <div class="page-header" :class="headerClass">
    <div class="page-header__copy">
      <p v-if="eyebrow" class="page-header__eyebrow">{{ eyebrow }}</p>
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
}

const props = defineProps<PageHeaderProps>()

const headerClass = computed(() => {
  return {}
})
</script>

<style scoped lang="css">
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-lg, 1.5rem);
}

.page-header__copy {
  flex: 1;
}

.page-header__eyebrow {
  margin: 0 0 var(--spacing-xs, 0.25rem) 0;
  color: var(--text-color-secondary, #475569);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: var(--font-size-xs, 0.75rem);
  font-weight: var(--font-weight-medium, 500);
}

.page-header__title {
  margin: 0;
  font-size: var(--font-size-2xl, 2rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #0f172a);
  line-height: var(--line-height-tight, 1.2);
}

.page-header__subtitle {
  margin: var(--spacing-xs, 0.25rem) 0 0 0;
  color: var(--text-color-secondary, #475569);
  font-size: var(--font-size-base, 1rem);
  line-height: var(--line-height-normal, 1.5);
  max-width: 640px;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
  }

  .page-header__actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
