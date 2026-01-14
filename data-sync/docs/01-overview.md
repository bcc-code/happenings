# Overview

## What is Data Sync?

`@bcc-events/data-sync` is a comprehensive data synchronization engine that keeps client and server data in sync, with support for:

- **Real-time updates** via Socket.io
- **Offline mode** with IndexedDB persistence
- **Fine-grained permissions** (Microsoft-style: users/groups → collections/items)
- **Automatic cleanup** with content expiration
- **Smart retention** with priority-based storage management
- **Incremental sync** on reconnection

## Key Features

### 1. Real-time Synchronization

Changes on the server are immediately pushed to connected clients via Socket.io, ensuring all users see updates in real-time.

```typescript
// Server emits update
socketHandler.emitDocumentUpdated(document);

// Client receives update automatically
syncClient.subscribe('events', {
  onUpdate: (documents) => {
    console.log('Updated:', documents);
  },
});
```

### 2. Offline Support

Data is stored locally in IndexedDB, allowing the application to work offline. When connectivity is restored, only changes since the last sync are fetched.

```typescript
// Works offline - data from IndexedDB
const documents = await syncClient.getDocuments('events');

// Auto-syncs when online
await syncClient.syncCollection('events');
```

### 3. Fine-grained Permissions

Microsoft-style permission system where permissions can be assigned to:
- **Users** or **Groups**
- **Collections** or **Individual Items**
- **Actions**: Read, Write, Delete, Admin

```typescript
// Permission example
{
  userId: 'user-123',
  collection: 'events',
  itemId: 'event-456',  // Optional - collection-level if omitted
  actions: ['read', 'write'],
  scope: 'item'
}
```

### 4. Content Expiration

Documents can have expiration dates for automatic cleanup:

```typescript
const document: SyncDocument = {
  id: 'doc-1',
  collection: 'notifications',
  data: { message: 'Hello' },
  metadata: {
    expiresAt: new Date('2024-12-31'),
    retentionPriority: RetentionPriority.LOW,
    // ...
  },
};
```

### 5. Retention Priority

Storage space is managed by removing oldest, lowest-priority documents first:

```typescript
enum RetentionPriority {
  CRITICAL = 1,  // Never removed
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  TEMPORARY = 5,  // Removed first
}
```

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │◄───────►│  Socket.io   │◄───────►│   Server    │
│  (Browser)  │         │   (Events)   │         │   (API)     │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                              │
      │ HTTP Requests                               │
      │                                              │
      ▼                                              ▼
┌─────────────┐                              ┌─────────────┐
│ IndexedDB   │                              │  PostgreSQL │
│  (Local)    │                              │  (Server)   │
└─────────────┘                              └─────────────┘
```

## Core Components

### Client-Side

- **SyncClient**: Main synchronization engine
- **SyncStorage**: IndexedDB storage layer
- **Composables**: Vue 3 integration helpers

### Server-Side

- **SyncService**: Handles sync requests and permissions
- **SocketHandler**: Manages Socket.io connections
- **Elysia Routes**: REST API endpoints

## Use Cases

1. **Event Management**: Sync events, registrations, and attendees
2. **Real-time Collaboration**: Multiple users editing simultaneously
3. **Offline-First Apps**: Work without internet connection
4. **Multi-tenant Systems**: Isolated data per tenant with permissions
5. **Mobile Apps**: Efficient data sync for mobile devices

## Next Steps

- [Quick Start Guide](./02-quick-start.md) - Get started in 5 minutes
- [Architecture Details](./04-architecture.md) - Deep dive into the system
- [API Reference](./08-client-api.md) - Full API documentation
