# Permission System - Usage Examples

## Example 1: Protecting an API Route with Permissions

```typescript
// api/src/routes/admin/events.ts

import { requirePermission } from '../../utils/permissions';
import type { AuthenticatedContext } from '../../middleware/auth';

export async function getEvent({ params, store }: AuthenticatedContext) {
  const tenantId = store.user?.tenantId;
  const { id } = params as { id: string };

  if (!tenantId) {
    return error('Tenant ID required', 'TENANT_ID_REQUIRED', 400);
  }

  // Check if user has view permission for this event
  const permissionResult = await requirePermission(
    { store },
    'Event',
    id,
    'view'
  );

  if (permissionResult instanceof Response) {
    return permissionResult; // Returns 403 Forbidden
  }

  // User has permission, fetch and return event
  const row = await db.query.events.findFirst({
    where: and(eq(events.id, id), eq(events.tenantId, tenantId)),
  });

  if (!row) {
    return error('Event not found', 'NOT_FOUND', 404);
  }

  return success(row);
}

export async function updateEvent({ params, body, store }: AuthenticatedContext) {
  const tenantId = store.user?.tenantId;
  const { id } = params as { id: string };

  // Check if user has edit permission
  const permissionResult = await requirePermission(
    { store },
    'Event',
    id,
    'edit'
  );

  if (permissionResult instanceof Response) {
    return permissionResult;
  }

  // User can edit, proceed with update
  // ...
}
```

## Example 2: Assigning Groups When Event Status Changes

```typescript
// api/src/routes/admin/events.ts

import {
  assignToGroup,
  removeFromGroup,
  getOrCreateSystemGroup,
} from '../../utils/permissions';

export async function updateEvent({ params, body, store }: AuthenticatedContext) {
  const tenantId = store.user?.tenantId;
  const userId = store.user?.id;
  const { id } = params as { id: string };
  const { status, ...updateData } = body as { status?: string };

  // Check edit permission first
  const permissionResult = await requirePermission(
    { store },
    'Event',
    id,
    'edit'
  );

  if (permissionResult instanceof Response) {
    return permissionResult;
  }

  // Update event
  const [updated] = await db
    .update(events)
    .set({ ...updateData, status, updatedAt: new Date() })
    .where(and(eq(events.id, id), eq(events.tenantId, tenantId)))
    .returning();

  // Update group assignments based on status
  if (status) {
    // Remove from old groups
    const draftGroupId = await getOrCreateSystemGroup(
      tenantId,
      'draft',
      'Draft',
      'Draft events'
    );
    const publishedGroupId = await getOrCreateSystemGroup(
      tenantId,
      'published',
      'Published',
      'Published events'
    );

    // Remove from all status groups
    await removeFromGroup(draftGroupId, 'Event', id);
    await removeFromGroup(publishedGroupId, 'Event', id);

    // Assign to new group based on status
    if (status === 'published') {
      await assignToGroup(publishedGroupId, 'Event', id, userId);
    } else if (status === 'draft') {
      await assignToGroup(draftGroupId, 'Event', id, userId);
    }
  }

  return success(updated);
}
```

## Example 3: Frontend Component with Permission Checks

```vue
<!-- admin-dashboard/components/modules/events/EventCard.vue -->
<template>
  <div class="event-card">
    <h3>{{ event.title }}</h3>
    <p>{{ event.description }}</p>
    
    <div class="actions">
      <button v-if="canViewEvent" @click="viewEvent">View</button>
      <button v-if="canEditEvent" @click="editEvent">Edit</button>
      <button v-if="canManageEvent" @click="deleteEvent">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissions, useDocumentGroups } from '@bcc-events/shared';
import { computed, onMounted } from 'vue';

const props = defineProps<{
  event: {
    id: string;
    title: string;
    description?: string;
  };
  userId: string;
  tenantId: string;
}>();

// Initialize permissions
const { initializePermissions, canView, canEdit, canManage } = usePermissions();
const { documentGroupIds } = useDocumentGroups('Event', props.event.id);

onMounted(async () => {
  await initializePermissions(props.userId, props.tenantId);
});

// Reactive permission checks
const canViewEvent = canView('Event', props.event.id, documentGroupIds.value);
const canEditEvent = canEdit('Event', props.event.id, documentGroupIds.value);
const canManageEvent = canManage('Event', props.event.id, documentGroupIds.value);

const viewEvent = () => {
  // Navigate to event view
};

const editEvent = () => {
  // Navigate to event edit
};

const deleteEvent = async () => {
  // Delete event
};
</script>
```

## Example 4: Setting Up Initial Permissions

```typescript
// api/src/db/seed-permissions.ts

import {
  getOrCreateSystemGroup,
  grantPermission,
} from '../utils/permissions';

/**
 * Seed initial permission structure for a tenant
 */
export async function seedPermissions(tenantId: string, adminUserId: string) {
  // Create system groups
  const publishedGroupId = await getOrCreateSystemGroup(
    tenantId,
    'published',
    'Published',
    'Published content'
  );

  const draftGroupId = await getOrCreateSystemGroup(
    tenantId,
    'draft',
    'Draft',
    'Draft content'
  );

  const editorsGroupId = await getOrCreateSystemGroup(
    tenantId,
    'editors',
    'Editors',
    'Content editors'
  );

  const viewersGroupId = await getOrCreateSystemGroup(
    tenantId,
    'viewers',
    'Viewers',
    'Content viewers'
  );

  // Grant permissions
  // Editors can edit published content
  await grantPermission(
    editorsGroupId,
    publishedGroupId,
    'edit',
    adminUserId
  );

  // Editors can manage draft content
  await grantPermission(
    editorsGroupId,
    draftGroupId,
    'manage',
    adminUserId
  );

  // Viewers can view published content
  await grantPermission(
    viewersGroupId,
    publishedGroupId,
    'view',
    adminUserId
  );
}
```

## Example 5: Checking Permissions in a Composable

```typescript
// admin-dashboard/composables/useEventPermissions.ts

import { usePermissions, useDocumentGroups } from '@bcc-events/shared';
import { computed } from 'vue';

export function useEventPermissions(eventId: string, userId: string, tenantId: string) {
  const { initializePermissions, canView, canEdit, canManage, isOwner } = usePermissions();
  const { documentGroupIds, loading } = useDocumentGroups('Event', eventId);

  // Initialize permissions
  initializePermissions(userId, tenantId);

  return {
    loading,
    canView: canView('Event', eventId, documentGroupIds.value),
    canEdit: canEdit('Event', eventId, documentGroupIds.value),
    canManage: canManage('Event', eventId, documentGroupIds.value),
    isOwner: isOwner('Event', eventId, documentGroupIds.value),
  };
}
```

## Example 6: Batch Permission Check

```typescript
// Check permissions for multiple items at once

import { checkUserPermission } from '../utils/permissions';

async function checkMultiplePermissions(
  userId: string,
  tenantId: string,
  items: Array<{ type: string; id: string }>,
  action: PermissionLevel
) {
  const results = await Promise.all(
    items.map((item) =>
      checkUserPermission(userId, tenantId, item.type, item.id, action)
    )
  );

  return results.map((result, index) => ({
    item: items[index],
    allowed: result.allowed,
    level: result.level,
  }));
}
```
