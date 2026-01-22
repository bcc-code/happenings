<template>
  <div class="page">
    <div class="page__header">
      <Button label="Back" icon="pi pi-arrow-left" severity="secondary" outlined @click="navigateTo('/events')" />
      <div class="header-actions">
        <Button label="Dev settings" icon="pi pi-cog" severity="secondary" outlined @click="navigateTo('/dev')" />
      </div>
    </div>

    <Message v-if="!auth.isConfigured.value" severity="warn" class="mt-3">
      Configure your token + tenant ID in Dev settings to call the API.
    </Message>

    <Card class="mt-3">
      <template #title>{{ event?.title || 'Event' }}</template>
      <template #subtitle>
        <span v-if="event">
          {{ formatDateTime(event.startDate) }} → {{ formatDateTime(event.endDate) }}
          <span v-if="event.venue"> · {{ event.venue }}</span>
        </span>
      </template>
      <template #content>
        <div v-if="loading">Loading…</div>

        <div v-else-if="event" class="content">
          <p v-if="event.description" class="description">{{ event.description }}</p>

          <div class="status-card">
            <div class="status-card__row">
              <div class="status-card__label">Registration status</div>
              <div class="status-card__value">
                <span v-if="myRegistration">Registered ({{ myRegistration.status }})</span>
                <span v-else class="muted">Not registered</span>
              </div>
            </div>

            <div class="status-card__actions">
              <Button
                v-if="!myRegistration"
                label="Register"
                icon="pi pi-check"
                :loading="saving"
                :disabled="!auth.isConfigured.value"
                @click="register()"
              />
              <Button
                v-else
                label="Cancel registration"
                icon="pi pi-times"
                severity="danger"
                outlined
                :loading="saving"
                @click="cancel()"
              />
            </div>
          </div>
        </div>

        <div v-else class="muted">Event not found.</div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { computed, onMounted, ref } from 'vue'
import { useDevAuth } from '~/composables/useDevAuth'
import { useToast } from '~/composables/useToast'

type EventRow = {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  venue: string | null
}

type RegistrationRow = {
  id: string
  eventId: string
  status: string
  registeredAt: string | null
}

const route = useRoute()
const auth = useDevAuth()
const toast = useToast()
const config = useRuntimeConfig()

const event = ref<EventRow | null>(null)
const registrations = ref<RegistrationRow[]>([])
const loading = ref(false)
const saving = ref(false)

const eventId = computed(() => String(route.params.id))
const myRegistration = computed(() => registrations.value.find((r) => r.eventId === eventId.value) || null)

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
  if (!auth.isConfigured.value) return
  loading.value = true
  try {
    const [eventRes, regsRes] = await Promise.all([
      $fetch<{ data: EventRow }>(`${config.public.apiUrl}/api/app/events/${eventId.value}`, { headers: auth.getHeaders() }),
      $fetch<{ data: RegistrationRow[] }>(`${config.public.apiUrl}/api/app/registrations`, { headers: auth.getHeaders() }),
    ])
    event.value = eventRes.data
    registrations.value = regsRes.data
  } catch (err: any) {
    toast.error('Failed to load event', err.data?.error || err.message)
    event.value = null
  } finally {
    loading.value = false
  }
}

async function register() {
  if (!auth.isConfigured.value) return
  saving.value = true
  try {
    await $fetch(`${config.public.apiUrl}/api/app/registrations`, {
      method: 'POST',
      headers: auth.getHeaders(),
      body: { eventId: eventId.value },
    })
    toast.success('Registered')
    await load()
  } catch (err: any) {
    toast.error('Failed to register', err.data?.error || err.message)
  } finally {
    saving.value = false
  }
}

async function cancel() {
  if (!auth.isConfigured.value || !myRegistration.value) return
  saving.value = true
  try {
    await $fetch(`${config.public.apiUrl}/api/app/registrations/${myRegistration.value.id}/cancel`, {
      method: 'POST',
      headers: auth.getHeaders(),
    })
    toast.success('Cancelled')
    await load()
  } catch (err: any) {
    toast.error('Failed to cancel', err.data?.error || err.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => load())
</script>

<style scoped>
.page {
  padding: var(--spacing-xl, 2rem);
  max-width: 960px;
  margin: 0 auto;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md, 1rem);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm, 0.75rem);
}

.mt-3 {
  margin-top: var(--spacing-md, 1rem);
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 1.5rem);
}

.description {
  margin: 0;
  color: var(--p-text-color-secondary);
  line-height: 1.6;
}

.status-card {
  border: 1px solid var(--p-surface-border);
  border-radius: var(--border-radius-md, 6px);
  padding: var(--spacing-md, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 1rem);
}

.status-card__row {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md, 1rem);
  flex-wrap: wrap;
}

.status-card__label {
  font-weight: 600;
}

.status-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 0.75rem);
}

.muted {
  color: var(--p-text-color-secondary);
}
</style>

