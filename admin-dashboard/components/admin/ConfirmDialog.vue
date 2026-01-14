<template>
  <ConfirmDialog
    :group="group"
    :class="dialogClass"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConfirmDialog from 'primevue/confirmdialog'

export interface ConfirmDialogProps {
  group?: string
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  group: 'admin',
})

const dialogClass = computed(() => {
  return {
    'admin-confirm-dialog': true,
  }
})
</script>

<style scoped lang="css">
:deep(.p-confirm-dialog) {
  border-radius: var(--border-radius-lg, 8px);
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
  max-width: 500px;
}

:deep(.p-confirm-dialog-header) {
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
  background: var(--surface-0, #ffffff);
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
  border-radius: var(--border-radius-lg, 8px) var(--border-radius-lg, 8px) 0 0;
}

:deep(.p-confirm-dialog-header-icon) {
  font-size: var(--font-size-xl, 1.25rem);
}

:deep(.p-confirm-dialog-header-title) {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #212529);
}

:deep(.p-confirm-dialog-content) {
  padding: var(--spacing-lg, 1.5rem);
  background: var(--surface-0, #ffffff);
}

:deep(.p-confirm-dialog-message) {
  margin: 0;
  color: var(--text-color, #212529);
  font-size: var(--font-size-base, 1rem);
  line-height: var(--line-height-base, 1.5);
}

:deep(.p-confirm-dialog-footer) {
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
  background: var(--surface-0, #ffffff);
  border-top: 1px solid var(--surface-200, #e0e0e0);
  border-radius: 0 0 var(--border-radius-lg, 8px) var(--border-radius-lg, 8px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md, 1rem);
}

/* Danger action styling */
:deep(.p-confirm-dialog-footer .p-button-danger) {
  background: var(--red-500, #ef4444);
  border-color: var(--red-500, #ef4444);
}

:deep(.p-confirm-dialog-footer .p-button-danger:hover) {
  background: var(--red-600, #dc2626);
  border-color: var(--red-600, #dc2626);
}
</style>