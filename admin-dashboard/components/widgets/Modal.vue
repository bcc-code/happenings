<template>
  <Dialog
    :visible="modelValue"
    :modal="true"
    :closable="closable"
    :dismissable-mask="dismissableMask"
    :draggable="draggable"
    :resizable="resizable"
    :position="position"
    :style="dialogStyle"
    :class="dialogClass"
    :header="title"
    :footer="showFooter ? footerTemplate : undefined"
    @update:visible="onUpdateVisible"
    @hide="onHide"
  >
    <template #header v-if="title || $slots.header">
      <slot name="header">
        <div class="modal-header">
          <h3 v-if="title" class="modal-title">{{ title }}</h3>
          <slot name="header-actions" />
        </div>
      </slot>
    </template>

    <div v-if="loading" class="modal-loading">
      <ProgressSpinner />
      <p v-if="loadingMessage">{{ loadingMessage }}</p>
    </div>

    <div v-else class="modal-content">
      <slot />
    </div>

    <template #footer v-if="showFooter">
      <slot name="footer">
        <div class="modal-footer">
          <Button
            v-if="showCancel"
            :label="cancelLabel"
            :severity="'secondary'"
            :outlined="true"
            @click="onCancel"
          />
          <Button
            v-if="showConfirm"
            :label="confirmLabel"
            :severity="confirmSeverity"
            :loading="confirmLoading"
            :disabled="confirmDisabled"
            @click="onConfirm"
          />
        </div>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

export interface ModalProps {
  modelValue: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  closable?: boolean
  dismissableMask?: boolean
  draggable?: boolean
  resizable?: boolean
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'
  loading?: boolean
  loadingMessage?: string
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelLabel?: string
  confirmLabel?: string
  confirmSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'
  confirmLoading?: boolean
  confirmDisabled?: boolean
  footerTemplate?: string
}

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  title: undefined,
  size: 'medium',
  closable: true,
  dismissableMask: true,
  draggable: false,
  resizable: false,
  position: 'center',
  loading: false,
  loadingMessage: undefined,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  cancelLabel: 'Cancel',
  confirmLabel: 'Confirm',
  confirmSeverity: 'primary',
  confirmLoading: false,
  confirmDisabled: false,
  footerTemplate: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'hide': []
  'confirm': []
  'cancel': []
}>()

const dialogStyle = computed(() => {
  const sizeMap = {
    small: { width: '400px', maxWidth: '90vw' },
    medium: { width: '600px', maxWidth: '90vw' },
    large: { width: '900px', maxWidth: '90vw' },
    fullscreen: { width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh' },
  }
  return sizeMap[props.size]
})

const dialogClass = computed(() => {
  return {
    'admin-modal': true,
    [`admin-modal--${props.size}`]: true,
  }
})

const onUpdateVisible = (value: boolean) => {
  emit('update:modelValue', value)
}

const onHide = () => {
  emit('hide')
}

const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style scoped lang="css">
:deep(.p-dialog) {
  border-radius: var(--border-radius-lg, 8px);
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
}

:deep(.p-dialog-header) {
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
  background: var(--surface-0, #ffffff);
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
  border-radius: var(--border-radius-lg, 8px) var(--border-radius-lg, 8px) 0 0;
}

:deep(.p-dialog-content) {
  padding: var(--spacing-lg, 1.5rem);
  background: var(--surface-0, #ffffff);
}

:deep(.p-dialog-footer) {
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
  background: var(--surface-0, #ffffff);
  border-top: 1px solid var(--surface-200, #e0e0e0);
  border-radius: 0 0 var(--border-radius-lg, 8px) var(--border-radius-lg, 8px);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #212529);
}

.modal-content {
  color: var(--text-color, #212529);
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 2rem);
  gap: var(--spacing-md, 1rem);
  min-height: 200px;
}

.modal-loading p {
  margin: 0;
  color: var(--text-color-secondary, #6c757d);
  font-size: var(--font-size-sm, 0.875rem);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md, 1rem);
}

/* Size-specific styles */
.admin-modal--small :deep(.p-dialog) {
  width: 400px;
  max-width: 90vw;
}

.admin-modal--medium :deep(.p-dialog) {
  width: 600px;
  max-width: 90vw;
}

.admin-modal--large :deep(.p-dialog) {
  width: 900px;
  max-width: 90vw;
}

.admin-modal--fullscreen :deep(.p-dialog) {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  border-radius: 0;
}
</style>