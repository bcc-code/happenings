<template>
  <div id="app">
    <NuxtPage />
    <!-- Global components for notifications and confirmations -->
    <AdminToast />
    <AdminConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { AdminToast, AdminConfirmDialog } from '~/components/admin'
</script>

<style>
/* Global styles */
/* Design tokens from @bcc-code/design-tokens will be applied here */
</style>
