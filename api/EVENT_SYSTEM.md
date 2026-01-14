# Event System Overview

## Quick Start

The API now includes a comprehensive event-driven architecture that automatically emits events for all create, update, and delete operations.

### Basic Usage

```typescript
import { emitCreate } from './events';
import { events } from './db/schema';

// Create with automatic event emission
const newEvent = await emitCreate(
  'events',
  { title: 'My Event', startDate: new Date() },
  { userId: store.user.id, tenantId: store.user.tenantId },
  async (tx, payload) => {
    return await tx.insert(events).values(payload).returning();
  }
);
```

### Registering Event Handlers

```typescript
import { eventEmitter } from './events';

// Before event (can modify payload, runs in transaction)
eventEmitter.onBefore('events', ['create'], async (context) => {
  context.payload.title = context.payload.title.trim();
  return context.payload;
});

// After event (non-blocking, runs after commit)
eventEmitter.onAfter('events', ['create'], async (context) => {
  await sendNotification(context.payload);
});
```

## Documentation

- **[Complete Event System Documentation](./src/events/README.md)** - Full API reference and examples
- **[Event Examples](./src/events/examples.ts)** - Common patterns and use cases
- **[API Structure](./API_STRUCTURE.md)** - Updated with event system integration

## Key Features

✅ **Before Events (Blocking)**
- Modify payloads before database operations
- Access to transactional (`tx`) and non-transactional (`db`) connections
- Errors abort the transaction

✅ **After Events (Non-blocking)**
- Execute after transaction commits
- Perfect for notifications, cache updates, webhooks
- Errors are logged but don't affect the operation

✅ **Transaction Support**
- Automatic transaction management
- Works with both PostgreSQL and SQLite
- Atomic operations guaranteed

✅ **Type-Safe**
- Full TypeScript support
- Proper type inference

## Files

- `src/events/types.ts` - Type definitions
- `src/events/emitter.ts` - Event emitter implementation
- `src/events/context.ts` - Context builders
- `src/events/helpers.ts` - CRUD helper functions
- `src/events/index.ts` - Main exports
- `src/events/README.md` - Complete documentation
- `src/events/examples.ts` - Example handlers

## Migration

When updating existing CRUD operations, wrap them with event helpers:

**Before:**
```typescript
const [result] = await db.insert(events).values(payload).returning();
```

**After:**
```typescript
const result = await emitCreate(
  'events',
  payload,
  { userId: store.user.id, tenantId: store.user.tenantId },
  async (tx, modifiedPayload) => {
    return await tx.insert(events).values(modifiedPayload).returning();
  }
);
```

See the [Event System Documentation](./src/events/README.md) for more details.
