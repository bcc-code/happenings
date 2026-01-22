<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="title">Events</h1>
        <p class="subtitle">Browse upcoming and active events for your tenant.</p>
      </div>
      <div class="header-actions">
        <Button label="Dev settings" icon="pi pi-cog" severity="secondary" outlined @click="navigateTo('/dev')" />
        <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined :loading="loading" @click="load()" />
      </div>
    </div>

    <Message v-if="!auth.isConfigured.value" severity="warn" class="mt-3">
      Configure your token + tenant ID in Dev settings to call the API.
    </Message>

    <Card class="mt-3">
      <template #content>
        <DataTable
          :value="events"
          :loading="loading"
          dataKey="id"
          responsiveLayout="scroll"
          size="small"
          @row-click="(e) => navigateTo(`/events/${e.data.id}`)"
        >
          <Column field="title" header="Title" />
          <Column header="Dates">
            <template #body="{ data }">
              <div class="dates">
                <div>{{ formatDateTime(data.startDate) }}</div>
                <div class="muted">→ {{ formatDateTime(data.endDate) }}</div>
              </div>
            </template>
          </Column>
          <Column field="venue" header="Venue" />
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import { onMounted, ref } from 'vue'
import { useDevAuth } from '~/composables/useDevAuth'
import { useToast } from '~/composables/useToast'

type EventRow = {
  id: string
  title: string
  startDate: string
  endDate: string
  venue: string | null
  registrationOpen: string | null
  registrationClose: string | null
  capacity: number | null
}

const auth = useDevAuth()
const toast = useToast()
const config = useRuntimeConfig()

const events = ref<EventRow[]>([])
const loading = ref(false)

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

async function load() {
  if (!auth.isConfigured.value) {
    events.value = []
    return
  }

  loading.value = true
  try {
    const response = await $fetch<{ data: EventRow[] }>(`${config.public.apiUrl}/api/app/events`, {
      headers: auth.getHeaders(),
    })
    events.value = response.data
  } catch (err: any) {
    toast.error('Failed to load events', err.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>

<style scoped>
.page {
  padding: var(--spacing-xl, 2rem);
  max-width: 1100px;
  margin: 0 auto;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg, 1.5rem);
  flex-wrap: wrap;
}

.title {
  margin: 0;
  font-size: var(--font-size-2xl, 2rem);
}

.subtitle {
  margin: var(--spacing-xs, 0.25rem) 0 0 0;
  color: var(--p-text-color-secondary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm, 0.75rem);
  flex-wrap: wrap;
}

.dates {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
}

.muted {
  color: var(--p-text-color-secondary);
  font-size: 0.875rem;
}

.mt-3 {
  margin-top: var(--spacing-md, 1rem);
}
</style>

