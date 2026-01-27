<template>
  <div class="super-admin-layout">
    <TopBar />
    <div class="super-admin-layout__content">
      <SuperAdminSidebar />
      <main class="super-admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import SuperAdminSidebar from '~/components/layouts/SuperAdminSidebar.vue';
import TopBar from '~/components/layouts/TopBar.vue';
</script>

<style scoped>
.super-admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.super-admin-layout__content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.super-admin-main {
  flex: 1;
  margin-left: 250px;
  min-height: calc(100vh - 64px);
  padding: var(--spacing-lg, 1.5rem);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .super-admin-main {
    margin-left: 0;
    padding: var(--spacing-md, 1rem);
  }
}
</style>
