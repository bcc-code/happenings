# Permission System Documentation

## Overview

The permission system provides a flexible, group-based access control mechanism that can be enforced both in the API and frontend applications. It uses a unified group model where groups can serve as both user groups (users belong to them) and document groups (items belong to them).

## Core Concepts

### Groups

Groups are the foundation of the permission system. A group can be:
- **User Group**: Users belong to it (via `GroupMember`)
- **Document Group**: Items/documents belong to it (via `GroupAssignment`)
- **Both**: A group can serve both purposes (e.g., a user group can also be managed as a document group)

### Permission Levels

Four permission levels are supported, in hierarchical order:

1. **view** - Can view/read the item
2. **edit** - Can view and edit the item (includes view)
3. **manage** - Can view, edit, and manage the item (includes view and edit)
4. **owner** - Full control (includes all lower levels)

Higher permission levels automatically include all lower levels.

### Permission Links

User groups are linked to document groups via `GroupPermission` records, which specify the permission level. This creates a many-to-many relationship between user groups and document groups.

## How It Works

### Permission Check Flow

1. **Get User's Groups**: Query all groups the user belongs to (via `GroupMember`)
2. **Get Item's Groups**: Query all groups the item belongs to (via `GroupAssignment`)
3. **Find Permission Links**: Find all `GroupPermission` records where:
   - The user group is in the user's groups
   - The document group is in the item's groups
4. **Check Permission Level**: Determine the highest permission level and check if it satisfies the required action

### Example

```
User "Alice" belongs to:
- User Group: "Editors"

Post "My Post" belongs to:
- Document Group: "Published"

GroupPermission:
- User Group "Editors" → Document Group "Published" = "edit" permission

Result: Alice can edit "My Post"
```

## Database Schema

### Tables

- **Group**: Unified table for user and document groups
- **GroupMember**: Links users to user groups
- **GroupAssignment**: Links items to document groups (polymorphic)
- **GroupPermission**: Links user groups to document groups with permission levels

See `api/src/db/schema/permissions.ts` for full schema definition.

## Usage

### API Usage

#### Basic Permission Check

```typescript
import { checkUserPermission } from '../utils/permissions';

// Check if user can edit an event
const result = await checkUserPermission(
  userId,
  tenantId,
  'Event',
  eventId,
  'edit'
);

if (!result.allowed) {
  return forbidden(result.reason);
}
```

#### Using Middleware

```typescript
import { requirePermission } from '../utils/permissions';

app.get('/events/:id', async ({ params, store }) => {
  // Require view permission
  const permissionResult = await requirePermission(
    { store },
    'Event',
    params.id,
    'view'
  );
  
  if (permissionResult instanceof Response) {
    return permissionResult; // Error response
  }
  
  // User has permission, continue...
});
```

#### Assigning Items to Groups

```typescript
import { assignToGroup, getOrCreateSystemGroup } from '../utils/permissions';

// When a post is published, assign it to the "Published" group
const publishedGroupId = await getOrCreateSystemGroup(
  tenantId,
  'published',
  'Published',
  'Published content'
);

await assignToGroup(
  publishedGroupId,
  'Post',
  postId,
  userId
);
```

#### Granting Permissions

```typescript
import { grantPermission } from '../utils/permissions';

// Grant "Editors" group "edit" permission on "Published" group
await grantPermission(
  editorsGroupId,
  publishedGroupId,
  'edit',
  adminUserId
);
```

### Frontend Usage

#### Using the Composable

```vue
<script setup lang="ts">
import { usePermissions, useDocumentGroups } from '@bcc-events/shared';
import { ref, onMounted } from 'vue';

const props = defineProps<{
  eventId: string;
}>();

// Initialize permissions
const { initializePermissions, canEdit, canManage } = usePermissions();
const { documentGroupIds } = useDocumentGroups('Event', props.eventId);

// Initialize on mount
onMounted(async () => {
  await initializePermissions(userId, tenantId);
});

// Reactive permission checks
const canEditEvent = canEdit('Event', props.eventId, documentGroupIds.value);
const canManageEvent = canManage('Event', props.eventId, documentGroupIds.value);
</script>

<template>
  <div>
    <button v-if="canEditEvent" @click="editEvent">Edit</button>
    <button v-if="canManageEvent" @click="deleteEvent">Delete</button>
  </div>
</template>
```

#### Manual Permission Check

```typescript
import { checkItemPermission } from '@bcc-events/shared';

const result = checkItemPermission(
  'Event',
  eventId,
  'edit',
  documentGroupIds
);

if (result.allowed) {
  // User can edit
}
```

## Business Rules

### Automatic Group Assignment

Items are automatically assigned to groups based on their state and business rules. For example:

- **Post with `status === 'published'`** → Assigned to "Published" group
- **Post with `status === 'draft'`** → Assigned to "Draft" group
- **Event with `isGlobal === true`** → Assigned to "Global Events" group
- **Event with `tenantId === X`** → Assigned to "Tenant X" group

### System Groups

System groups are automatically created groups that represent common states:

- `published` - Published content
- `draft` - Draft content
- `public` - Publicly accessible
- `private` - Private/restricted access
- `tenant-{id}` - Tenant-specific groups

These are created using `getOrCreateSystemGroup()`.

## Best Practices

1. **Assign Groups on State Changes**: When an item's state changes (e.g., published → draft), update its group assignments
2. **Use System Groups**: Use system groups for common states rather than creating custom groups
3. **Grant Permissions at Group Level**: Grant permissions between groups, not individual users
4. **Cache Permission Checks**: Cache user groups and permissions to avoid repeated database queries
5. **Check Permissions Early**: Check permissions as early as possible in request handlers

## API Endpoints

### GET `/api/shared/permissions/user-groups`

Get user's groups and permissions.

**Query Parameters:**
- `tenantId` (required): Tenant ID

**Response:**
```json
{
  "data": {
    "userGroupIds": ["group-id-1", "group-id-2"],
    "groupPermissions": [...]
  }
}
```

### GET `/api/shared/permissions/document-groups`

Get document groups for an item.

**Query Parameters:**
- `entityType` (required): Entity type (e.g., "Event")
- `entityId` (required): Entity ID
- `tenantId` (required): Tenant ID

**Response:**
```json
{
  "data": {
    "groupIds": ["group-id-1", "group-id-2"]
  }
}
```

### GET `/api/shared/permissions/check`

Check if user has permission for an item.

**Query Parameters:**
- `entityType` (required): Entity type
- `entityId` (required): Entity ID
- `action` (required): Permission level (view, edit, manage, owner)
- `tenantId` (required): Tenant ID

**Response:**
```json
{
  "data": {
    "allowed": true,
    "level": "edit",
    "reason": null
  }
}
```

## Migration

To set up the permission system:

1. **Generate Migration**:
   ```bash
   cd api
   bun run db:generate
   ```

2. **Review Migration**: Check the generated migration in `api/src/db/migrations/`

3. **Apply Migration**:
   ```bash
   bun run db:migrate
   ```

## Examples

### Example: Post Publishing

```typescript
// When a post is published
async function publishPost(postId: string, tenantId: string) {
  // Get or create "Published" group
  const publishedGroupId = await getOrCreateSystemGroup(
    tenantId,
    'published',
    'Published',
    'Published posts'
  );

  // Remove from "Draft" group
  const draftGroupId = await getOrCreateSystemGroup(
    tenantId,
    'draft',
    'Draft',
    'Draft posts'
  );
  await removeFromGroup(draftGroupId, 'Post', postId);

  // Assign to "Published" group
  await assignToGroup(publishedGroupId, 'Post', postId);
}
```

### Example: Grant Editor Access

```typescript
// Grant "Editors" group permission to edit published posts
async function grantEditorAccess(tenantId: string) {
  const editorsGroupId = await getOrCreateSystemGroup(
    tenantId,
    'editors',
    'Editors',
    'Content editors'
  );

  const publishedGroupId = await getOrCreateSystemGroup(
    tenantId,
    'published',
    'Published',
    'Published content'
  );

  await grantPermission(
    editorsGroupId,
    publishedGroupId,
    'edit',
    adminUserId
  );
}
```

## Troubleshooting

### Permission Denied

If permissions are denied:
1. Check that the user belongs to at least one user group
2. Check that the item belongs to at least one document group
3. Check that there's a `GroupPermission` linking the user's groups to the item's groups
4. Verify the permission level is sufficient for the required action

### Performance

For better performance:
- Cache user groups in session/request context
- Batch permission checks when possible
- Use indexes on `GroupMember`, `GroupAssignment`, and `GroupPermission` tables
