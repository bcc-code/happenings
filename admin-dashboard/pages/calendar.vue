<template>
  <PageContainer>
    <PageHeader
      title="Calendar"
      subtitle="View and manage events across all tenants in a calendar view."
      eyebrow="Super Admin"
    >
      <template #actions>
        <Button
          label="New event"
          icon="pi pi-plus"
          :disabled="!selectedTenantId"
          @click="goTo('/events/new')"
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
              <label class="field__label">View</label>
              <SelectButton
                v-model="viewMode"
                :options="viewOptions"
                option-label="label"
                option-value="value"
              />
            </div>
          </div>

          <div class="toolbar__right">
            <Button
              icon="pi pi-chevron-left"
              severity="secondary"
              text
              rounded
              @click="navigateDate(-1)"
            />
            <Button
              :label="currentDateLabel"
              severity="secondary"
              outlined
              @click="goToToday()"
            />
            <Button
              icon="pi pi-chevron-right"
              severity="secondary"
              text
              rounded
              @click="navigateDate(1)"
            />
            <Button
              label="Today"
              icon="pi pi-calendar"
              severity="secondary"
              outlined
              @click="goToToday()"
            />
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

        <div v-else class="calendar-container">
          <!-- Debug info (remove in production) -->
          <div v-if="events.length === 0 && !eventsLoading" class="empty-events-state">
            No events found for the selected tenant.
          </div>
          <div v-else class="events-debug-info" style="padding: 0.5rem; background: #f0f0f0; margin-bottom: 1rem; font-size: 0.75rem;">
            Debug: Total events: {{ eventsDebug.totalEvents }}, 
            Events with dates: {{ eventsDebug.eventsWithDates }}, 
            Events in current month: {{ eventsDebug.currentMonthEvents }}
            <div v-if="eventsDebug.sampleEvent">
              Sample event: {{ eventsDebug.sampleEvent.title }} 
              ({{ eventsDebug.sampleEvent.startDate }} - {{ eventsDebug.sampleEvent.endDate }})
            </div>
          </div>

          <!-- Month View -->
          <div v-if="viewMode === 'month'" class="calendar-month">
            <div class="calendar-header">
              <div
                v-for="day in weekDays"
                :key="day"
                class="calendar-header-cell"
              >
                {{ day }}
              </div>
            </div>
            <div class="calendar-grid">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  'calendar-day--other-month': day.isOtherMonth,
                  'calendar-day--today': day.isToday,
                }"
              >
                <div class="calendar-day-number">{{ day.date.getDate() }}</div>
                <div class="calendar-day-events">
                  <div
                    v-for="event in day.events"
                    :key="event.id"
                    class="calendar-event"
                    :class="getEventClass(event)"
                    @click="openEventDetails(event)"
                  >
                    <div class="calendar-event-time">
                      {{ formatEventTime(event) }}
                    </div>
                    <div class="calendar-event-title">{{ event.title }}</div>
                  </div>
                  <!-- Debug: show count if events exist but aren't rendering -->
                  <div v-if="day.events.length > 0" class="calendar-event-debug" style="font-size: 10px; color: red;">
                    {{ day.events.length }} event(s)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Week View -->
          <div v-else-if="viewMode === 'week'" class="calendar-week">
            <div class="calendar-week-header">
              <div class="calendar-week-time-column"></div>
              <div
                v-for="day in weekDaysData"
                :key="day.date.toISOString()"
                class="calendar-week-day-header"
                :class="{ 'calendar-week-day-header--today': day.isToday }"
              >
                <div class="calendar-week-day-name">{{ day.dayName }}</div>
                <div class="calendar-week-day-number">{{ day.dayNumber }}</div>
              </div>
            </div>
            <div class="calendar-week-body">
              <div class="calendar-week-time-column">
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="calendar-week-hour"
                >
                  {{ formatHour(hour) }}
                </div>
              </div>
              <div
                v-for="day in weekDaysData"
                :key="day.date.toISOString()"
                class="calendar-week-day-column"
              >
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="calendar-week-hour-cell"
                >
                  <div
                    v-for="event in getEventsForDayAndHour(day.date, hour)"
                    :key="event.id"
                    class="calendar-week-event"
                    :style="getWeekEventStyle(event, day.date, hour)"
                    @click="openEventDetails(event)"
                  >
                    <div class="calendar-week-event-title">{{ event.title }}</div>
                    <div class="calendar-week-event-time">
                      {{ formatEventTime(event) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Day View -->
          <div v-else class="calendar-day-view">
            <div class="calendar-day-view-header">
              <div class="calendar-day-view-date">
                <div class="calendar-day-view-day-name">
                  {{ currentDate.toLocaleDateString('en', { weekday: 'long' }) }}
                </div>
                <div class="calendar-day-view-date-number">
                  {{ currentDate.toLocaleDateString('en', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  }) }}
                </div>
              </div>
            </div>
            <div class="calendar-day-view-body">
              <div class="calendar-day-view-time-column">
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="calendar-day-view-hour"
                >
                  {{ formatHour(hour) }}
                </div>
              </div>
              <div class="calendar-day-view-events-column">
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="calendar-day-view-hour-cell"
                >
                  <div
                    v-for="event in getEventsForDayAndHour(currentDate, hour)"
                    :key="event.id"
                    class="calendar-day-view-event"
                    :style="getDayEventStyle(event, hour)"
                    @click="openEventDetails(event)"
                  >
                    <div class="calendar-day-view-event-title">
                      {{ event.title }}
                    </div>
                    <div class="calendar-day-view-event-time">
                      {{ formatEventTime(event) }}
                    </div>
                    <div v-if="event.venue" class="calendar-day-view-event-venue">
                      <i class="pi pi-map-marker" />
                      {{ event.venue }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Event Details Dialog -->
    <Dialog
      v-model:visible="showEventDialog"
      modal
      :header="selectedEvent?.title || 'Event Details'"
      :style="{ width: '600px' }"
    >
      <div v-if="selectedEvent" class="event-details">
        <div class="event-details-section">
          <div class="event-details-label">Dates</div>
          <div class="event-details-value">
            {{ formatDateTime(selectedEvent.startDate) }} →
            {{ formatDateTime(selectedEvent.endDate) }}
          </div>
        </div>

        <div v-if="selectedEvent.venue" class="event-details-section">
          <div class="event-details-label">Venue</div>
          <div class="event-details-value">{{ selectedEvent.venue }}</div>
        </div>

        <div v-if="selectedEvent.description" class="event-details-section">
          <div class="event-details-label">Description</div>
          <div class="event-details-value">{{ selectedEvent.description }}</div>
        </div>

        <div v-if="selectedEvent.capacity" class="event-details-section">
          <div class="event-details-label">Capacity</div>
          <div class="event-details-value">{{ selectedEvent.capacity }}</div>
        </div>

        <div
          v-if="selectedEvent.registrationOpen || selectedEvent.registrationClose"
          class="event-details-section"
        >
          <div class="event-details-label">Registration Window</div>
          <div class="event-details-value">
            <div v-if="selectedEvent.registrationOpen">
              Open: {{ formatDateTime(selectedEvent.registrationOpen) }}
            </div>
            <div v-if="selectedEvent.registrationClose">
              Close: {{ formatDateTime(selectedEvent.registrationClose) }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="View Details"
          icon="pi pi-external-link"
          @click="goToEventDetails()"
        />
        <Button
          label="Close"
          severity="secondary"
          @click="showEventDialog = false"
        />
      </template>
    </Dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import { computed, onMounted, ref } from 'vue'
import { PageContainer, PageHeader } from '~/components/containers'
import { useToast } from '~/composables/useToast'
import { useSuperAdminAuth } from '~/composables/useSuperAdminAuth'

definePageMeta({
  middleware: 'super-admin-auth',
  layout: 'super-admin',
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

type CalendarDay = {
  date: Date
  isOtherMonth: boolean
  isToday: boolean
  events: EventRow[]
}

type ViewMode = 'month' | 'week' | 'day'

const toast = useToast()
const auth = useSuperAdminAuth()
const config = useRuntimeConfig()

const tenants = ref<Tenant[]>([])
const tenantsLoading = ref(false)
const selectedTenantId = ref<string | null>(null)

const events = ref<EventRow[]>([])
const eventsLoading = ref(false)

const currentDate = ref(new Date())
const viewMode = ref<ViewMode>('month')

const showEventDialog = ref(false)
const selectedEvent = ref<EventRow | null>(null)

const viewOptions = [
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Day', value: 'day' },
]

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hours = Array.from({ length: 24 }, (_, i) => i)

// Debug computed to track events
const eventsDebug = computed(() => {
  return {
    totalEvents: events.value.length,
    eventsWithDates: events.value.filter(e => e.startDate && e.endDate).length,
    sampleEvent: events.value[0] || null,
    currentMonthEvents: calendarDays.value.reduce((sum, day) => sum + day.events.length, 0),
  }
})

// Watch for debugging
watch(events, (newEvents) => {
  console.log('Events changed:', newEvents.length, newEvents)
}, { deep: true })

const currentDateLabel = computed(() => {
  if (viewMode.value === 'month') {
    return currentDate.value.toLocaleDateString('en', {
      month: 'long',
      year: 'numeric',
    })
  } else if (viewMode.value === 'week') {
    const weekStart = getWeekStart(currentDate.value)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return `${weekStart.toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
    })} - ${weekEnd.toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`
  } else {
    return currentDate.value.toLocaleDateString('en', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // First day of the month
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)

  // Days to show (including previous/next month days to fill the grid)
  const days: CalendarDay[] = []

  // Previous month days
  const prevMonthDays = firstDayOfWeek
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({
      date,
      isOtherMonth: true,
      isToday: isToday(date),
      events: getEventsForDate(date),
    })
  }

  // Current month days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    days.push({
      date,
      isOtherMonth: false,
      isToday: isToday(date),
      events: getEventsForDate(date),
    })
  }

  // Next month days to fill the grid (6 rows = 42 days)
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date,
      isOtherMonth: true,
      isToday: isToday(date),
      events: getEventsForDate(date),
    })
  }

  return days
})

const weekDaysData = computed(() => {
  const weekStart = getWeekStart(currentDate.value)
  const days: Array<{
    date: Date
    dayName: string
    dayNumber: number
    isToday: boolean
  }> = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    days.push({
      date,
      dayName: date.toLocaleDateString('en', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: isToday(date),
    })
  }

  return days
})

function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

function getEventsForDate(date: Date): EventRow[] {
  if (!events.value || events.value.length === 0) {
    return []
  }
  
  const matchingEvents = events.value.filter((event) => {
    if (!event.startDate || !event.endDate) {
      console.warn('Event missing dates:', event)
      return false
    }
    
    try {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      
      // Check for invalid dates
      if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
        console.warn('Invalid event dates:', event)
        return false
      }
      
      // Normalize dates to start of day for comparison (local time)
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const eventStartDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
      const eventEndDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())

      // Check if event overlaps with this date
      // Event is on this date if: dateStart is between eventStartDay and eventEndDay (inclusive)
      const matches = dateStart.getTime() >= eventStartDay.getTime() && dateStart.getTime() <= eventEndDay.getTime()
      
      if (matches) {
        console.log(`Event "${event.title}" matches date ${date.toDateString()}:`, {
          dateStart: dateStart.toDateString(),
          eventStart: eventStartDay.toDateString(),
          eventEnd: eventEndDay.toDateString(),
        })
      }
      
      return matches
    } catch (err) {
      console.error('Error filtering event:', err, event)
      return false
    }
  })
  
  return matchingEvents
}

function getEventsForDayAndHour(day: Date, hour: number): EventRow[] {
  if (!events.value || events.value.length === 0) return []
  
  return events.value.filter((event) => {
    if (!event.startDate || !event.endDate) return false
    
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)

    // Normalize dates to start of day for comparison (local time)
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    const eventStartDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
    const eventEndDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())

    // Check if event is on this day
    if (dayStart.getTime() < eventStartDay.getTime() || dayStart.getTime() > eventEndDay.getTime()) {
      return false
    }

    // Check if event overlaps with this hour
    // For events that span multiple days, show them in the hour they start on this day
    const eventStartHour = eventStart.getHours()
    const eventEndHour = eventEnd.getHours()
    
    // If event starts on this day, use its start hour; otherwise use 0
    const relevantStartHour = eventStartDay.getTime() === dayStart.getTime() ? eventStartHour : 0
    // If event ends on this day, use its end hour; otherwise use 23
    const relevantEndHour = eventEndDay.getTime() === dayStart.getTime() ? eventEndHour : 23

    return hour >= relevantStartHour && hour <= relevantEndHour
  })
}

function getEventClass(event: EventRow): string {
  const now = new Date()
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)

  if (end < now) return 'calendar-event--past'
  if (start <= now && end >= now) return 'calendar-event--current'
  return 'calendar-event--upcoming'
}

function formatEventTime(event: EventRow): string {
  const start = new Date(event.startDate)
  return start.toLocaleTimeString('en', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getWeekEventStyle(
  event: EventRow,
  day: Date,
  hour: number
): Record<string, string> {
  const eventStart = new Date(event.startDate)
  const eventEnd = new Date(event.endDate)
  const eventStartHour = eventStart.getHours()
  const eventStartMinute = eventStart.getMinutes()
  const eventEndHour = eventEnd.getHours()
  const eventEndMinute = eventEnd.getMinutes()

  // Calculate duration in hours
  const duration =
    (eventEndHour - eventStartHour) * 60 +
    (eventEndMinute - eventStartMinute)
  const height = Math.max((duration / 60) * 100, 20) // Minimum 20% height

  // Calculate top offset
  const top = (eventStartMinute / 60) * 100

  return {
    height: `${height}%`,
    top: `${top}%`,
  }
}

function getDayEventStyle(event: EventRow, hour: number): Record<string, string> {
  const eventStart = new Date(event.startDate)
  const eventEnd = new Date(event.endDate)
  const eventStartHour = eventStart.getHours()
  const eventStartMinute = eventStart.getMinutes()
  const eventEndHour = eventEnd.getHours()
  const eventEndMinute = eventEnd.getMinutes()

  // Calculate duration in hours
  const duration =
    (eventEndHour - eventStartHour) * 60 +
    (eventEndMinute - eventStartMinute)
  const height = Math.max((duration / 60) * 100, 20) // Minimum 20% height

  // Calculate top offset
  const top = (eventStartMinute / 60) * 100

  return {
    height: `${height}%`,
    top: `${top}%`,
  }
}

function navigateDate(direction: number) {
  const newDate = new Date(currentDate.value)
  if (viewMode.value === 'month') {
    newDate.setMonth(newDate.getMonth() + direction)
  } else if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + direction * 7)
  } else {
    newDate.setDate(newDate.getDate() + direction)
  }
  currentDate.value = newDate
}

function goToToday() {
  currentDate.value = new Date()
}

function openEventDetails(event: EventRow) {
  selectedEvent.value = event
  showEventDialog.value = true
}

function goToEventDetails() {
  if (selectedEvent.value && selectedTenantId.value) {
    navigateTo(`/events?tenant=${selectedTenantId.value}&event=${selectedEvent.value.id}`)
  }
}

function goTo(path: string) {
  navigateTo(path)
}

async function loadTenants() {
  tenantsLoading.value = true
  try {
    const response = await $fetch<{ data: Tenant[] }>(
      `${config.public.apiUrl}/api/admin/tenants`,
      {
        headers: auth.getAuthHeaders(),
      }
    )
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
    const response = await $fetch<any>(
      `${config.public.apiUrl}/api/admin/tenants/${selectedTenantId.value}/events`,
      { headers: auth.getAuthHeaders() }
    )
    
    // Debug: log the response structure
    console.log('Calendar API Response:', response)
    
    // Handle response structure: { data: { tenant, events: [...] } }
    if (response?.data?.events) {
      events.value = response.data.events
      console.log('Loaded events:', events.value.length, events.value)
    } else if (Array.isArray(response?.data)) {
      // Fallback: if data is directly an array
      events.value = response.data
      console.log('Loaded events (array):', events.value.length)
    } else {
      events.value = []
      console.warn('Unexpected response structure:', response)
    }
  } catch (err: any) {
    console.error('Error loading events:', err)
    toast.error('Failed to load events', err.message)
    events.value = []
  } finally {
    eventsLoading.value = false
  }
}

onMounted(() => {
  loadTenants()
})
</script>

<style scoped>
.mt-4 {
  margin-top: var(--spacing-lg, 1.5rem);
}

.toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-lg, 1.5rem);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-lg, 1.5rem);
}

.toolbar__left {
  display: flex;
  gap: var(--spacing-md, 1rem);
  align-items: end;
  flex-wrap: wrap;
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
  min-width: 200px;
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
  text-align: center;
}

.empty-events-state {
  margin-top: var(--spacing-md, 1rem);
  padding: var(--spacing-md, 1rem);
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-border);
  border-radius: var(--border-radius-md, 6px);
  color: var(--p-text-color-secondary);
  text-align: center;
  font-size: var(--font-size-sm, 0.875rem);
}

/* Month View */
.calendar-month {
  margin-top: var(--spacing-md, 1rem);
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-2xs, 0.25rem);
  margin-bottom: var(--spacing-xs, 0.5rem);
}

.calendar-header-cell {
  padding: var(--spacing-xs, 0.5rem);
  text-align: center;
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-2xs, 0.25rem);
}

.calendar-day {
  min-height: 120px;
  border: 1px solid var(--p-surface-border);
  border-radius: var(--border-radius-sm, 4px);
  padding: var(--spacing-xs, 0.5rem);
  background: var(--p-surface-0);
  display: flex;
  flex-direction: column;
}

.calendar-day--other-month {
  opacity: 0.4;
  background: var(--p-surface-50);
}

.calendar-day--today {
  background: var(--p-primary-50);
  border-color: var(--p-primary-200);
}

.calendar-day-number {
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  margin-bottom: var(--spacing-2xs, 0.25rem);
}

.calendar-day-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
  overflow-y: auto;
}

.calendar-event {
  padding: var(--spacing-2xs, 0.25rem);
  border-radius: var(--border-radius-sm, 4px);
  cursor: pointer;
  transition: all 0.2s;
  font-size: var(--font-size-xs, 0.75rem);
}

.calendar-event:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.calendar-event--upcoming {
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  border-left: 3px solid var(--p-primary-500);
}

.calendar-event--current {
  background: var(--p-success-100);
  color: var(--p-success-700);
  border-left: 3px solid var(--p-success-500);
}

.calendar-event--past {
  background: var(--p-surface-200);
  color: var(--p-text-color-secondary);
  border-left: 3px solid var(--p-surface-400);
}

.calendar-event-time {
  font-weight: 600;
  margin-bottom: 2px;
}

.calendar-event-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Week View */
.calendar-week {
  margin-top: var(--spacing-md, 1rem);
}

.calendar-week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: var(--spacing-2xs, 0.25rem);
  margin-bottom: var(--spacing-xs, 0.5rem);
}

.calendar-week-time-column {
  padding: var(--spacing-xs, 0.5rem);
}

.calendar-week-day-header {
  padding: var(--spacing-xs, 0.5rem);
  text-align: center;
  border: 1px solid var(--p-surface-border);
  border-radius: var(--border-radius-sm, 4px);
  background: var(--p-surface-0);
}

.calendar-week-day-header--today {
  background: var(--p-primary-50);
  border-color: var(--p-primary-200);
}

.calendar-week-day-name {
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
}

.calendar-week-day-number {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: 600;
  margin-top: var(--spacing-2xs, 0.25rem);
}

.calendar-week-body {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: var(--spacing-2xs, 0.25rem);
  max-height: 600px;
  overflow-y: auto;
}

.calendar-week-hour {
  padding: var(--spacing-2xs, 0.25rem);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--p-text-color-secondary);
  text-align: right;
  border-right: 1px solid var(--p-surface-border);
  height: 60px;
}

.calendar-week-day-column {
  display: flex;
  flex-direction: column;
}

.calendar-week-hour-cell {
  height: 60px;
  border: 1px solid var(--p-surface-border);
  border-top: none;
  position: relative;
  background: var(--p-surface-0);
}

.calendar-week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: var(--spacing-2xs, 0.25rem);
  border-radius: var(--border-radius-sm, 4px);
  cursor: pointer;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  border-left: 3px solid var(--p-primary-500);
  font-size: var(--font-size-xs, 0.75rem);
  overflow: hidden;
  z-index: 1;
}

.calendar-week-event-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.calendar-week-event-time {
  font-size: 0.7rem;
  margin-top: 2px;
}

/* Day View */
.calendar-day-view {
  margin-top: var(--spacing-md, 1rem);
}

.calendar-day-view-header {
  margin-bottom: var(--spacing-md, 1rem);
  padding: var(--spacing-md, 1rem);
  border-bottom: 2px solid var(--p-surface-border);
}

.calendar-day-view-day-name {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: 600;
  color: var(--p-text-color-secondary);
}

.calendar-day-view-date-number {
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: 600;
  margin-top: var(--spacing-2xs, 0.25rem);
}

.calendar-day-view-body {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: var(--spacing-2xs, 0.25rem);
  max-height: 700px;
  overflow-y: auto;
}

.calendar-day-view-time-column {
  display: flex;
  flex-direction: column;
}

.calendar-day-view-hour {
  padding: var(--spacing-2xs, 0.25rem);
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--p-text-color-secondary);
  text-align: right;
  border-right: 1px solid var(--p-surface-border);
  height: 60px;
}

.calendar-day-view-events-column {
  display: flex;
  flex-direction: column;
}

.calendar-day-view-hour-cell {
  height: 60px;
  border: 1px solid var(--p-surface-border);
  border-top: none;
  position: relative;
  background: var(--p-surface-0);
}

.calendar-day-view-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: var(--spacing-sm, 0.75rem);
  border-radius: var(--border-radius-sm, 4px);
  cursor: pointer;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  border-left: 3px solid var(--p-primary-500);
  z-index: 1;
}

.calendar-day-view-event-title {
  font-weight: 600;
  font-size: var(--font-size-base, 1rem);
  margin-bottom: var(--spacing-2xs, 0.25rem);
}

.calendar-day-view-event-time {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
  margin-bottom: var(--spacing-2xs, 0.25rem);
}

.calendar-day-view-event-venue {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--p-text-color-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2xs, 0.25rem);
}

/* Event Details Dialog */
.event-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 1rem);
}

.event-details-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs, 0.25rem);
}

.event-details-label {
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--p-text-color-secondary);
}

.event-details-value {
  color: var(--p-text-color);
}

@media (max-width: 900px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar__left {
    flex-direction: column;
  }

  .toolbar__right {
    justify-content: space-between;
  }

  .field {
    min-width: 100%;
  }
}
</style>
