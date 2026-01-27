<template>
  <nav class="topbar" data-testid="topbar">
    <div class="topbar__container">
      <!-- Logo/Brand -->
      <div class="topbar__brand">
        <NuxtLink to="/" class="topbar__brand-link">
          <i class="pi pi-calendar topbar__brand-icon" />
          <span class="topbar__brand-text">Admin Dashboard</span>
        </NuxtLink>
      </div>

      <!-- Navigation Menu -->
      <div class="topbar__nav">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="topbar__nav-link"
          :class="{ 'topbar__nav-link--active': isActive(item.to) }"
        >
          <i v-if="item.icon" :class="item.icon" class="topbar__nav-icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>

      <!-- Right side: User menu -->
      <div class="topbar__actions">
        <Menu
          ref="userMenu"
          :model="userMenuItems"
          :popup="true"
        />
        <Button
          :label="userLabel"
          icon="pi pi-user"
          severity="secondary"
          text
          @click="toggleUserMenu"
        />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import { computed, ref } from 'vue'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'

const route = useRoute()
const auth = useSuperAdminAuth()
const userMenu = ref<InstanceType<typeof Menu> | null>(null)

interface NavMenuItem {
  label: string
  to: string
  icon: string
}

const menuItems: NavMenuItem[] = [
  {
    label: 'Dashboard',
    to: '/',
    icon: 'pi pi-home',
  },
  {
    label: 'Events',
    to: '/events',
    icon: 'pi pi-calendar',
  },
  {
    label: 'Calendar',
    to: '/calendar',
    icon: 'pi pi-calendar-plus',
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

const userLabel = computed(() => {
  if (auth.user.value?.username) {
    return auth.user.value.username
  }
  if (auth.user.value?.email) {
    return auth.user.value.email
  }
  return 'User'
})

const userMenuItems: MenuItem[] = [
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: async () => {
      await auth.logout()
    },
  },
]

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

function toggleUserMenu(event: Event) {
  userMenu.value?.toggle(event)
}
</script>

<style scoped>
.topbar {
  background: var(--p-surface-0, #ffffff);
  border-bottom: 2px solid var(--p-surface-border, #e0e0e0);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  flex-shrink: 0;
  display: block !important;
  visibility: visible !important;
  min-height: 64px;
  background-color: #ffffff;
}

.topbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg, 1.5rem);
  height: 64px;
  max-width: 100%;
}

.topbar__brand {
  display: flex;
  align-items: center;
}

.topbar__brand-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  text-decoration: none;
  color: var(--p-text-color);
  font-weight: var(--font-weight-semibold, 600);
  font-size: var(--font-size-lg, 1.125rem);
  transition: color 0.2s;
}

.topbar__brand-link:hover {
  color: var(--p-primary-color);
}

.topbar__brand-icon {
  font-size: var(--font-size-xl, 1.25rem);
  color: var(--p-primary-color);
}

.topbar__brand-text {
  white-space: nowrap;
}

.topbar__nav {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs, 0.5rem);
  margin: 0 var(--spacing-lg, 1.5rem);
}

.topbar__nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 0.5rem);
  padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
  text-decoration: none;
  color: var(--p-text-color);
  border-radius: var(--border-radius-md, 6px);
  transition: all 0.2s;
  font-size: var(--font-size-base, 1rem);
  white-space: nowrap;
}

.topbar__nav-link:hover {
  background: var(--p-surface-hover);
  color: var(--p-text-color);
}

.topbar__nav-link--active {
  background: var(--p-primary-color);
  color: var(--p-primary-color-text);
  font-weight: var(--font-weight-semibold, 600);
}

.topbar__nav-icon {
  font-size: var(--font-size-base, 1rem);
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
}

@media (max-width: 768px) {
  .topbar__container {
    padding: 0 var(--spacing-md, 1rem);
  }

  .topbar__brand-text {
    display: none;
  }

  .topbar__nav {
    margin: 0 var(--spacing-sm, 0.75rem);
    gap: var(--spacing-2xs, 0.25rem);
  }

  .topbar__nav-link span {
    display: none;
  }

  .topbar__nav-link {
    padding: var(--spacing-sm, 0.75rem);
  }
}
</style>
