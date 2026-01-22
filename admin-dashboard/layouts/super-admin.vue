<template>
  <div class="super-admin-layout">
    <SuperAdminSidebar />
    <main class="super-admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import SuperAdminSidebar from '~/components/layouts/SuperAdminSidebar.vue'
</script>

<style scoped>
.super-admin-layout {
  display: flex;
  min-height: 100vh;
}

.super-admin-main {
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .super-admin-main {
    margin-left: 0;
  }
}
</style>
