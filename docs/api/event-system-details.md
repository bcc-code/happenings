# Event System Documentation

## Overview

The API uses an event-driven architecture that emits **before** and **after** events for all create, update, and delete operations. This allows you to:

- **Before Events**: Modify payloads, perform validation, or execute operations within the transaction
- **After Events**: Perform non-blocking operations after the transaction commits (e.g., send notifications, update caches, trigger webhooks)

## Key Features

- ✅ **Before Events (Blocking)**: Can modify payloads and execute within transaction
- ✅ **After Events (Non-blocking)**: Execute after transaction commits
- ✅ **Transaction Support**: Before events have access to both transactional and non-transactional DB connections
- ✅ **Type-Safe**: Full TypeScript support with proper types
- ✅ **Priority System**: Handlers can be prioritized for execution order
- ✅ **Error Handling**: Before event errors abort transaction; after event errors are logged

## Architecture

### Event Flow

```
1. Operation Requested
   ↓
2. Before Events Emitted (Blocking)
   ├─ Handlers can modify payload
   ├─ Handlers have access to transaction (tx)
   └─ Handlers have access to non-transactional DB (db)
   ↓
3. Database Operation Executed (Within Transaction)
   ↓
4. Transaction Commits
   ↓
5. After Events Emitted (Non-blocking)
   └─ Handlers have access to regular DB connection
```

### Event Contexts

#### Before Event Context

```typescript
interface BeforeEventContext<T> {
  tx: Database;        // Transactional DB connection (all operations commit atomically)
  db: Database;        // Non-transactional DB connection (for reads, won't block transaction)
  payload: T;          // Payload (can be modified)
  metadata: EventMetadata;
}
```

#### After Event Context

```typescript
interface AfterEventContext<T> {
  db: Database;        // Regular DB connection (transaction already committed)
  payload: T;          // Final committed payload
  metadata: EventMetadata;
}
```

## Usage

### Registering Event Handlers

#### Before Event Handler

```typescript
import { eventEmitter } from './events';

// Register handler for specific entity and operations
const handlerId = eventEmitter.onBefore(
  'events',                    // Entity name
  ['create', 'update'],        // Operations to listen to
  async (context) => {
    // Modify payload
    context.payload.title = context.payload.title.toUpperCase();
    
    // Use transactional DB for writes (part of transaction)
    await context.tx.insert(events).values({ ... });
    
    // Use non-transactional DB for reads (won't block transaction)
    const existing = await context.db.query.events.findFirst({ ... });
    
    // Return modified payload
    return context.payload;
  },
  {
    id: 'my-handler',          // Optional: custom ID
    priority: 10,              // Optional: higher priority runs first
  }
);
```

#### After Event Handler

```typescript
import { eventEmitter } from './events';

// Register handler for all entities and operations
eventEmitter.onAfter(
  '*',                         // Listen to all entities
  '*',                         // Listen to all operations
  async (context) => {
    // Send notification
    await sendNotification({
      entity: context.metadata.entity,
      operation: context.metadata.operation,
      entityId: context.metadata.entityId,
    });
    
    // Update cache
    await updateCache(context.metadata.entity, context.payload);
  }
);
```

#### Wildcard Handlers

```typescript
// Listen to all entities
eventEmitter.onBefore('*', ['create'], async (context) => {
  console.log(`Creating ${context.metadata.entity}`);
});

// Listen to all operations for specific entity
eventEmitter.onAfter('events', '*', async (context) => {
  console.log(`Event ${context.metadata.operation} completed`);
});
```

### Using Events in CRUD Operations

#### Using Helper Functions

```typescript
import { emitCreate, emitUpdate, emitDelete } from './events';
import { events } from './db/schema';
import { eq } from 'drizzle-orm';

// Create with events
const newEvent = await emitCreate(
  'events',
  { title: 'My Event', startDate: new Date() },
  {
    userId: store.user.id,
    tenantId: store.user.tenantId,
  },
  async (tx, payload) => {
    // This runs within the transaction
    const [result] = await tx
      .insert(events)
      .values(payload)
      .returning();
    return result;
  }
);

// Update with events
const updatedEvent = await emitUpdate(
  'events',
  { id: eventId, title: 'Updated Title' },
  {
    entityId: eventId,
    userId: store.user.id,
    tenantId: store.user.tenantId,
  },
  async (tx, payload) => {
    const [result] = await tx
      .update(events)
      .set({ title: payload.title })
      .where(eq(events.id, payload.id))
      .returning();
    return result;
  }
);

// Delete with events
await emitDelete(
  'events',
  { id: eventId },
  {
    entityId: eventId,
    userId: store.user.id,
    tenantId: store.user.tenantId,
  },
  async (tx, payload) => {
    await tx
      .delete(events)
      .where(eq(events.id, payload.id));
  }
);
```

#### Using Generic `withEvents` Function

```typescript
import { withEvents } from './events';

const result = await withEvents(
  'events',
  'create',
  payload,
  { userId: store.user.id, tenantId: store.user.tenantId },
  async (tx, modifiedPayload) => {
    // Database operation
    return await tx.insert(events).values(modifiedPayload).returning();
  }
);
```

### Unregistering Handlers

```typescript
// Unregister by ID
eventEmitter.off('my-handler');
```

## Examples

### Example 1: Auto-generate Slug on Event Create

```typescript
eventEmitter.onBefore(
  'events',
  ['create'],
  async (context) => {
    if (!context.payload.slug) {
      context.payload.slug = generateSlug(context.payload.title);
    }
    return context.payload;
  },
  { priority: 10 }
);
```

### Example 2: Send Email Notification After Registration

```typescript
eventEmitter.onAfter(
  'registrations',
  ['create'],
  async (context) => {
    const registration = context.payload;
    
    // Get user details (non-blocking, transaction already committed)
    const user = await context.db.query.users.findFirst({
      where: eq(users.id, registration.userId),
    });
    
    // Send email (non-blocking)
    await sendEmail({
      to: user.email,
      subject: 'Registration Confirmed',
      body: `You've registered for ${registration.eventName}`,
    });
  }
);
```

### Example 3: Validate Capacity Before Event Update

```typescript
eventEmitter.onBefore(
  'events',
  ['update'],
  async (context) => {
    // Use non-transactional DB to check current state
    const currentEvent = await context.db.query.events.findFirst({
      where: eq(events.id, context.metadata.entityId),
    });
    
    // Check if capacity is being reduced below current registrations
    if (context.payload.capacity < currentEvent.currentRegistrations) {
      throw new Error('Capacity cannot be reduced below current registrations');
    }
    
    return context.payload;
  }
);
```

### Example 4: Update Cache After Any Entity Change

```typescript
eventEmitter.onAfter(
  '*',
  ['create', 'update', 'delete'],
  async (context) => {
    // Invalidate cache for this entity
    await invalidateCache(`${context.metadata.entity}:${context.metadata.entityId}`);
    
    // Optionally update cache with new data
    if (context.metadata.operation !== 'delete') {
      await setCache(
        `${context.metadata.entity}:${context.metadata.entityId}`,
        context.payload
      );
    }
  }
);
```

### Example 5: Audit Logging

```typescript
eventEmitter.onAfter(
  '*',
  ['create', 'update', 'delete'],
  async (context) => {
    // Log to audit table (non-blocking)
    await context.db.insert(auditLogs).values({
      entity: context.metadata.entity,
      operation: context.metadata.operation,
      entityId: context.metadata.entityId,
      userId: context.metadata.userId,
      timestamp: context.metadata.timestamp,
      payload: context.payload,
    });
  }
);
```

## Best Practices

### 1. Use Before Events For

- ✅ Payload validation and modification
- ✅ Enforcing business rules
- ✅ Creating related records atomically
- ✅ Any operation that must succeed or fail with the main operation

### 2. Use After Events For

- ✅ Sending notifications (email, SMS, push)
- ✅ Updating caches
- ✅ Triggering webhooks
- ✅ Audit logging
- ✅ Any operation that shouldn't block the main transaction

### 3. Database Connections

- **`context.tx`** (Before events only): Use for writes that must be part of the transaction
- **`context.db`** (Before & After events): Use for reads or operations that don't need to be in the transaction

### 4. Error Handling

- **Before events**: Errors will abort the transaction - use for validation
- **After events**: Errors are logged but don't affect the operation - use for non-critical operations

### 5. Priority

- Higher priority handlers run first
- Use priority to ensure handlers run in the correct order
- Default priority is 0

## API Reference

### `eventEmitter.onBefore(entity, operations, handler, options?)`

Register a before event handler.

**Parameters:**
- `entity`: Entity name or `'*'` for all entities
- `operations`: Array of operations or `'*'` for all operations
- `handler`: Handler function
- `options`: Optional configuration
  - `id`: Custom handler ID
  - `priority`: Priority (higher runs first, default: 0)

**Returns:** Handler ID

### `eventEmitter.onAfter(entity, operations, handler, options?)`

Register an after event handler.

**Parameters:** Same as `onBefore`

**Returns:** Handler ID

### `eventEmitter.off(id)`

Unregister a handler by ID.

**Returns:** `true` if handler was found and removed

### `withEvents(entity, operation, payload, metadata, dbOperation)`

Execute a database operation with event emission.

**Parameters:**
- `entity`: Entity name
- `operation`: Operation type ('create', 'update', 'delete')
- `payload`: Initial payload
- `metadata`: Event metadata (without entity, operation, timestamp)
- `dbOperation`: Function that performs the DB operation

**Returns:** Result of database operation

### `emitCreate(entity, payload, metadata, dbOperation)`

Shorthand for create operations.

### `emitUpdate(entity, payload, metadata, dbOperation)`

Shorthand for update operations.

### `emitDelete(entity, payload, metadata, dbOperation)`

Shorthand for delete operations.

## Migration Guide

### Before (Without Events)

```typescript
// Old way
const [newEvent] = await db
  .insert(events)
  .values(payload)
  .returning();
```

### After (With Events)

```typescript
// New way
const newEvent = await emitCreate(
  'events',
  payload,
  { userId: store.user.id, tenantId: store.user.tenantId },
  async (tx, modifiedPayload) => {
    return await tx.insert(events).values(modifiedPayload).returning();
  }
);
```

## Troubleshooting

### Handler Not Firing

- Check entity name matches exactly (case-sensitive)
- Verify operation is in the operations array
- Ensure handler is registered before the operation executes

### Transaction Issues

- Use `context.tx` for operations that must be in the transaction
- Use `context.db` for reads that shouldn't block the transaction
- Don't mix transactional and non-transactional operations incorrectly

### After Events Not Firing

- After events fire after transaction commits
- If transaction fails, after events won't fire
- Check console for errors in after event handlers
