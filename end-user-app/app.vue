<template>
  <div id="app">
    <NuxtPage />
    <Toast group="app" />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
</script>

<style>
/* Global styles */
/* Design tokens from @bcc-code/design-tokens will be applied here */
</style>
