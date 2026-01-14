<template>
  <div id="app">
    <NuxtPage />
    <!-- Global components for notifications and confirmations -->
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ConfirmDialog, Toast } from '~/components/widgets';
</script>

<style>
/* Global styles */
/* Design tokens from @bcc-code/design-tokens will be applied here */
</style>
