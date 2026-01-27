<template>
  <Dialog v-model:visible="visible" modal header="Event History" :style="{ width: '900px' }">
    <div v-if="event" class="audit-header">
      <div>
        <div class="audit-header__title">{{ event.title }}</div>
        <div class="audit-header__subtitle muted">View all changes made to this event</div>
      </div>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        :disabled="!eventId"
        @click="loadAuditLogs()"
      />
    </div>

    <DataTable
      :value="logs"
      :loading="loading"
      dataKey="id"
      responsiveLayout="scroll"
      size="small"
      class="mt-3"
    >
      <Column header="When">
        <template #body="{ data }">
          {{ formatDateTime(data.createdAt) }}
        </template>
      </Column>
      <Column header="Who">
        <template #body="{ data }">
          <div v-if="data.user">
            <div>{{ formatName(data.user.firstName, data.user.lastName) }}</div>
            <div class="muted">{{ data.user.email }}</div>
          </div>
          <div v-else class="muted">Unknown user</div>
        </template>
      </Column>
      <Column header="Action">
        <template #body="{ data }">
          <Tag
            :value="formatOperation(data.operation)"
            :severity="getOperationSeverity(data.operation)"
          />
        </template>
      </Column>
      <Column header="Role">
        <template #body="{ data }">
          <span v-if="data.userRole" class="muted">{{ data.userRole }}</span>
          <span v-else class="muted">—</span>
        </template>
      </Column>
      <Column header="Changes" :style="{ width: '300px' }">
        <template #body="{ data }">
          <div v-if="Object.keys(data.delta || {}).length > 0" class="changes-list">
            <div
              v-for="(change, field) in data.delta"
              :key="field"
              class="change-item"
            >
              <div class="change-item__field">{{ formatFieldName(field) }}</div>
              <div class="change-item__values">
                <div class="change-item__old">
                  <span class="muted">From:</span>
                  <span>{{ formatValue(change.old) }}</span>
                </div>
                <div class="change-item__new">
                  <span class="muted">To:</span>
                  <span>{{ formatValue(change.new) }}</span>
                </div>
              </div>
            </div>
          </div>
          <span v-else class="muted">—</span>
        </template>
      </Column>
    </DataTable>

    <div v-if="!loading && logs.length === 0" class="empty-state">
      No history available for this event.
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import { ref, watch } from 'vue'

type AuditLog = {
  id: string
  operation: 'create' | 'update' | 'delete'
  userId: string
  userRole: string | null
  userIp: string | null
  createdAt: string
  delta: Record<string, { old: unknown; new: unknown }>
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  } | null
}

type Event = {
  id: string
  title: string
}

const props = defineProps<{
  eventId: string | null
  event: Event | null
  tenantId: string | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const visible = defineModel<boolean>('visible', { default: false })
const loading = ref(false)
const logs = ref<AuditLog[]>([])

const config = useRuntimeConfig()
const auth = useSuperAdminAuth()
const toast = useToast()

watch(
  () => [visible.value, props.eventId, props.tenantId],
  ([newVisible, newEventId, newTenantId]) => {
    if (newVisible && newEventId && newTenantId) {
      loadAuditLogs()
    }
  }
)

async function loadAuditLogs() {
  if (!props.eventId || !props.tenantId) return

  loading.value = true
  try {
    const response = await $fetch<{ data: { logs: AuditLog[]; event: Event } }>(
      `${config.public.apiUrl}/api/admin/tenants/${props.tenantId}/events/${props.eventId}/audit-logs`,
      { headers: auth.getAuthHeaders() }
    )
    logs.value = response.data.logs
  } catch (err: any) {
    toast.error('Failed to load audit logs', err.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

function formatName(firstName?: string | null, lastName?: string | null) {
  const full = [firstName, lastName].filter(Boolean).join(' ')
  return full || 'Unknown user'
}

function formatOperation(operation: string) {
  return operation.charAt(0).toUpperCase() + operation.slice(1)
}

function getOperationSeverity(operation: string) {
  switch (operation) {
    case 'create':
      return 'success'
    case 'update':
      return 'info'
    case 'delete':
      return 'danger'
    default:
      return 'secondary'
  }
}

function formatFieldName(field: string) {
  // Convert camelCase to Title Case
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Looks like a date string
    try {
      return formatDateTime(value)
    } catch {
      return value
    }
  }
  return String(value)
}
</script>

<style scoped>
.mt-3 {
  margin-top: var(--spacing-md, 1rem);
}

.muted {
  color: var(--p-text-color-secondary);
  font-size: 0.875rem;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md, 1rem);
  margin-bottom: var(--spacing-md, 1rem);
}

.audit-header__title {
  font-weight: 600;
  font-size: 1.1rem;
}

.audit-header__subtitle {
  margin-top: var(--spacing-2xs, 0.25rem);
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 0.5rem);
}

.change-item {
  padding: var(--spacing-xs, 0.5rem);
  background: var(--p-surface-50);
  border-radius: var(--border-radius-sm, 4px);
  border-left: 3px solid var(--p-primary-color);
}

.change-item__field {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: var(--spacing-2xs, 0.25rem);
}

.change-item__values {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
  font-size: 0.8125rem;
}

.change-item__old {
  color: var(--p-text-color-secondary);
}

.change-item__new {
  color: var(--p-text-color);
}

.empty-state {
  margin-top: var(--spacing-lg, 1.5rem);
  padding: var(--spacing-md, 1rem);
  text-align: center;
  color: var(--p-text-color-secondary);
}
</style>
