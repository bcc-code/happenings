<template>
  <div class="home">
    <Card>
      <template #title>BCC Events</template>
      <template #subtitle>End-user experience (early build)</template>
      <template #content>
        <div class="home__copy">
          Browse events and manage your registrations. Until Auth0 is wired up, use the dev settings page to set a Bearer token and tenant ID.
        </div>

        <div class="home__actions">
          <Button label="Dev settings" icon="pi pi-cog" severity="secondary" outlined @click="navigateTo('/dev')" />
          <Button label="Browse events" icon="pi pi-calendar" :disabled="!auth.isConfigured.value" @click="navigateTo('/events')" />
          <Button label="My registrations" icon="pi pi-ticket" :disabled="!auth.isConfigured.value" @click="navigateTo('/registrations')" />
        </div>

        <Message v-if="!auth.isConfigured.value" severity="warn" class="mt-3">
          Configure your token + tenant ID in Dev settings to call the API.
        </Message>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { useDevAuth } from '~/composables/useDevAuth'

const auth = useDevAuth()
</script>

<style scoped>
.home {
  padding: var(--spacing-xl, 2rem);
  max-width: 960px;
  margin: 0 auto;
}

.home__copy {
  color: var(--p-text-color-secondary);
  line-height: 1.5;
}

.home__actions {
  display: flex;
  gap: var(--spacing-sm, 0.75rem);
  flex-wrap: wrap;
  margin-top: var(--spacing-lg, 1.5rem);
}

.mt-3 {
  margin-top: var(--spacing-md, 1rem);
}
</style>
