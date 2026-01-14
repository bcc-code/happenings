<template>
  <Toast
    ref="toastRef"
    :position="position"
    :group="group"
    :class="toastClass"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Toast from 'primevue/toast'
import { useToast as usePrimeToast } from 'primevue/usetoast'

export interface ToastProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | 'center'
  group?: string
}

const props = withDefaults(defineProps<ToastProps>(), {
  position: 'top-right',
  group: 'admin',
})

const toastRef = ref<InstanceType<typeof Toast> | null>(null)

const toastClass = computed(() => {
  return {
    'admin-toast': true,
    [`admin-toast--${props.position}`]: true,
  }
})

// Expose toast instance for programmatic use
defineExpose({
  toast: toastRef,
})
</script>

<style scoped lang="css">
:deep(.p-toast) {
  z-index: 1100;
}

:deep(.p-toast-message) {
  border-radius: var(--border-radius-md, 6px);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.15));
  margin: var(--spacing-sm, 0.5rem) 0;
  padding: var(--spacing-md, 1rem);
  min-width: 300px;
  max-width: 500px;
}

:deep(.p-toast-message-content) {
  padding: 0;
}

:deep(.p-toast-icon-close) {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--border-radius-sm, 4px);
  transition: background-color 0.2s;
}

:deep(.p-toast-icon-close:hover) {
  background-color: var(--surface-100, #f5f5f5);
}

/* Toast type styles */
:deep(.p-toast-message-success) {
  background: var(--green-50, #f0fdf4);
  border-left: 4px solid var(--green-500, #22c55e);
  color: var(--green-900, #14532d);
}

:deep(.p-toast-message-success .p-toast-icon) {
  color: var(--green-600, #16a34a);
}

:deep(.p-toast-message-error) {
  background: var(--red-50, #fef2f2);
  border-left: 4px solid var(--red-500, #ef4444);
  color: var(--red-900, #7f1d1d);
}

:deep(.p-toast-message-error .p-toast-icon) {
  color: var(--red-600, #dc2626);
}

:deep(.p-toast-message-warn) {
  background: var(--yellow-50, #fefce8);
  border-left: 4px solid var(--yellow-500, #eab308);
  color: var(--yellow-900, #713f12);
}

:deep(.p-toast-message-warn .p-toast-icon) {
  color: var(--yellow-600, #ca8a04);
}

:deep(.p-toast-message-info) {
  background: var(--blue-50, #eff6ff);
  border-left: 4px solid var(--blue-500, #3b82f6);
  color: var(--blue-900, #1e3a8a);
}

:deep(.p-toast-message-info .p-toast-icon) {
  color: var(--blue-600, #2563eb);
}

/* Message content */
:deep(.p-toast-message-text) {
  margin: 0;
  font-size: var(--font-size-sm, 0.875rem);
  line-height: var(--line-height-base, 1.5);
}

:deep(.p-toast-summary) {
  font-weight: var(--font-weight-semibold, 600);
  font-size: var(--font-size-base, 1rem);
  margin-bottom: var(--spacing-xs, 0.25rem);
}

:deep(.p-toast-detail) {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-color-secondary, #6c757d);
  margin-top: var(--spacing-xs, 0.25rem);
}
</style>