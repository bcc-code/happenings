<template>
  <div class="module-header" :class="headerClass">
    <!-- Breadcrumbs -->
    <Breadcrumb
      v-if="breadcrumbs && breadcrumbs.length > 0"
      :model="breadcrumbModel"
      class="module-header__breadcrumbs"
    />

    <div class="module-header__content">
      <!-- Left side: Back button, title, subtitle -->
      <div class="module-header__left">
        <Button
          v-if="showBack"
          icon="pi pi-arrow-left"
          text
          rounded
          :aria-label="backLabel || 'Go back'"
          @click="onBack"
        />

        <div class="module-header__title-section">
          <h1 v-if="title" class="module-header__title">
            <slot name="title-icon" />
            {{ title }}
          </h1>
          <p v-if="subtitle" class="module-header__subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <!-- Right side: Actions and menu -->
      <div class="module-header__right">
        <!-- Actions slot -->
        <div v-if="$slots.actions" class="module-header__actions">
          <slot name="actions" />
        </div>

        <!-- Menu slot -->
        <div v-if="$slots.menu" class="module-header__menu">
          <slot name="menu" />
        </div>

        <!-- Default menu button (if menu items provided) -->
        <SplitButton
          v-else-if="menuItems && menuItems.length > 0"
          :label="menuLabel"
          :model="menuItems"
          :icon="menuIcon"
          @click="onMenuClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Breadcrumb from 'primevue/breadcrumb'
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'
import type { MenuItem } from 'primevue/menuitem'
import type { BreadcrumbItem } from '../widgets/types'

export interface ModuleHeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  backLabel?: string
  breadcrumbs?: BreadcrumbItem[]
  menuItems?: MenuItem[]
  menuLabel?: string
  menuIcon?: string
  sticky?: boolean
}

const props = withDefaults(defineProps<ModuleHeaderProps>(), {
  title: undefined,
  subtitle: undefined,
  showBack: false,
  backLabel: undefined,
  breadcrumbs: undefined,
  menuItems: undefined,
  menuLabel: 'More',
  menuIcon: 'pi pi-ellipsis-v',
  sticky: false,
})

const emit = defineEmits<{
  back: []
  'menu-click': []
}>()

const headerClass = computed(() => {
  return {
    'module-header--sticky': props.sticky,
  }
})

const breadcrumbModel = computed(() => {
  if (!props.breadcrumbs) return []
  return props.breadcrumbs.map(item => ({
    label: item.label,
    to: item.to,
    icon: item.icon,
    command: item.command,
  }))
})

const onBack = () => {
  emit('back')
}

const onMenuClick = () => {
  emit('menu-click')
}
</script>

<style scoped lang="css">
.module-header {
  background: var(--surface-0, #ffffff);
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
  padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
  margin-bottom: var(--spacing-lg, 1.5rem);
}

.module-header--sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
}

.module-header__breadcrumbs {
  margin-bottom: var(--spacing-sm, 0.5rem);
}

:deep(.module-header__breadcrumbs .p-breadcrumb) {
  background: transparent;
  border: none;
  padding: 0;
}

.module-header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md, 1rem);
  flex-wrap: wrap;
}

.module-header__left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 1rem);
  flex: 1;
  min-width: 0;
}

.module-header__title-section {
  flex: 1;
  min-width: 0;
}

.module-header__title {
  margin: 0;
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #212529);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
  line-height: var(--line-height-tight, 1.2);
}

.module-header__subtitle {
  margin: var(--spacing-xs, 0.25rem) 0 0 0;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-color-secondary, #6c757d);
  line-height: var(--line-height-base, 1.5);
}

.module-header__right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
  flex-shrink: 0;
}

.module-header__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
}

.module-header__menu {
  display: flex;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .module-header {
    padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
  }

  .module-header__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .module-header__right {
    width: 100%;
    justify-content: flex-end;
  }

  .module-header__title {
    font-size: var(--font-size-xl, 1.25rem);
  }
}
</style>