<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'super-admin-auth',
})

onMounted(() => {
  navigateTo({ path: '/events', query: { create: '1' } })
})
</script>

