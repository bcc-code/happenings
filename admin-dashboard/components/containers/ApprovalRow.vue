<template>
  <div class="approval-row">
    <div class="approval-row__copy">
      <p class="approval-row__title">{{ title }}</p>
      <p class="approval-row__meta">
        {{ type }} • {{ submittedBy }} • {{ submittedAt }}
      </p>
    </div>
    <div class="approval-row__actions">
      <Tag
        :value="status"
        :severity="severity"
      />
      <Button
        label="Review"
        size="small"
        severity="secondary"
        text
        @click="$emit('review')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Tag from 'primevue/tag'

export interface ApprovalRowProps {
  title: string
  type: string
  submittedBy: string
  submittedAt: string
  status: string
  severity: 'info' | 'warning' | 'success'
}

defineProps<ApprovalRowProps>()
defineEmits<{
  review: []
}>()
</script>

<style scoped lang="css">
.approval-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm, 0.75rem);
  padding: var(--spacing-sm, 0.75rem);
  border: 1px solid var(--surface-border, #e5e7eb);
  border-radius: var(--border-radius-md, 8px);
  background: var(--surface-0, #ffffff);
}

.approval-row__copy {
  flex: 1;
  min-width: 0;
}

.approval-row__title {
  margin: 0 0 var(--spacing-2xs, 0.35rem) 0;
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #0f172a);
  font-size: var(--font-size-base, 1rem);
}

.approval-row__meta {
  margin: 0;
  color: var(--text-color-secondary, #475569);
  font-size: var(--font-size-sm, 0.875rem);
}

.approval-row__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs, 0.35rem);
  flex-shrink: 0;
}
</style>
