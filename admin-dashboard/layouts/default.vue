<template>
  <div class="default-layout">
    <TopBar />
    <main class="default-layout__main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import TopBar from '~/components/layouts/TopBar.vue'
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--p-surface-ground);
}

.default-layout__main {
  flex: 1;
  padding: var(--spacing-lg, 1.5rem);
  max-width: 100%;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .default-layout__main {
    padding: var(--spacing-md, 1rem);
  }
}
</style>
