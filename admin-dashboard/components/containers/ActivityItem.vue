<template>
  <div class="activity-item">
    <p class="activity-item__title">{{ title }}</p>
    <p class="activity-item__detail">{{ detail }}</p>
    <p class="activity-item__meta">{{ time }}</p>
  </div>
</template>

<script setup lang="ts">
export interface ActivityItemProps {
  title: string
  detail: string
  time: string
}

defineProps<ActivityItemProps>()
</script>

<style scoped lang="css">
.activity-item {
  padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
  border: 1px solid var(--surface-border, #e5e7eb);
  border-radius: var(--border-radius-md, 8px);
  background: var(--surface-0, #ffffff);
}

.activity-item__title {
  margin: 0 0 var(--spacing-2xs, 0.35rem) 0;
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #0f172a);
  font-size: var(--font-size-base, 1rem);
}

.activity-item__detail {
  margin: 0 0 var(--spacing-2xs, 0.35rem) 0;
  color: var(--text-color-secondary, #475569);
  font-size: var(--font-size-sm, 0.875rem);
  line-height: var(--line-height-normal, 1.5);
}

.activity-item__meta {
  margin: 0;
  color: var(--text-color-secondary, #475569);
  font-size: var(--font-size-xs, 0.75rem);
}
</style>
