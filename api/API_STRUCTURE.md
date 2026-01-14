# API Structure Documentation

## Overview

The API is organized into three namespaces following RESTful best practices:

1. **Admin** (`/api/admin`) - Admin-only endpoints
2. **App** (`/api/app`) - End user endpoints
3. **Shared** (`/api/shared`) - Shared endpoints

## Authentication

All endpoints (except health check) require authentication via Auth0 JWT token:

```
Authorization: Bearer <token>
```

### Tenant Context

For admin endpoints and tenant-scoped operations, include tenant ID:

```
X-Tenant-ID: <tenant-id>
```

Or as query parameter:
```
?tenantId=<tenant-id>
```

## Namespace Details

### Admin Namespace (`/api/admin`)

**Access Requirements:**
- Authentication required
- Admin role required (super_admin, admin, or event_manager)
- Tenant context required

**Use Cases:**
- Event management (create, update, delete)
- User management within tenant
- Settings and configuration
- Reports and analytics
- Payment provider configuration

**Example Endpoints:**
- `GET /api/admin/events` - List all events
- `POST /api/admin/events` - Create event
- `GET /api/admin/users` - List users
- `GET /api/admin/settings` - Get tenant settings

### App Namespace (`/api/app`)

**Access Requirements:**
- Authentication required
- Limited to user's own data
- Can manage relatives (family members) if user is primary contact

**Use Cases:**
- User profile management
- Event registration
- Personal schedule
- Family member management
- Personal preferences

**Example Endpoints:**
- `GET /api/app/profile` - Get current user profile
- `PUT /api/app/profile` - Update profile
- `GET /api/app/events` - List available events
- `POST /api/app/registrations` - Register for event
- `GET /api/app/family` - Get family members

**Relative Management:**
Users can manage data for relatives if:
- They are the primary contact in a family group
- The relative is a member of their family group

### Shared Namespace (`/api/shared`)

**Access Requirements:**
- Authentication required
- Available to both admin and app users

**Use Cases:**
- Health checks
- Public event information
- Common utilities
- Cross-namespace operations

**Example Endpoints:**
- `GET /api/shared/health` - Health check
- `GET /api/shared/events/public` - Public event listings

## Best Practices

### 1. Route Organization

```
src/routes/
├── admin/
│   ├── events.ts
│   ├── users.ts
│   ├── settings.ts
│   └── index.ts
├── app/
│   ├── profile.ts
│   ├── events.ts
│   ├── registrations.ts
│   ├── family.ts
│   └── index.ts
└── shared/
    ├── health.ts
    └── index.ts
```

### 2. OpenAPI Documentation

All routes should include Swagger/OpenAPI annotations:

```typescript
/**
 * @swagger
 * /admin/events:
 *   get:
 *     summary: List all events
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
```

### 3. Error Handling

Use the `ApiError` class for consistent error responses:

```typescript
throw new ApiError(404, 'Event not found', 'EVENT_NOT_FOUND');
```

### 4. Input Validation

Use Zod for request validation (to be implemented):

```typescript
const schema = z.object({
  title: z.string().min(1),
  startDate: z.date(),
});
```

### 5. Response Format

Standard response format:

```typescript
// Success
{
  data: { ... }
}

// Error
{
  error: "Error message",
  code: "ERROR_CODE",
  details: { ... }
}

// Paginated
{
  data: [...],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 100,
    totalPages: 5
  }
}
```

## Role-Based Access Control

### Roles

- **super_admin**: Full access to tenant
- **admin**: Manage events and users
- **event_manager**: Manage specific events
- **user**: Standard user access

### Role Checking

Admin endpoints automatically check for admin roles:

```typescript
router.use(requireAdmin()); // Checks for admin role
```

App endpoints check user access:

```typescript
router.use('/users/:userId', requireUserAccess); // Checks if user can access
```

## Multi-Tenancy

All tenant-scoped operations:
1. Extract tenant ID from header/query
2. Verify user has access to tenant
3. Verify tenant exists and is active
4. Apply tenant context to queries

## Event-Driven Architecture

The API uses an event-driven architecture that automatically emits **before** and **after** events for all create, update, and delete operations.

### Event System Overview

- **Before Events (Blocking)**: Emitted before the database operation, within the transaction
  - Can modify the payload
  - Have access to both transactional (`tx`) and non-transactional (`db`) database connections
  - Errors abort the transaction
  - Use for validation, payload modification, or atomic operations

- **After Events (Non-blocking)**: Emitted after the transaction commits
  - Have access to regular database connection
  - Errors are logged but don't affect the operation
  - Use for notifications, cache updates, webhooks, audit logging

### Using Events in CRUD Operations

All create, update, and delete operations should use the event helpers:

```typescript
import { emitCreate, emitUpdate, emitDelete } from '../events';
import { events } from '../db/schema';
import { eq } from 'drizzle-orm';

// Create with events
const newEvent = await emitCreate(
  'events',
  payload,
  {
    userId: store.user.id,
    tenantId: store.user.tenantId,
  },
  async (tx, modifiedPayload) => {
    const [result] = await tx
      .insert(events)
      .values(modifiedPayload)
      .returning();
    return result;
  }
);

// Update with events
const updatedEvent = await emitUpdate(
  'events',
  { id: eventId, ...updates },
  {
    entityId: eventId,
    userId: store.user.id,
    tenantId: store.user.tenantId,
  },
  async (tx, modifiedPayload) => {
    const [result] = await tx
      .update(events)
      .set(modifiedPayload)
      .where(eq(events.id, modifiedPayload.id))
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
    await tx.delete(events).where(eq(events.id, payload.id));
  }
);
```

### Registering Event Handlers

Event handlers can be registered to listen to specific entities and operations:

```typescript
import { eventEmitter } from '../events';

// Before event handler (can modify payload)
eventEmitter.onBefore(
  'events',
  ['create', 'update'],
  async (context) => {
    // Modify payload
    context.payload.title = context.payload.title.trim();
    
    // Use transactional DB for writes
    await context.tx.insert(auditLogs).values({ ... });
    
    // Use non-transactional DB for reads
    const existing = await context.db.query.events.findFirst({ ... });
    
    return context.payload;
  },
  { priority: 10 }
);

// After event handler (non-blocking)
eventEmitter.onAfter(
  'events',
  ['create'],
  async (context) => {
    // Send notification
    await sendNotification({
      entity: context.metadata.entity,
      operation: context.metadata.operation,
      entityId: context.metadata.entityId,
    });
  }
);
```

See [Event System Documentation](./src/events/README.md) for complete details.

## Adding New Endpoints

1. Create route file in appropriate namespace
2. Add OpenAPI/Swagger annotations
3. Add authentication/authorization middleware
4. Implement business logic using event helpers for CRUD operations
5. Add to namespace index file
6. Test endpoint
7. Update documentation

## Example: Adding Admin Endpoint

```typescript
// src/routes/admin/events.ts
import type { Context } from 'elysia';
import { emitCreate } from '../../events';
import { events } from '../../db/schema';
import { error } from '../../utils/response';

/**
 * @swagger
 * /admin/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
export async function createEvent({ store, body }: Context) {
  try {
    if (!store.user || !store.user.tenantId) {
      return error('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const payload = body as { title: string; startDate: Date; endDate: Date };
    
    // Use emitCreate to automatically handle events
    const newEvent = await emitCreate(
      'events',
      {
        ...payload,
        tenantId: store.user.tenantId,
      },
      {
        userId: store.user.id,
        tenantId: store.user.tenantId,
      },
      async (tx, modifiedPayload) => {
        const [result] = await tx
          .insert(events)
          .values(modifiedPayload)
          .returning();
        return result;
      }
    );

    return { data: newEvent };
  } catch (err) {
    console.error('Error creating event:', err);
    return error('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
```

Then add to `src/routes/admin/index.ts`:

```typescript
import { Elysia } from 'elysia';
import { createEvent } from './events';

const router = new Elysia();
router.post('/events', createEvent);

export default router;
```
