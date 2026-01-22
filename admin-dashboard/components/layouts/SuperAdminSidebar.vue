<template>
  <aside class="super-admin-sidebar">
    <nav class="sidebar-nav">
      <div class="sidebar-nav__header">
        <h3>Super Admin</h3>
      </div>
      <ul class="sidebar-nav__list">
        <li
          v-for="item in menuItems"
          :key="item.to"
          class="sidebar-nav__item"
          :class="{ active: isActive(item.to) }"
        >
          <NuxtLink :to="item.to" class="sidebar-nav__link">
            <i :class="item.icon" class="sidebar-nav__icon" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface MenuItem {
  label: string
  to: string
  icon: string
}

const route = useRoute()

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    to: '/',
    icon: 'pi pi-home',
  },
  {
    label: 'Tenants',
    to: '/tenants',
    icon: 'pi pi-building',
  },
  {
    label: 'Content',
    to: '/content',
    icon: 'pi pi-file-edit',
  },
]

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.super-admin-sidebar {
  width: 250px;
  background: var(--surface-0, #ffffff);
  border-right: 1px solid var(--surface-200, #e0e0e0);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-nav {
  padding: var(--spacing-lg, 1.5rem) 0;
}

.sidebar-nav__header {
  padding: 0 var(--spacing-lg, 1.5rem) var(--spacing-md, 1rem);
  border-bottom: 1px solid var(--surface-200, #e0e0e0);
  margin-bottom: var(--spacing-md, 1rem);
}

.sidebar-nav__header h3 {
  margin: 0;
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-color, #212529);
}

.sidebar-nav__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav__item {
  margin: 0;
}

.sidebar-nav__link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  padding: var(--spacing-sm, 0.75rem) var(--spacing-lg, 1.5rem);
  color: var(--text-color, #212529);
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.sidebar-nav__link:hover {
  background-color: var(--surface-hover, #f5f5f5);
}

.sidebar-nav__item.active .sidebar-nav__link {
  background-color: var(--p-primary-color);
  color: var(--p-primary-color-text);
  font-weight: var(--font-weight-semibold, 600);
}

.sidebar-nav__icon {
  font-size: var(--font-size-lg, 1.125rem);
}
</style>
