# Permissions System

## Overview

The data sync package implements a fine-grained permission system inspired by Microsoft's permission model, where permissions can be assigned to users or groups, and applied to collections or individual items.

## Permission Model

### Structure

```
Permission
├── Subject (Who)
│   ├── User (userId)
│   └── Group (groupId)
├── Resource (What)
│   ├── Collection (collection)
│   └── Item (itemId, optional)
└── Actions (How)
    ├── READ
    ├── WRITE
    ├── DELETE
    └── ADMIN
```

### Permission Scope

Permissions can be scoped at two levels:

1. **Collection Level**: Applies to all items in a collection
2. **Item Level**: Applies to a specific item

```typescript
// Collection-level permission
{
  userId: 'user-123',
  collection: 'events',
  itemId: undefined,  // Applies to all events
  actions: ['read'],
  scope: PermissionScope.COLLECTION,
}

// Item-level permission
{
  userId: 'user-123',
  collection: 'events',
  itemId: 'event-456',  // Applies only to this event
  actions: ['read', 'write'],
  scope: PermissionScope.ITEM,
}
```

## Permission Actions

### Available Actions

```typescript
enum PermissionAction {
  READ = 'read',      // View documents
  WRITE = 'write',    // Create and update documents
  DELETE = 'delete',  // Delete documents
  ADMIN = 'admin',    // Full access (includes all actions)
}
```

### Action Hierarchy

- **ADMIN** includes all actions (read, write, delete)
- **READ** is required for any access
- **WRITE** implies **READ**
- **DELETE** requires **READ** (but not necessarily **WRITE**)

## Permission Resolution

### Resolution Order

When checking permissions, the system:

1. Checks user-specific permissions
2. Checks group permissions
3. Checks collection-level permissions
4. Checks item-level permissions (if itemId provided)
5. Denies if no match found

### Permission Check Function

```typescript
import { hasPermission } from '@bcc-events/data-sync/types/permissions';

const hasAccess = hasPermission(
  permissions,      // Array of user's permissions
  userId,          // Current user ID
  userGroups,      // Array of user's group IDs
  collection,      // Collection name
  itemId,          // Optional item ID
  PermissionAction.READ
);
```

## Implementation Examples

### Server-Side Permission Check

```typescript
import { SyncService } from '@bcc-events/data-sync/server';

const syncService = new SyncService({
  async getUserPermissions(userId) {
    // Fetch from database
    return await db.query.permissions.findMany({
      where: or(
        eq(permissions.userId, userId),
        inArray(permissions.groupId, await getUserGroups(userId))
      ),
    });
  },
  
  async getUserGroups(userId) {
    return await db.query.userGroups.findMany({
      where: eq(userGroups.userId, userId),
    }).then(groups => groups.map(g => g.groupId));
  },
});
```

### Client-Side Permission Filtering

```typescript
import { filterByPermissions } from '@bcc-events/data-sync/types/permissions';

const visibleDocuments = filterByPermissions(
  documents,
  permissions,
  userId,
  userGroups,
  PermissionAction.READ
);
```

## Permission Patterns

### Pattern 1: Public Collection

All users can read, only admins can write:

```typescript
// Collection-level read for everyone
{
  groupId: 'all-users',
  collection: 'events',
  actions: ['read'],
  scope: PermissionScope.COLLECTION,
}

// Collection-level write for admins
{
  groupId: 'admins',
  collection: 'events',
  actions: ['write', 'delete'],
  scope: PermissionScope.COLLECTION,
}
```

### Pattern 2: User-Owned Items

Users can manage their own items:

```typescript
// User can read all items
{
  userId: 'user-123',
  collection: 'registrations',
  actions: ['read'],
  scope: PermissionScope.COLLECTION,
}

// User can write their own items
{
  userId: 'user-123',
  collection: 'registrations',
  itemId: 'registration-456',  // Their own registration
  actions: ['write'],
  scope: PermissionScope.ITEM,
}
```

### Pattern 3: Group-Based Access

Team members can access team data:

```typescript
// Team members can read team events
{
  groupId: 'team-alpha',
  collection: 'events',
  actions: ['read', 'write'],
  scope: PermissionScope.COLLECTION,
}

// Team leads can delete
{
  groupId: 'team-leads',
  collection: 'events',
  actions: ['delete'],
  scope: PermissionScope.COLLECTION,
}
```

## Database Schema

### Permissions Table

```typescript
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  groupId: uuid('group_id').references(() => groups.id),
  collection: varchar('collection', { length: 255 }).notNull(),
  itemId: varchar('item_id', { length: 255 }),
  actions: json('actions').$type<PermissionAction[]>().notNull(),
  scope: varchar('scope', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Constraints
// - Either userId or groupId must be set (not both)
// - itemId is optional (collection-level if null)
```

## Permission Utilities

### Get Accessible Collections

```typescript
import { getAccessibleCollections } from '@bcc-events/data-sync/types/permissions';

const collections = getAccessibleCollections(
  permissions,
  userId,
  userGroups
);
// Returns: ['events', 'registrations', 'users']
```

### Filter by Permissions

```typescript
import { filterByPermissions } from '@bcc-events/data-sync/types/permissions';

const visibleEvents = filterByPermissions(
  allEvents,
  permissions,
  userId,
  userGroups,
  PermissionAction.READ
);
```

## Best Practices

1. **Use Groups**: Prefer group-based permissions for scalability
2. **Least Privilege**: Grant minimum required permissions
3. **Item-Level When Needed**: Use item-level for fine-grained control
4. **Cache Permissions**: Cache user permissions to reduce DB queries
5. **Validate Server-Side**: Always validate permissions on the server
6. **Log Permission Denials**: Log denied access for security auditing

## Security Considerations

1. **Server-Side Validation**: Never trust client-side permission checks
2. **Token Validation**: Verify JWT tokens on every request
3. **Tenant Isolation**: Ensure permissions respect tenant boundaries
4. **Audit Logging**: Log all permission checks and denials
5. **Regular Reviews**: Periodically review and audit permissions

## Troubleshooting

### Permission Denied Errors

**Problem**: User gets "Permission denied" errors

**Solutions**:
1. Check user has permissions assigned
2. Verify user is in correct groups
3. Ensure collection/item IDs match
4. Check permission scope (collection vs item)

### Performance Issues

**Problem**: Permission checks are slow

**Solutions**:
1. Cache user permissions
2. Use database indexes on userId/groupId
3. Batch permission checks
4. Consider permission pre-computation

## Next Steps

- [Client API Reference](./08-client-api.md)
- [Server API Reference](./09-server-api.md)
- [Architecture Details](./04-architecture.md)
