<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="title">My registrations</h1>
        <p class="subtitle">Registrations for the current tenant.</p>
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
          :value="rows"
          :loading="loading"
          dataKey="id"
          responsiveLayout="scroll"
          size="small"
        >
          <Column header="Event">
            <template #body="{ data }">
              <div>
                <div class="event-title">{{ data.event?.title || 'Event' }}</div>
                <div class="muted">{{ data.event?.startDate ? formatDateTime(data.event.startDate) : '' }}</div>
              </div>
            </template>
          </Column>
          <Column field="status" header="Status" />
          <Column header="Registered">
            <template #body="{ data }">
              {{ data.registeredAt ? formatDateTime(data.registeredAt) : '—' }}
            </template>
          </Column>
          <Column header="Actions" :style="{ width: '180px' }">
            <template #body="{ data }">
              <Button
                label="View"
                icon="pi pi-arrow-right"
                size="small"
                severity="secondary"
                outlined
                @click="data.event?.id && navigateTo(`/events/${data.event.id}`)"
              />
            </template>
          </Column>
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

type RegistrationRow = {
  id: string
  status: string
  registeredAt: string | null
  event?: {
    id: string
    title: string
    startDate: string
  }
}

const auth = useDevAuth()
const toast = useToast()
const config = useRuntimeConfig()

const rows = ref<RegistrationRow[]>([])
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
    rows.value = []
    return
  }

  loading.value = true
  try {
    const response = await $fetch<{ data: RegistrationRow[] }>(`${config.public.apiUrl}/api/app/registrations`, {
      headers: auth.getHeaders(),
    })
    rows.value = response.data
  } catch (err: any) {
    toast.error('Failed to load registrations', err.data?.error || err.message)
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

.muted {
  color: var(--p-text-color-secondary);
  font-size: 0.875rem;
}

.event-title {
  font-weight: 600;
}

.mt-3 {
  margin-top: var(--spacing-md, 1rem);
}
</style>

