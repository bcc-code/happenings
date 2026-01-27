<template>
  <PageContainer>
    <PageHeader
      title="Events"
      subtitle="Create and manage events per tenant, and review registrations."
      eyebrow="Super Admin"
    >
      <template #actions>
        <Button
          label="New event"
          icon="pi pi-plus"
          :disabled="!selectedTenantId"
          @click="openCreate()"
        />
      </template>
    </PageHeader>

    <Card class="mt-4">
      <template #content>
        <div class="toolbar">
          <div class="toolbar__left">
            <div class="field">
              <label class="field__label">Tenant</label>
              <Dropdown
                v-model="selectedTenantId"
                :options="tenants"
                option-label="name"
                option-value="id"
                placeholder="Select a tenant"
                class="w-full"
                :loading="tenantsLoading"
                @change="loadEvents()"
              />
            </div>

            <div class="field">
              <label class="field__label">Search</label>
              <InputText v-model="search" placeholder="Search by title…" class="w-full" />
            </div>
          </div>

          <div class="toolbar__right">
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              :loading="eventsLoading"
              :disabled="!selectedTenantId"
              @click="loadEvents()"
            />
          </div>
        </div>

        <div v-if="!selectedTenantId" class="empty-state">
          Select a tenant to view events.
        </div>

        <DataTable
          v-else
          :value="filteredEvents"
          :loading="eventsLoading"
          dataKey="id"
          responsiveLayout="scroll"
          size="small"
          class="mt-3"
        >
          <Column field="title" header="Title" />
          <Column header="Dates">
            <template #body="{ data }">
              <div class="dates-cell">
                <div>{{ formatDateTime(data.startDate) }}</div>
                <div class="dates-cell__muted">→ {{ formatDateTime(data.endDate) }}</div>
              </div>
            </template>
          </Column>
          <Column field="venue" header="Venue" />
          <Column header="Capacity">
            <template #body="{ data }">
              <span v-if="data.capacity !== null && data.capacity !== undefined">{{ data.capacity }}</span>
              <span v-else class="muted">—</span>
            </template>
          </Column>
          <Column header="Registration window">
            <template #body="{ data }">
              <div class="dates-cell">
                <div>
                  <span class="muted">Open:</span>
                  <span v-if="data.registrationOpen">{{ formatDateTime(data.registrationOpen) }}</span>
                  <span v-else class="muted">—</span>
                </div>
                <div class="dates-cell__muted">
                  <span class="muted">Close:</span>
                  <span v-if="data.registrationClose">{{ formatDateTime(data.registrationClose) }}</span>
                  <span v-else class="muted">—</span>
                </div>
              </div>
            </template>
          </Column>
          <Column header="Actions" :style="{ width: '340px' }">
            <template #body="{ data }">
              <div class="row-actions">
                <Button
                  label="History"
                  icon="pi pi-history"
                  size="small"
                  severity="secondary"
                  outlined
                  @click="openHistory(data)"
                />
                <Button
                  label="Registrations"
                  icon="pi pi-users"
                  size="small"
                  severity="secondary"
                  outlined
                  @click="openRegistrations(data)"
                />
                <Button
                  label="Edit"
                  icon="pi pi-pencil"
                  size="small"
                  severity="secondary"
                  outlined
                  @click="openEdit(data)"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  text
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Dialog v-model:visible="showEventDialog" modal :header="eventDialogTitle" :style="{ width: '760px' }">
      <div class="form">
        <div class="form__grid">
          <div class="field">
            <label class="field__label">Title *</label>
            <InputText v-model="form.title" class="w-full" placeholder="e.g. Winter Retreat" />
          </div>

          <div class="field">
            <label class="field__label">Venue</label>
            <InputText v-model="form.venue" class="w-full" placeholder="e.g. Main campus" />
          </div>

          <div class="field field--full">
            <label class="field__label">Description</label>
            <Textarea v-model="form.description" rows="4" class="w-full" />
          </div>

          <div class="field">
            <label class="field__label">Start *</label>
            <Calendar v-model="form.startDate" showTime hourFormat="24" class="w-full" />
          </div>

          <div class="field">
            <label class="field__label">End *</label>
            <Calendar v-model="form.endDate" showTime hourFormat="24" class="w-full" />
          </div>

          <div class="field">
            <label class="field__label">Capacity</label>
            <InputNumber v-model="form.capacity" class="w-full" :min="0" />
          </div>

          <div class="field">
            <label class="field__label">Registration open</label>
            <Calendar v-model="form.registrationOpen" showTime hourFormat="24" class="w-full" />
          </div>

          <div class="field">
            <label class="field__label">Registration close</label>
            <Calendar v-model="form.registrationClose" showTime hourFormat="24" class="w-full" />
          </div>
        </div>

        <div class="form__actions">
          <Button label="Cancel" severity="secondary" @click="closeEventDialog()" />
          <Button :label="isEditing ? 'Save changes' : 'Create event'" :loading="saving" @click="saveEvent()" />
        </div>
      </div>
    </Dialog>

    <EventAuditLogDialog
      v-model:visible="showAuditLogDialog"
      :event-id="auditLogEventId"
      :event="auditLogEvent"
      :tenant-id="selectedTenantId"
    />

    <Dialog v-model:visible="showRegistrationsDialog" modal header="Registrations" :style="{ width: '900px' }">
      <div class="registrations-header">
        <div>
          <div class="registrations-header__title">{{ registrationsEvent?.title }}</div>
          <div class="registrations-header__subtitle muted">
            {{ registrationsEvent ? `${formatDateTime(registrationsEvent.startDate)} → ${formatDateTime(registrationsEvent.endDate)}` : '' }}
          </div>
        </div>
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="registrationsLoading"
          :disabled="!registrationsEvent"
          @click="registrationsEvent && openRegistrations(registrationsEvent)"
        />
      </div>

      <DataTable
        :value="registrations"
        :loading="registrationsLoading"
        dataKey="id"
        responsiveLayout="scroll"
        size="small"
        class="mt-3"
      >
        <Column header="Attendee">
          <template #body="{ data }">
            <div>
              <div>
                {{ formatName(data.user?.firstName, data.user?.lastName) }}
              </div>
              <div class="muted">{{ data.user?.email }}</div>
            </div>
          </template>
        </Column>
        <Column field="status" header="Status" />
        <Column header="Registered">
          <template #body="{ data }">
            {{ data.registeredAt ? formatDateTime(data.registeredAt) : '—' }}
          </template>
        </Column>
        <Column header="Total">
          <template #body="{ data }">
            <span v-if="data.totalAmount !== null && data.totalAmount !== undefined">{{ data.totalAmount }} {{ data.currency || '' }}</span>
            <span v-else class="muted">—</span>
          </template>
        </Column>
      </DataTable>
    </Dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { computed, onMounted, reactive, ref } from 'vue'
import { PageContainer, PageHeader } from '~/components/containers'
import { useToast } from '~/composables/useToast'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'
import { useRoute } from '#imports'

definePageMeta({
  middleware: 'super-admin-auth',
})

type Tenant = {
  id: string
  name: string
  slug: string
  isActive?: boolean
}

type EventRow = {
  id: string
  tenantId: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  venue: string | null
  capacity: number | null
  registrationOpen: string | null
  registrationClose: string | null
}

type RegistrationRow = {
  id: string
  status: string
  registeredAt: string | null
  totalAmount: string | null
  currency: string | null
  user?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  }
}

const toast = useToast()
const auth = useSuperAdminAuth()
const config = useRuntimeConfig()
const route = useRoute()

const tenants = ref<Tenant[]>([])
const tenantsLoading = ref(false)
const selectedTenantId = ref<string | null>(null)

const events = ref<EventRow[]>([])
const eventsLoading = ref(false)
const search = ref('')

const showEventDialog = ref(false)
const saving = ref(false)
const editingEventId = ref<string | null>(null)

const showRegistrationsDialog = ref(false)
const registrationsLoading = ref(false)
const registrationsEvent = ref<EventRow | null>(null)
const registrations = ref<RegistrationRow[]>([])

const showAuditLogDialog = ref(false)
const auditLogEventId = ref<string | null>(null)
const auditLogEvent = ref<EventRow | null>(null)

const form = reactive({
  title: '',
  description: '' as string | null,
  venue: '' as string | null,
  startDate: null as Date | null,
  endDate: null as Date | null,
  capacity: null as number | null,
  registrationOpen: null as Date | null,
  registrationClose: null as Date | null,
})

const isEditing = computed(() => !!editingEventId.value)
const eventDialogTitle = computed(() => (isEditing.value ? 'Edit event' : 'Create event'))

const filteredEvents = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return events.value
  return events.value.filter((e) => e.title.toLowerCase().includes(q))
})

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatName(firstName?: string | null, lastName?: string | null) {
  const full = [firstName, lastName].filter(Boolean).join(' ')
  return full || 'Unknown attendee'
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.venue = ''
  form.startDate = null
  form.endDate = null
  form.capacity = null
  form.registrationOpen = null
  form.registrationClose = null
  editingEventId.value = null
}

function openCreate() {
  resetForm()
  showEventDialog.value = true
}

function openEdit(event: EventRow) {
  editingEventId.value = event.id
  form.title = event.title
  form.description = event.description
  form.venue = event.venue
  form.startDate = new Date(event.startDate)
  form.endDate = new Date(event.endDate)
  form.capacity = event.capacity
  form.registrationOpen = event.registrationOpen ? new Date(event.registrationOpen) : null
  form.registrationClose = event.registrationClose ? new Date(event.registrationClose) : null
  showEventDialog.value = true
}

function closeEventDialog() {
  showEventDialog.value = false
  saving.value = false
}

async function loadTenants() {
  tenantsLoading.value = true
  try {
    const response = await $fetch<{ data: Tenant[] }>(`${config.public.apiUrl}/api/admin/tenants`, {
      headers: auth.getAuthHeaders(),
    })
    tenants.value = response.data

    if (!selectedTenantId.value && tenants.value.length > 0) {
      selectedTenantId.value = tenants.value[0].id
      await loadEvents()
    }
  } catch (err: any) {
    toast.error('Failed to load tenants', err.message)
  } finally {
    tenantsLoading.value = false
  }
}

async function loadEvents() {
  if (!selectedTenantId.value) return

  eventsLoading.value = true
  try {
    const response = await $fetch<{ data: { events: EventRow[] } }>(
      `${config.public.apiUrl}/api/admin/tenants/${selectedTenantId.value}/events`,
      { headers: auth.getAuthHeaders() }
    )
    events.value = response.data.events
  } catch (err: any) {
    toast.error('Failed to load events', err.message)
  } finally {
    eventsLoading.value = false
  }
}

async function saveEvent() {
  if (!selectedTenantId.value) {
    toast.error('Please select a tenant')
    return
  }

  // Required field validation
  if (!form.title || !form.title.trim()) {
    toast.error('Title is required')
    return
  }
  if (!form.startDate) {
    toast.error('Start date is required')
    return
  }
  if (!form.endDate) {
    toast.error('End date is required')
    return
  }

  // Title length validation
  if (form.title.length > 255) {
    toast.error('Title must be 255 characters or less')
    return
  }

  // Date validation
  if (form.endDate < form.startDate) {
    toast.error('End date must be after start date')
    return
  }

  // Capacity validation
  if (form.capacity !== null && form.capacity !== undefined) {
    if (!Number.isInteger(form.capacity) || form.capacity < 0) {
      toast.error('Capacity must be a non-negative integer')
      return
    }
  }

  // Venue length validation
  if (form.venue && form.venue.length > 255) {
    toast.error('Venue must be 255 characters or less')
    return
  }

  // Registration window validation
  if (form.registrationOpen && form.registrationClose) {
    if (form.registrationClose < form.registrationOpen) {
      toast.error('Registration close must be after registration open')
      return
    }
    if (form.registrationClose > form.startDate) {
      toast.error('Registration close must be before or equal to event start date')
      return
    }
  } else if (form.registrationOpen && !form.registrationClose) {
    if (form.registrationOpen > form.startDate) {
      toast.error('Registration open must be before or equal to event start date')
      return
    }
  } else if (form.registrationClose && !form.registrationOpen) {
    if (form.registrationClose > form.startDate) {
      toast.error('Registration close must be before or equal to event start date')
      return
    }
  }

  saving.value = true
  try {
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      venue: form.venue?.trim() || null,
      startDate: form.startDate.toISOString(),
      endDate: form.endDate.toISOString(),
      capacity: form.capacity,
      registrationOpen: form.registrationOpen ? form.registrationOpen.toISOString() : null,
      registrationClose: form.registrationClose ? form.registrationClose.toISOString() : null,
    }

    if (editingEventId.value) {
      const response = await $fetch<{ data: { event: EventRow } }>(
        `${config.public.apiUrl}/api/admin/tenants/${selectedTenantId.value}/events/${editingEventId.value}`,
        { method: 'PUT', body: payload, headers: auth.getAuthHeaders() }
      )
      const updated = response.data.event
      events.value = events.value.map((e) => (e.id === updated.id ? updated : e))
      toast.success('Event updated')
    } else {
      const response = await $fetch<{ data: { event: EventRow } }>(
        `${config.public.apiUrl}/api/admin/tenants/${selectedTenantId.value}/events`,
        { method: 'POST', body: payload, headers: auth.getAuthHeaders() }
      )
      events.value = [response.data.event, ...events.value]
      toast.success('Event created')
    }

    closeEventDialog()
    resetForm()
  } catch (err: any) {
    toast.error('Failed to save event', err.data?.error || err.message)
  } finally {
    saving.value = false
  }
}

async function confirmDelete(event: EventRow) {
  const { useConfirm } = await import('primevue/useconfirm')
  const confirm = useConfirm()

  confirm.require({
    message: `Delete "${event.title}"? This cannot be undone.`,
    header: 'Confirm delete',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      if (!selectedTenantId.value) return
      try {
        await $fetch(`${config.public.apiUrl}/api/admin/tenants/${selectedTenantId.value}/events/${event.id}`, {
          method: 'DELETE',
          headers: auth.getAuthHeaders(),
        })
        events.value = events.value.filter((e) => e.id !== event.id)
        toast.success('Event deleted')
      } catch (err: any) {
        toast.error('Failed to delete event', err.data?.error || err.message)
      }
    },
  })
}

function openHistory(event: EventRow) {
  auditLogEventId.value = event.id
  auditLogEvent.value = event
  showAuditLogDialog.value = true
}

async function openRegistrations(event: EventRow) {
  if (!selectedTenantId.value) return

  registrationsEvent.value = event
  showRegistrationsDialog.value = true
  registrationsLoading.value = true
  registrations.value = []

  try {
    const response = await $fetch<{ data: { registrations: RegistrationRow[] } }>(
      `${config.public.apiUrl}/api/admin/tenants/${selectedTenantId.value}/events/${event.id}/registrations`,
      { headers: auth.getAuthHeaders() }
    )
    registrations.value = response.data.registrations
  } catch (err: any) {
    toast.error('Failed to load registrations', err.data?.error || err.message)
  } finally {
    registrationsLoading.value = false
  }
}

onMounted(() => {
  loadTenants()
  if (route.query.create === '1') {
    openCreate()
  }
})
</script>

<style scoped>
.mt-3 {
  margin-top: var(--spacing-md, 1rem);
}

.mt-4 {
  margin-top: var(--spacing-lg, 1.5rem);
}

.toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-lg, 1.5rem);
  flex-wrap: wrap;
}

.toolbar__left {
  display: grid;
  grid-template-columns: 320px 320px;
  gap: var(--spacing-md, 1rem);
  align-items: end;
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
}

.field__label {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
  font-weight: 600;
}

.empty-state {
  margin-top: var(--spacing-lg, 1.5rem);
  padding: var(--spacing-md, 1rem);
  border: 1px dashed var(--p-surface-border);
  border-radius: var(--border-radius-md, 6px);
  color: var(--p-text-color-secondary);
}

.row-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 0.5rem);
  justify-content: flex-end;
}

.dates-cell {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
}

.dates-cell__muted {
  color: var(--p-text-color-secondary);
  font-size: 0.875rem;
}

.muted {
  color: var(--p-text-color-secondary);
}

.form__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md, 1rem);
}

.field--full {
  grid-column: 1 / -1;
}

.form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 0.75rem);
  margin-top: var(--spacing-lg, 1.5rem);
}

.registrations-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md, 1rem);
}

.registrations-header__title {
  font-weight: 600;
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .toolbar__left {
    grid-template-columns: 1fr;
    width: 100%;
  }
}
</style>

