# Server API Reference

Complete reference for the server-side data sync API.

## SyncService

Service for handling sync requests and permission checks.

### Constructor

```typescript
import { SyncService } from '@bcc-events/data-sync/server';

const syncService = new SyncService({
  getDocuments: async (collection, since, limit, offset) => {
    // Fetch from database
  },
  getDeletions: async (collection, since) => {
    // Fetch deletion records
  },
  getUserPermissions: async (userId) => {
    // Fetch user permissions
  },
  getUserGroups: async (userId) => {
    // Fetch user groups
  },
});
```

### Methods

#### `getSyncResponse(userId, request)`

Get sync response for a collection with permission filtering.

```typescript
const response = await syncService.getSyncResponse(userId, {
  collection: 'events',
  since: new Date('2024-01-01'),
  limit: 100,
  offset: 0,
});
```

**Parameters:**
- `userId: string` - User ID
- `request: SyncRequest` - Sync request

**Returns:** `Promise<SyncResponse>`

**Throws:** Error if permission denied

---

#### `checkPermission(userId, collection, itemId, action)`

Check if user has permission for an action.

```typescript
const canRead = await syncService.checkPermission(
  userId,
  'events',
  'event-123',
  PermissionAction.READ
);
```

**Parameters:**
- `userId: string` - User ID
- `collection: string` - Collection name
- `itemId: string | undefined` - Optional item ID
- `action: PermissionAction` - Action to check

**Returns:** `Promise<boolean>`

---

## SocketHandler

Handler for Socket.io real-time events.

### Constructor

```typescript
import { Server } from 'socket.io';
import { SocketHandler } from '@bcc-events/data-sync/server';

const io = new Server(httpServer);
const socketHandler = new SocketHandler(io, {
  verifyToken: async (token) => {
    // Verify token and return userId
    return { userId: 'user-123' };
  },
  onSubscribe: (socketId, collection) => {
    console.log(`Socket ${socketId} subscribed to ${collection}`);
  },
  onUnsubscribe: (socketId, collection) => {
    console.log(`Socket ${socketId} unsubscribed from ${collection}`);
  },
});
```

### Methods

#### `emitDocumentCreated(document)`

Emit document created event to subscribers.

```typescript
socketHandler.emitDocumentCreated(document);
```

**Parameters:**
- `document: SyncDocument` - Created document

---

#### `emitDocumentUpdated(document)`

Emit document updated event to subscribers.

```typescript
socketHandler.emitDocumentUpdated(document);
```

**Parameters:**
- `document: SyncDocument` - Updated document

---

#### `emitDocumentDeleted(collection, id, deletedBy)`

Emit document deleted event to subscribers.

```typescript
socketHandler.emitDocumentDeleted('events', 'event-123', 'user-456');
```

**Parameters:**
- `collection: string` - Collection name
- `id: string` - Document ID
- `deletedBy: string` - User who deleted

---

#### `getSubscribers(collection)`

Get list of socket IDs subscribed to a collection.

```typescript
const subscribers = socketHandler.getSubscribers('events');
// Returns: ['socket-id-1', 'socket-id-2', ...]
```

**Parameters:**
- `collection: string` - Collection name

**Returns:** `string[]` - Array of socket IDs

---

## Elysia Routes

### createSyncRoutes

Create Elysia routes for sync API.

```typescript
import { createSyncRoutes } from '@bcc-events/data-sync/server';

app.use(createSyncRoutes({
  syncService,
  requireAuth: (app) => app.use(authMiddleware),
}));
```

**Returns:** `Elysia` - Elysia app with sync routes

### Endpoints

#### `GET /api/sync`

Fetch sync data for a collection.

**Query Parameters:**
- `collection: string` (required) - Collection name
- `since?: string` - ISO date string (only changes since)
- `limit?: number` - Maximum documents to return
- `offset?: number` - Pagination offset

**Headers:**
- `Authorization: Bearer <token>` - Authentication token

**Response:**
```typescript
{
  collection: string;
  documents: SyncDocument[];
  deletions: DeletionRecord[];
  hasMore: boolean;
}
```

**Example:**
```bash
GET /api/sync?collection=events&since=2024-01-01T00:00:00Z&limit=100
Authorization: Bearer <token>
```

---

## Configuration

### SyncServiceConfig

```typescript
interface SyncServiceConfig {
  getDocuments: (
    collection: string,
    since?: Date,
    limit?: number,
    offset?: number
  ) => Promise<SyncDocument[]>;
  
  getDeletions: (
    collection: string,
    since?: Date
  ) => Promise<DeletionRecord[]>;
  
  getUserPermissions: (
    userId: string
  ) => Promise<Permission[]>;
  
  getUserGroups: (
    userId: string
  ) => Promise<string[]>;
}
```

### SocketHandlerConfig

```typescript
interface SocketHandlerConfig {
  onSubscribe?: (socketId: string, collection: string) => void;
  onUnsubscribe?: (socketId: string, collection: string) => void;
  verifyToken?: (token: string) => Promise<{ userId: string } | null>;
}
```

## Integration Examples

### Full Server Setup

```typescript
import { Elysia } from 'elysia';
import { Server } from 'socket.io';
import { createServer } from 'http';
import {
  SyncService,
  SocketHandler,
  createSyncRoutes,
} from '@bcc-events/data-sync/server';

// Create HTTP server
const httpServer = createServer();

// Create Socket.io server
const io = new Server(httpServer, {
  cors: { origin: '*', credentials: true },
});

// Create sync service
const syncService = new SyncService({
  async getDocuments(collection, since, limit, offset) {
    // Fetch from database
    return await db.query.documents.findMany({
      where: and(
        eq(documents.collection, collection),
        since ? gte(documents.updatedAt, since) : undefined
      ),
      limit,
      offset,
    });
  },
  
  async getDeletions(collection, since) {
    return await db.query.deletionRecords.findMany({
      where: and(
        eq(deletionRecords.collection, collection),
        since ? gte(deletionRecords.deletedAt, since) : undefined
      ),
    });
  },
  
  async getUserPermissions(userId) {
    return await db.query.permissions.findMany({
      where: or(
        eq(permissions.userId, userId),
        inArray(permissions.groupId, await getUserGroups(userId))
      ),
    });
  },
  
  async getUserGroups(userId) {
    const groups = await db.query.userGroups.findMany({
      where: eq(userGroups.userId, userId),
    });
    return groups.map(g => g.groupId);
  },
});

// Create socket handler
const socketHandler = new SocketHandler(io, {
  verifyToken: async (token) => {
    const user = await verifyAuth0Token(token);
    return user ? { userId: user.sub } : null;
  },
});

// Create Elysia app
const app = new Elysia();

// Add auth middleware
app.use(requireAuth);

// Add sync routes
app.use(createSyncRoutes({
  syncService,
  requireAuth: (app) => app.use(requireAuth),
}));

// Start server
httpServer.listen(3000);
```

### Emitting Events

```typescript
// When document is created
const document = await createDocument(data);
socketHandler.emitDocumentCreated(document);

// When document is updated
const updated = await updateDocument(id, data);
socketHandler.emitDocumentUpdated(updated);

// When document is deleted
await deleteDocument(id);
await createDeletionRecord(id, userId);
socketHandler.emitDocumentDeleted('events', id, userId);
```

## Best Practices

1. **Cache Permissions**: Cache user permissions to reduce DB queries
2. **Batch Operations**: Batch multiple document operations
3. **Validate Input**: Always validate collection names and IDs
4. **Error Handling**: Handle errors gracefully and return appropriate status codes
5. **Logging**: Log all sync operations for debugging
6. **Rate Limiting**: Implement rate limiting for sync endpoints

## Next Steps

- [Client API Reference](./08-client-api.md)
- [Integration Guide](../INTEGRATION.md)
- [Architecture Details](./04-architecture.md)
