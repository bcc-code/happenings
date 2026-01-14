<template>
  <div class="action-tile">
    <div class="action-tile__icon">
      <i :class="icon"></i>
    </div>
    <div class="action-tile__copy">
      <p class="action-tile__label">{{ label }}</p>
      <p class="action-tile__description">{{ description }}</p>
    </div>
    <Button
      :label="cta"
      :icon="icon"
      size="small"
      text
      @click="$emit('click')"
    />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'

export interface ActionTileProps {
  label: string
  description: string
  icon: string
  cta: string
}

defineProps<ActionTileProps>()
defineEmits<{
  click: []
}>()
</script>

<style scoped lang="css">
.action-tile {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--spacing-sm, 0.75rem);
  padding: var(--spacing-md, 1rem);
  border: 1px solid var(--surface-border, #e5e7eb);
  border-radius: var(--border-radius-md, 8px);
  background: var(--surface-50, #f8fafc);
  align-items: center;
}

.action-tile__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full, 999px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-0, #ffffff);
  color: var(--primary-500, #4338ca);
  border: 1px solid var(--surface-border, #e5e7eb);
  font-size: var(--font-size-lg, 1.125rem);
}

.action-tile__label {
  margin: 0;
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #0f172a);
  font-size: var(--font-size-base, 1rem);
}

.action-tile__description {
  margin: var(--spacing-2xs, 0.35rem) 0 0 0;
  color: var(--text-color-secondary, #475569);
  font-size: var(--font-size-sm, 0.875rem);
  line-height: var(--line-height-normal, 1.5);
}
</style>
