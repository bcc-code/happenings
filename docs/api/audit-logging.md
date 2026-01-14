# Audit Logging System

## Overview

The audit logging system tracks all data changes in the application with full context:
- **When**: Timestamp of the change
- **By whom**: User ID, IP address, and role
- **Context**: Tenant ID
- **What**: Collection (table) and item ID
- **Changes**: Delta of what actually changed (old vs new values)

## Features

### 1. Comprehensive Change Tracking
- Tracks all create, update, and delete operations
- Captures user context (ID, IP, role, tenant)
- Stores delta changes (only fields that actually changed)
- Optional full data snapshots (old/new) for debugging

### 2. Parent-Child Relationships
- Supports tracking relationship changes separately from main item changes
- When updating an item and its relationships, creates:
  - Parent audit log for the main item update
  - Child audit log(s) for relationship changes, linked via `parentId`

### 3. Delta Calculation
- Only tracks fields that actually changed
- Prevents "updated" events when nothing changed
- Deep comparison for objects and arrays

### 4. Generic Item Service
- Automatically fetches existing items before updates
- Passes existing items to blocking events
- Compares old vs new to only update changed values
- Sets `userCreated`, `userUpdated`, `dateCreated`, `dateUpdated` fields

## Database Schema

### AuditLog Table

```typescript
{
  id: uuid (primary key)
  parentId: uuid (nullable, references AuditLog.id)
  collection: string (table/entity name)
  itemId: uuid (ID of changed item)
  operation: 'create' | 'update' | 'delete'
  userId: uuid (user who made change)
  userIp: string (IP address, nullable)
  userRole: string (role at time of change, nullable)
  tenantId: uuid (tenant context, nullable)
  delta: jsonb (changed fields: { fieldName: { old: value, new: value } })
  oldData: jsonb (full old state, nullable)
  newData: jsonb (full new state, nullable)
  createdAt: timestamp
}
```

### Indexes
- `collection` + `itemId` (for querying changes to specific items)
- `userId` (for querying changes by user)
- `tenantId` (for querying changes by tenant)
- `createdAt` (for time-based queries)
- `parentId` (for querying child audit logs)
- `operation` (for filtering by operation type)

## Usage

### Using the Generic Item Service

The `ItemService` class provides a convenient way to perform CRUD operations with automatic audit logging:

```typescript
import { createItemService } from '../services/item-service';
import { events } from '../db/schema';

// Create service from Elysia context
const itemService = createItemService(context);

// Create an item
const newEvent = await itemService.create({
  table: events,
  entityName: 'Event',
  data: {
    title: 'My Event',
    startDate: new Date(),
    // ... other fields
  },
});

// Update an item (automatically fetches existing, compares changes)
const updatedEvent = await itemService.update({
  table: events,
  entityName: 'Event',
  id: eventId,
  data: {
    title: 'Updated Title',
  },
  // Optional: pass existing item if you already have it
  existingItem: existingEvent,
});

// Delete an item
await itemService.delete({
  table: events,
  entityName: 'Event',
  id: eventId,
});
```

### Manual Audit Logging

If you need to create audit logs manually (e.g., for relationship changes):

```typescript
import { createAuditLog, calculateDelta } from '../utils/audit';

// Calculate delta
const delta = calculateDelta(oldData, newData);

// Create audit log
await createAuditLog({
  collection: 'Event',
  itemId: eventId,
  operation: 'update',
  userId: userId,
  userIp: userIp,
  userRole: userRole,
  tenantId: tenantId,
  delta: delta,
  oldData: oldData,
  newData: newData,
  parentId: parentAuditLogId, // Optional, for relationship changes
});
```

### Creating Parent-Child Audit Logs

For relationship changes:

```typescript
import { createAuditLogs } from '../utils/audit';

// Create parent and child audit logs
await createAuditLogs([
  // Parent log (main item update)
  {
    collection: 'Person',
    itemId: personId,
    operation: 'update',
    userId: userId,
    userIp: userIp,
    userRole: userRole,
    tenantId: tenantId,
    delta: personDelta,
    oldData: oldPersonData,
    newData: newPersonData,
  },
  // Child log (relationship change) - use 'PARENT_PLACEHOLDER' to link
  {
    collection: 'PersonRelation',
    itemId: relationId,
    operation: 'update',
    userId: userId,
    userIp: userIp,
    userRole: userRole,
    tenantId: tenantId,
    delta: relationDelta,
    oldData: oldRelationData,
    newData: newRelationData,
    parentId: 'PARENT_PLACEHOLDER', // Will be replaced with parent log ID
  },
]);
```

## Querying Audit Logs

### Get audit logs for a specific item

```typescript
import { getAuditLogsForItem } from '../utils/audit';

const logs = await getAuditLogsForItem('Event', eventId, 100);
```

### Get audit logs for a user

```typescript
import { getAuditLogsForUser } from '../utils/audit';

const logs = await getAuditLogsForUser(userId, 100);
```

### Get audit logs for a tenant

```typescript
import { getAuditLogsForTenant } from '../utils/audit';

const logs = await getAuditLogsForTenant(tenantId, 100);
```

## Event System Integration

The audit logging system is automatically integrated with the event system:

1. **Automatic Registration**: The audit handler is registered on application startup
2. **After Events**: Audit logs are created as after events (non-blocking)
3. **Full Context**: Event metadata includes user IP and role
4. **Delta Tracking**: The handler extracts old/new data from the event context

### Event Metadata

The event metadata now includes:
- `userIp`: Client IP address (extracted from request headers)
- `userRole`: User role at time of operation

## Implementation Details

### Delta Calculation

The `calculateDelta` function:
- Compares old and new data field by field
- Uses deep comparison for objects and arrays (JSON.stringify)
- Skips internal fields (`id`, `createdAt`, `updatedAt`)
- Returns only fields that actually changed

### Item Service Behavior

The `ItemService`:
1. **Before Update**: Fetches existing item (if not provided)
2. **Delta Check**: Calculates delta to see if anything changed
3. **Skip if No Changes**: Returns existing item without update if nothing changed
4. **User/Date Fields**: Automatically sets `userUpdated`, `dateUpdated`, etc.
5. **Event Context**: Passes existing item to blocking events
6. **Audit Context**: Attaches `_auditContext` to result for audit handler

### IP Address Extraction

The system extracts IP addresses from:
1. `X-Forwarded-For` header (for proxied requests)
2. `X-Real-IP` header (alternative proxy header)
3. Falls back to undefined if not available

## Migration

To create the audit log table, run:

```bash
cd api
bun run db:generate
bun run db:migrate
```

This will create the `AuditLog` table with all necessary indexes.

## Best Practices

1. **Always use ItemService** for CRUD operations to ensure audit logging
2. **Pass existing items** when you already have them to avoid extra queries
3. **Use entity names** consistently (match table names)
4. **Handle relationship changes** by creating parent-child audit logs
5. **Query audit logs** for compliance and debugging purposes

## Future Enhancements

Potential improvements:
- Audit log retention policies
- Compression for old data snapshots
- Query API for audit logs
- Export functionality for compliance
- Real-time audit log streaming
