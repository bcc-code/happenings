<template>
  <PageContainer>
    <PageHeader
      title="Admin Dashboard"
      subtitle="Monitor event performance, registrations, and operational tasks for all tenants."
      eyebrow="Overview"
    >
      <template #actions>
        <Button
          label="View calendar"
          icon="pi pi-calendar"
          severity="secondary"
          outlined
          @click="goTo('/calendar')"
        />
        <Button
          label="Create event"
          icon="pi pi-plus"
          @click="goTo('/events/new')"
        />
      </template>
    </PageHeader>

    <Grid responsive :min-column-width="'240px'" gap="md">
      <StatCard
        v-for="stat in stats"
        :key="stat.title"
        :label="stat.title"
        :value="stat.value"
        :delta="stat.delta"
        :caption="stat.caption"
        :icon="stat.icon"
        :trend="stat.trend"
      />
    </Grid>

    <br/>

    <ContentGrid>
      <template #primary>
        <Card>
          <template #title>Upcoming events</template>
          <template #subtitle>Next 60 days</template>
          <template #content>
            <DataTable
              :value="upcomingEvents"
              responsiveLayout="scroll"
              size="small"
            >
              <Column field="name" header="Event" />
              <Column field="date" header="Date">
                <template #body="{ data }">
                  {{ formatDate(data.date) }}
                </template>
              </Column>
              <Column field="location" header="Location" />
              <Column header="Status">
                <template #body="{ data }">
                  <Tag
                    :value="statusLabel(data.status)"
                    :severity="statusSeverity(data.status)"
                  />
                </template>
              </Column>
              <Column header="Registrations">
                <template #body="{ data }">
                  <CapacityCell
                    :current="data.registrations"
                    :total="data.capacity"
                  />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

        <Card>
          <template #title>Quick actions</template>
          <template #subtitle>Jump into the most common workflows</template>
          <template #content>
            <Grid responsive :min-column-width="'240px'" gap="md">
              <ActionTile
                v-for="action in quickActions"
                :key="action.label"
                :label="action.label"
                :description="action.description"
                :icon="action.icon"
                :cta="action.cta"
                @click="goTo(action.to)"
              />
            </Grid>
          </template>
        </Card>
      </template>

      <template #secondary>
        <Card>
          <template #title>Pending approvals</template>
          <template #subtitle>Items awaiting admin review</template>
          <template #content>
            <Flex direction="column" gap="sm">
              <ApprovalRow
                v-for="item in approvals"
                :key="item.id"
                :title="item.title"
                :type="item.type"
                :submitted-by="item.submittedBy"
                :submitted-at="item.submittedAt"
                :status="item.status"
                :severity="item.severity"
                @review="goTo(item.to)"
              />
            </Flex>
          </template>
        </Card>

        <Card>
          <template #title>Recent activity</template>
          <template #subtitle>Latest changes across events</template>
          <template #content>
            <Timeline
              :value="recentActivity"
              align="alternate"
            >
              <template #marker="{ item }">
                <TimelineMarker
                  :icon="item.icon"
                  :severity="item.severity"
                />
              </template>
              <template #content="{ item }">
                <ActivityItem
                  :title="item.title"
                  :detail="item.detail"
                  :time="item.time"
                />
              </template>
            </Timeline>
          </template>
        </Card>
      </template>
    </ContentGrid>
  </PageContainer>
</template>

<script setup lang="ts">
// Use super admin layout for sidebar navigation
definePageMeta({
  layout: 'super-admin',
})

import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'
import Timeline from 'primevue/timeline'
import {
  ActionTile,
  ActivityItem,
  ApprovalRow,
  CapacityCell,
  ContentGrid,
  Grid,
  PageContainer,
  PageHeader,
  StatCard,
  TimelineMarker,
} from '~/components/containers'

type TrendDirection = 'up' | 'down'

interface StatCard {
  title: string
  value: string
  delta: string
  caption: string
  icon: string
  trend: TrendDirection
}

interface EventRow {
  name: string
  date: string
  location: string
  status: 'draft' | 'published' | 'live' | 'closed'
  registrations: number
  capacity: number
}

interface ApprovalItem {
  id: number
  title: string
  type: string
  submittedBy: string
  submittedAt: string
  status: string
  severity: 'info' | 'warning' | 'success'
  to: string
}

interface ActivityItem {
  title: string
  detail: string
  time: string
  icon: string
  severity: 'info' | 'success' | 'warning'
}

const stats: StatCard[] = [
  {
    title: 'Active events',
    value: '12',
    delta: '+2 vs last week',
    caption: '3 drafts, 9 published',
    icon: 'pi pi-calendar',
    trend: 'up',
  },
  {
    title: 'Registrations today',
    value: '186',
    delta: '+14%',
    caption: 'Across 5 live events',
    icon: 'pi pi-users',
    trend: 'up',
  },
  {
    title: 'Pending approvals',
    value: '7',
    delta: '2 new',
    caption: 'Content, payments, and tasks',
    icon: 'pi pi-inbox',
    trend: 'up',
  },
  {
    title: 'Check-in readiness',
    value: '92%',
    delta: '-3% vs target',
    caption: 'Badges, QR codes, kiosks',
    icon: 'pi pi-qrcode',
    trend: 'down',
  },
]

const upcomingEvents: EventRow[] = [
  {
    name: 'Winter Youth Retreat',
    date: '2026-02-08',
    location: 'Oslo, NO',
    status: 'live',
    registrations: 184,
    capacity: 220,
  },
  {
    name: 'Leadership Summit',
    date: '2026-02-21',
    location: 'Bergen, NO',
    status: 'published',
    registrations: 92,
    capacity: 150,
  },
  {
    name: 'Family Conference',
    date: '2026-03-05',
    location: 'Copenhagen, DK',
    status: 'published',
    registrations: 244,
    capacity: 320,
  },
  {
    name: 'Music Ministry Intensive',
    date: '2026-03-19',
    location: 'Stockholm, SE',
    status: 'draft',
    registrations: 38,
    capacity: 120,
  },
  {
    name: 'Volunteer Onboarding',
    date: '2026-04-02',
    location: 'Helsinki, FI',
    status: 'draft',
    registrations: 16,
    capacity: 80,
  },
]

const approvals: ApprovalItem[] = [
  {
    id: 1,
    title: 'Refund request – Leadership Summit',
    type: 'Finance',
    submittedBy: 'Maria V.',
    submittedAt: 'Today, 09:10',
    status: 'Awaiting review',
    severity: 'warning',
    to: '/finance/refunds',
  },
  {
    id: 2,
    title: 'Session description updates',
    type: 'Content',
    submittedBy: 'Ben O.',
    submittedAt: 'Today, 08:45',
    status: 'Content pending',
    severity: 'info',
    to: '/content/review',
  },
  {
    id: 3,
    title: 'Vendor contract – Family Conference',
    type: 'Procurement',
    submittedBy: 'Sarah L.',
    submittedAt: 'Yesterday',
    status: 'Signature required',
    severity: 'warning',
    to: '/procurement/contracts',
  },
  {
    id: 4,
    title: 'Volunteer intake batch',
    type: 'Operations',
    submittedBy: 'Ops team',
    submittedAt: 'Yesterday',
    status: 'Ready to approve',
    severity: 'success',
    to: '/volunteers/approvals',
  },
]

const recentActivity: ActivityItem[] = [
  {
    title: 'Registrations increased',
    detail: '+28 new signups for Winter Youth Retreat',
    time: 'Today, 09:24',
    icon: 'pi pi-users',
    severity: 'success',
  },
  {
    title: 'Payment reconciliation',
    detail: '42 payouts processed via Stripe connector',
    time: 'Today, 08:55',
    icon: 'pi pi-credit-card',
    severity: 'info',
  },
  {
    title: 'Content updated',
    detail: 'Session details refreshed for Leadership Summit',
    time: 'Yesterday, 17:40',
    icon: 'pi pi-file-edit',
    severity: 'info',
  },
  {
    title: 'Capacity alert',
    detail: 'Family Conference at 76% capacity',
    time: 'Yesterday, 15:18',
    icon: 'pi pi-exclamation-triangle',
    severity: 'warning',
  },
]

const quickActions = [
  {
    label: 'Publish draft event',
    description: 'Finalize copy, pricing, and attendee flows.',
    icon: 'pi pi-upload',
    cta: 'Open drafts',
    to: '/events/drafts',
  },
  {
    label: 'Review payments',
    description: 'Verify refunds, payouts, and settlement status.',
    icon: 'pi pi-credit-card',
    cta: 'Open finance',
    to: '/finance',
  },
  {
    label: 'Manage volunteers',
    description: 'Assign roles and confirm onboarding steps.',
    icon: 'pi pi-id-card',
    cta: 'Open roster',
    to: '/volunteers',
  },
  {
    label: 'Message attendees',
    description: 'Send segmented email or SMS updates.',
    icon: 'pi pi-envelope',
    cta: 'Compose message',
    to: '/communications',
  },
]

const goTo = (path: string) => navigateTo(path)

const statusLabel = (status: EventRow['status']) => {
  if (status === 'live') return 'Live'
  if (status === 'published') return 'Published'
  if (status === 'draft') return 'Draft'
  return 'Closed'
}

const statusSeverity = (status: EventRow['status']) => {
  if (status === 'live') return 'success'
  if (status === 'published') return 'info'
  if (status === 'draft') return 'warning'
  return 'secondary'
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
</script>
