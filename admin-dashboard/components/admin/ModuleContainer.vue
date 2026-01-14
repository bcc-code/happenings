<template>
  <div class="module-container" :class="containerClass">
    <!-- Header slot -->
    <div v-if="$slots.header || useDefaultHeader" class="module-container__header">
      <slot name="header">
        <ModuleHeader
          v-if="useDefaultHeader"
          :title="headerTitle"
          :subtitle="headerSubtitle"
          :show-back="headerShowBack"
          :back-label="headerBackLabel"
          :breadcrumbs="headerBreadcrumbs"
          :menu-items="headerMenuItems"
          :menu-label="headerMenuLabel"
          :menu-icon="headerMenuIcon"
          :sticky="headerSticky"
          @back="onHeaderBack"
          @menu-click="onHeaderMenuClick"
        >
          <template v-if="$slots['header-title-icon']" #title-icon>
            <slot name="header-title-icon" />
          </template>
          <template v-if="$slots['header-actions']" #actions>
            <slot name="header-actions" />
          </template>
          <template v-if="$slots['header-menu']" #menu>
            <slot name="header-menu" />
          </template>
        </ModuleHeader>
      </slot>
    </div>

    <!-- Main content area -->
    <div class="module-container__body" :class="bodyClass">
      <!-- Sidebar slot (optional) -->
      <aside v-if="$slots.sidebar || sidebarVisible" class="module-container__sidebar" :class="sidebarClass">
        <slot name="sidebar">
          <div v-if="sidebarTitle" class="module-container__sidebar-header">
            <h3>{{ sidebarTitle }}</h3>
          </div>
          <div class="module-container__sidebar-content">
            <slot name="sidebar-content" />
          </div>
        </slot>
      </aside>

      <!-- Main content slot -->
      <main class="module-container__main" :class="mainClass">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ModuleHeader from './ModuleHeader.vue'
import type { BreadcrumbItem } from './types'
import type { MenuItem } from 'primevue/menuitem'

export interface ModuleContainerProps {
  // Header props (when using default header)
  useDefaultHeader?: boolean
  headerTitle?: string
  headerSubtitle?: string
  headerShowBack?: boolean
  headerBackLabel?: string
  headerBreadcrumbs?: BreadcrumbItem[]
  headerMenuItems?: MenuItem[]
  headerMenuLabel?: string
  headerMenuIcon?: string
  headerSticky?: boolean

  // Sidebar props
  sidebarVisible?: boolean
  sidebarWidth?: string
  sidebarCollapsible?: boolean
  sidebarCollapsed?: boolean
  sidebarTitle?: string
  sidebarPosition?: 'left' | 'right'

  // Layout props
  maxWidth?: string
  padding?: boolean
}

const props = withDefaults(defineProps<ModuleContainerProps>(), {
  useDefaultHeader: false,
  headerTitle: undefined,
  headerSubtitle: undefined,
  headerShowBack: false,
  headerBackLabel: undefined,
  headerBreadcrumbs: undefined,
  headerMenuItems: undefined,
  headerMenuLabel: 'More',
  headerMenuIcon: 'pi pi-ellipsis-v',
  headerSticky: false,
  sidebarVisible: false,
  sidebarWidth: '300px',
  sidebarCollapsible: false,
  sidebarCollapsed: false,
  sidebarTitle: undefined,
  sidebarPosition: 'right',
  maxWidth: undefined,
  padding: true,
})

const emit = defineEmits<{
  'header-back': []
  'header-menu-click': []
  'sidebar-toggle': [collapsed: boolean]
}>()

const containerClass = computed(() => {
  return {
    'module-container--no-padding': !props.padding,
  }
})

const bodyClass = computed(() => {
  return {
    'module-container__body--with-sidebar': props.sidebarVisible || !!props.$slots.sidebar,
    [`module-container__body--sidebar-${props.sidebarPosition}`]: props.sidebarVisible || !!props.$slots.sidebar,
  }
})

const sidebarClass = computed(() => {
  return {
    'module-container__sidebar--collapsed': props.sidebarCollapsed,
    'module-container__sidebar--collapsible': props.sidebarCollapsible,
  }
})

const mainClass = computed(() => {
  return {
    'module-container__main--with-sidebar': props.sidebarVisible || !!props.$slots.sidebar,
  }
})

const onHeaderBack = () => {
  emit('header-back')
}

const onHeaderMenuClick = () => {
  emit('header-menu-click')
}
</script>

<style scoped lang="css">
.module-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
}

.module-container--no-padding {
  padding: 0;
}

.module-container__header {
  flex-shrink: 0;
}

.module-container__body {
  display: flex;
  flex: 1;
  gap: var(--spacing-lg, 1.5rem);
  min-width: 0;
}

.module-container__body--with-sidebar {
  flex-direction: row;
}

.module-container__body--sidebar-left {
  flex-direction: row;
}

.module-container__body--sidebar-right {
  flex-direction: row-reverse;
}

.module-container__sidebar {
  flex-shrink: 0;
  width: v-bind('props.sidebarWidth');
  background: var(--surface-0, #ffffff);
  border: 1px solid var(--surface-200, #e0e0e0);
  border-radius: var(--border-radius-md, 6px);
  padding: var(--spacing-lg, 1.5rem);
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  transition: width 0.3s ease, opacity 0.3s ease;
}

.module-container__sidebar--collapsed {
  width: 0;
  padding: 0;
  border: none;
  opacity: 0;
  overflow: hidden;
}

.module-container__sidebar--collapsible {
  position: relative;
}

.module-container__sidebar-header {
  margin-bottom: var(--spacing-md, 1rem);
  padding-bottom: var(--spacing-md, 1rem);
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
}

.module-container__sidebar-header h3 {
  margin: 0;
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #212529);
}

.module-container__sidebar-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 1rem);
}

.module-container__main {
  flex: 1;
  min-width: 0;
  padding: v-bind('props.padding ? "var(--spacing-lg, 1.5rem)" : "0"');
}

.module-container__main--with-sidebar {
  /* Adjust main content when sidebar is present */
}

/* Responsive */
@media (max-width: 1024px) {
  .module-container__body--with-sidebar {
    flex-direction: column;
  }

  .module-container__body--sidebar-left,
  .module-container__body--sidebar-right {
    flex-direction: column;
  }

  .module-container__sidebar {
    width: 100%;
    max-height: none;
  }

  .module-container__sidebar--collapsed {
    display: none;
  }
}

@media (max-width: 768px) {
  .module-container__main {
    padding: v-bind('props.padding ? "var(--spacing-md, 1rem)" : "0"');
  }

  .module-container__sidebar {
    padding: var(--spacing-md, 1rem);
  }
}
</style>